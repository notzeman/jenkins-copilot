package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.storage.CopilotStorage;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** Deterministic diagnosis and recovery. The model cannot invent digests or build numbers here. */
public class RecoveryService {

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .proxy(java.net.ProxySelector.getDefault())
            .build();

    public JsonNode diagnose(ToolContext context, String job, Integer number) throws Exception {
        ObjectNode buildArgs = Jackson.obj().put("job", job);
        if (number != null) {
            buildArgs.put("number", number);
        }
        JsonNode build = ToolCatalog.callOperation("get_build_info", buildArgs, context.user());
        int buildNumber = build.path("number").asInt();
        JsonNode failed = ToolCatalog.callOperation(
                "get_failed_stages", Jackson.obj().put("job", job).put("number", buildNumber), context.user());

        List<JsonNode> changes = new ArrayList<>();
        String commitSha = null;
        for (JsonNode set : build.path("changeSets")) {
            for (JsonNode commit : set.path("commits")) {
                changes.add(commit);
                if (commitSha == null && commit.hasNonNull("commitId")) {
                    commitSha = commit.get("commitId").asText();
                }
            }
        }

        List<JsonNode> signals = new ArrayList<>();
        failed.path("signals").forEach(signals::add);
        String category = classify(signals);
        String failedStage = failed.hasNonNull("failedStage") ? failed.get("failedStage").asText() : null;

        JsonNode lastGood = null;
        try {
            JsonNode builds = ToolCatalog.callOperation(
                    "list_builds", Jackson.obj().put("job", job).put("limit", 50), context.user());
            for (JsonNode candidate : builds.path("builds")) {
                if ("SUCCESS".equals(candidate.path("result").asText()) && candidate.path("number").asInt() < buildNumber) {
                    lastGood = candidate;
                    break;
                }
            }
        } catch (Exception ignored) {
            // Last-good is optional evidence.
        }

        String confidence = !"unknown".equals(category) && failedStage != null
                ? "confirmed"
                : !"unknown".equals(category) || !signals.isEmpty() ? "likely" : "hypothesis";

        ObjectNode result = Jackson.obj();
        result.put("job", job);
        result.put("buildNumber", buildNumber);
        result.put("result", build.path("result").asText(null));
        result.put("failedStage", failedStage);
        result.put("category", category);
        result.put("confidence", confidence);
        result.put("summary", failedStage != null
                ? "Build #" + buildNumber + " failed in stage \"" + failedStage + "\"."
                : "Build #" + buildNumber + " failed without a resolved stage boundary.");
        result.put("rootCause", signals.isEmpty()
                ? "No specific failure signature was extracted from the bounded log window."
                : category + ": " + signals.get(0).path("text").asText());
        result.put("window", failed.path("window").asText(""));
        result.put("commitSha", commitSha);
        result.put("recommendation", recommendation(category));
        result.put("risk", risk(category));
        result.set("evidence", Jackson.MAPPER.valueToTree(signals));
        result.set("changes", Jackson.MAPPER.valueToTree(changes));
        result.set("lastGoodBuild", lastGood == null ? Jackson.MAPPER.nullNode() : lastGood);
        result.set("recoveryPlan", Jackson.MAPPER.valueToTree(recoveryPlan(category)));
        return result;
    }

    public JsonNode lastKnownGood(ToolContext context, String job, String environment) throws Exception {
        File file = new File(CopilotStorage.dir("recovery"), "known-good.json");
        if (file.isFile()) {
            try {
                JsonNode root = Jackson.MAPPER.readTree(file);
                JsonNode entry = root.path(job);
                if (entry.isArray() && !entry.isEmpty()) {
                    JsonNode latest = entry.get(entry.size() - 1);
                    ObjectNode stored = Jackson.obj();
                    stored.put("source", "file");
                    stored.put("job", job);
                    stored.put("environment", environment);
                    stored.set("buildNumber", latest.path("buildNumber"));
                    stored.set("commitSha", latest.path("commitSha"));
                    stored.set("jenkinsfileHash", latest.path("jenkinsfileHash"));
                    stored.set("pipelineSource", latest.path("pipelineSource"));
                    return stored;
                }
            } catch (Exception ignored) {
                // Fall through to Jenkins.
            }
        }
        JsonNode builds = ToolCatalog.callOperation(
                "list_builds", Jackson.obj().put("job", job).put("limit", 30), context.user());
        JsonNode candidate = null;
        for (JsonNode build : builds.path("builds")) {
            if ("SUCCESS".equals(build.path("result").asText())) {
                candidate = build;
                break;
            }
        }
        if (candidate == null) {
            throw new IllegalStateException("No successful build found for " + job);
        }
        int number = candidate.path("number").asInt();
        String commitSha = null;
        try {
            JsonNode changes = ToolCatalog.callOperation(
                    "get_build_changes", Jackson.obj().put("job", job).put("number", number), context.user());
            for (JsonNode set : changes.path("changeSets")) {
                for (JsonNode commit : set.path("commits")) {
                    if (commit.hasNonNull("commitId")) {
                        commitSha = commit.get("commitId").asText();
                        break;
                    }
                }
                if (commitSha != null) {
                    break;
                }
            }
        } catch (Exception ignored) {
            // Optional.
        }
        return Jackson.obj()
                .put("source", "jenkins")
                .put("job", job)
                .put("environment", environment)
                .put("buildNumber", number)
                .put("commitSha", commitSha);
    }

    public JsonNode proposeRollback(ToolContext context, String environment) throws Exception {
        JsonNode recovery = loadRecovery();
        JsonNode targets = recovery.path("targets");
        JsonNode target = targets.path(environment);
        JsonNode healthy = null;
        for (JsonNode deployment : recovery.path("history")) {
            if (environment.equals(deployment.path("environment").asText())
                    && "healthy".equals(deployment.path("healthStatus").asText())
                    && deployment.hasNonNull("imageDigest")) {
                healthy = deployment;
            }
        }
        if (healthy == null) {
            throw new IllegalStateException(
                    "No healthy deployment is recorded for environment '" + environment + "'. Refusing to invent a rollback target.");
        }
        String digest = healthy.path("imageDigest").asText();
        if (!digest.matches("(?i)^sha256:[a-f0-9]{64}$")) {
            throw new IllegalStateException("Recorded image digest is not an immutable sha256 digest");
        }
        return Jackson.obj()
                .put("environment", environment)
                .put("targetName", target.path("name").asText(environment))
                .put("imageDigest", digest)
                .put("commitSha", healthy.path("commitSha").asText(null))
                .put("buildNumber", healthy.path("buildNumber").asInt(0))
                .put("healthyAt", healthy.path("deployedAt").asLong(0))
                .put("webhookConfigured", target.hasNonNull("rollbackWebhook"));
    }

    public JsonNode executeRollback(
            ToolContext context, String environment, String digest, String commitSha, Integer buildNumber) throws Exception {
        if (!digest.matches("(?i)^sha256:[a-f0-9]{64}$")) {
            throw new IllegalArgumentException("Rollback requires an immutable sha256 image digest");
        }
        JsonNode recovery = loadRecovery();
        boolean knownHealthy = false;
        for (JsonNode deployment : recovery.path("history")) {
            if (environment.equals(deployment.path("environment").asText())
                    && "healthy".equals(deployment.path("healthStatus").asText())
                    && digest.equals(deployment.path("imageDigest").asText())) {
                knownHealthy = true;
                break;
            }
        }
        if (!knownHealthy) {
            throw new IllegalStateException("The requested digest is not recorded as a healthy deployment for this environment");
        }
        JsonNode target = recovery.path("targets").path(environment);
        String webhook = target.path("rollbackWebhook").asText("");
        if (webhook.isBlank()) {
            throw new IllegalStateException("No rollback webhook is configured for '" + environment + "'");
        }
        String secret = target.path("hmacSecret").asText("");
        ObjectNode payload = Jackson.obj()
                .put("action", "rollback")
                .put("environment", environment)
                .put("imageDigest", digest)
                .put("commitSha", commitSha)
                .put("buildNumber", buildNumber == null ? 0 : buildNumber)
                .put("requestedBy", context.user().getId())
                .put("requestedAt", System.currentTimeMillis());
        String body = Jackson.write(payload);
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(webhook))
                .timeout(Duration.ofSeconds(60))
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        if (!secret.isBlank()) {
            request.header("x-copilot-signature", "sha256=" + hmac(secret, body));
        }
        HttpResponse<String> response = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        ObjectNode deployment = Jackson.obj()
                .put("environment", environment)
                .put("imageDigest", digest)
                .put("commitSha", commitSha)
                .put("buildNumber", buildNumber == null ? 0 : buildNumber)
                .put("healthStatus", "unknown")
                .put("status", "rollback_requested")
                .put("deployedAt", System.currentTimeMillis());
        JsonNode root = loadRecovery();
        ((ArrayNode) root.withArray("history")).add(deployment);
        saveRecovery(root);
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("Rollback webhook returned " + response.statusCode());
        }
        return Jackson.obj()
                .put("triggered", true)
                .put("target", target.path("name").asText(environment))
                .put("response", response.body() == null ? "" : response.body());
    }

    public JsonNode health(ToolContext context, String environment) {
        JsonNode target = loadRecovery().path("targets").path(environment);
        String url = target.path("healthUrl").asText("");
        if (url.isBlank()) {
            throw new IllegalStateException("No health URL is configured for '" + environment + "'");
        }
        try {
            HttpResponse<Void> response = client.send(
                    HttpRequest.newBuilder(URI.create(url))
                            .timeout(Duration.ofSeconds(10))
                            .GET()
                            .build(),
                    HttpResponse.BodyHandlers.discarding());
            return Jackson.obj()
                    .put("healthy", response.statusCode() >= 200 && response.statusCode() < 300)
                    .put("status", response.statusCode())
                    .put("detail", "Health endpoint returned " + response.statusCode());
        } catch (Exception e) {
            return Jackson.obj()
                    .put("healthy", false)
                    .put("status", 0)
                    .put("detail", e.getMessage());
        }
    }

    private JsonNode loadRecovery() {
        File file = new File(CopilotStorage.dir("recovery"), "deployments.json");
        if (!file.isFile()) {
            ObjectNode empty = Jackson.obj();
            empty.set("targets", Jackson.obj());
            empty.set("history", Jackson.arr());
            return empty;
        }
        try {
            return Jackson.MAPPER.readTree(file);
        } catch (Exception e) {
            ObjectNode empty = Jackson.obj();
            empty.set("targets", Jackson.obj());
            empty.set("history", Jackson.arr());
            return empty;
        }
    }

    private void saveRecovery(JsonNode root) throws Exception {
        CopilotStorage.atomicWrite(
                new File(CopilotStorage.dir("recovery"), "deployments.json"), Jackson.write(root));
    }

    private static String hmac(String secret, String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        StringBuilder sb = new StringBuilder();
        for (byte b : mac.doFinal(value.getBytes(StandardCharsets.UTF_8))) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static String classify(List<JsonNode> signals) {
        for (JsonNode signal : signals) {
            String kind = signal.path("kind").asText();
            String category = switch (kind) {
                case "docker" -> "docker";
                case "registry-auth" -> "registry-auth";
                case "python-deps", "node-deps" -> "dependency";
                case "ssh" -> "ssh";
                case "network" -> "network";
                case "credentials" -> "credentials";
                case "env" -> "environment";
                case "database" -> "database";
                case "kubernetes" -> "kubernetes";
                case "permissions" -> "permissions";
                case "oom" -> "memory";
                case "agent" -> "agent";
                case "syntax" -> "pipeline-syntax";
                case "test-failure" -> "application";
                default -> "unknown";
            };
            if (!"unknown".equals(category)) {
                return category;
            }
        }
        return "unknown";
    }

    private static String recommendation(String category) {
        return switch (category) {
            case "application" -> "Inspect the failing tests and the commit that introduced them; fix the application code and add a regression test.";
            case "dependency" -> "Check the lockfile and dependency resolution output, pin the failing package, and verify the registry is reachable.";
            case "docker" -> "Inspect the Dockerfile and daemon state, reproduce the build locally, and check disk space and build context size.";
            case "registry-auth" -> "Verify the registry credential ID, its scope, and that the agent can authenticate to the registry.";
            case "network" -> "Check agent connectivity and DNS, then retry once the network path is healthy.";
            case "ssh" -> "Verify the SSH credential, host key, and target reachability before retrying.";
            case "credentials" -> "Confirm the credential ID exists and is bound to the correct scope; never pass secret values through the assistant.";
            case "environment" -> "Compare the required environment variables with the job configuration and deployment target.";
            case "database" -> "Check database connectivity and migration state; do not retry migrations blindly.";
            case "kubernetes" -> "Inspect rollout status, events, and image pull state before changing application code.";
            case "permissions" -> "Fix file or directory ownership/mode in the build or deployment environment.";
            case "memory" -> "Raise the executor or container memory limit, or reduce build concurrency.";
            case "agent" -> "Bring the agent online or label the job for an available agent; then retry.";
            case "pipeline-syntax" -> "Validate the Jenkinsfile and restore the last known-good revision.";
            default -> "Collect the failing stage output and compare the failing commit with the last successful build before changing anything.";
        };
    }

    private static String risk(String category) {
        return switch (category) {
            case "application", "pipeline-syntax" -> "Any fix changes code or pipeline definition; review the diff and keep a rollback branch.";
            case "infrastructure" -> "No source change should be required.";
            default -> "No source change should be required; avoid changing code to work around infrastructure failures.";
        };
    }

    private static List<String> recoveryPlan(String category) {
        return switch (category) {
            case "application" -> List.of(
                    "Identify the failing test or application exception.",
                    "Compare the failing commit with the last successful build.",
                    "Prepare a minimal patch on a recovery branch and run the tests.");
            case "dependency" -> List.of(
                    "Read the dependency installation section of the log.",
                    "Pin or update the failing dependency.",
                    "Re-run the build; avoid retrying without a change.");
            case "docker" -> List.of(
                    "Inspect the Dockerfile and build context.",
                    "Verify Docker daemon availability and disk space on the agent.",
                    "Retry only after the failure is understood.");
            case "pipeline-syntax" -> List.of(
                    "Compare the Jenkinsfile with the last known-good revision.",
                    "Validate the recovered Jenkinsfile.",
                    "Open a recovery pull request.");
            default -> List.of("Inspect the bounded log window.", "Compare with the last successful build.", "Apply the smallest safe fix.");
        };
    }
}
