package io.jenkins.plugins.copilot.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.ops.OperationException;
import io.jenkins.plugins.copilot.tools.ToolCatalog;
import io.jenkins.plugins.copilot.tools.ToolContext;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Persisted pipeline change plans with source-hash guards. */
public class ChangePlanStore {

    public JsonNode proposePipelineUpdate(ToolContext context, JsonNode args) throws Exception {
        String job = args.path("job").asText();
        String jenkinsfile = args.path("jenkinsfile").asText();
        JsonNode source = ToolCatalog.callOperation(
                "get_pipeline_source", Jackson.obj().put("job", job), context.user());
        String kind = source.path("kind").asText("other");
        String sourceHash = source.path("scriptHash").asText("");
        if (!"inline".equals(kind) || sourceHash.isBlank()) {
            throw new IllegalArgumentException(
                    source.path("note").asText(
                            "This pipeline is not inline. For SCM-backed pipelines, prepare a branch and pull request."));
        }
        JsonNode validation = ToolCatalog.callOperation(
                "validate_pipeline",
                Jackson.obj().put("jenkinsfile", jenkinsfile),
                context.user());
        String diff = UnifiedDiff.diff(
                job + "/Jenkinsfile", source.path("script").asText(""), jenkinsfile);
        ChangePlan plan = new ChangePlan();
        plan.setId(UUID.randomUUID().toString());
        plan.setConversationId(context.conversationId());
        plan.setKind("pipeline-update");
        plan.setTarget(job);
        plan.setSourceHash(sourceHash);
        plan.setProposedJson(Jackson.write(Jackson.obj()
                .put("jenkinsfile", jenkinsfile)
                .put("sandbox", args.path("sandbox").asBoolean(source.path("sandbox").asBoolean(true)))
                .put("summary", args.path("summary").asText("Pipeline update"))));
        plan.setDiff(diff);
        plan.setValidationJson(Jackson.write(validation));
        plan.setRisk(3);
        save(plan);
        ObjectNode out = Jackson.obj();
        out.put("planId", plan.getId());
        out.put("target", job);
        out.put("sourceHash", sourceHash);
        out.put("diff", diff);
        out.set("validation", validation);
        out.put("risk", "privileged");
        return out;
    }

    public JsonNode applyPipelineUpdate(ToolContext context, JsonNode args) throws Exception {
        ChangePlan plan = get(context.conversationId(), args.path("planId").asText());
        JsonNode proposed = Jackson.parse(plan.getProposedJson());
        try {
            JsonNode result = ToolCatalog.callOperation(
                    "update_pipeline",
                    Jackson.obj()
                            .put("job", plan.getTarget())
                            .put("jenkinsfile", proposed.path("jenkinsfile").asText())
                            .put("expectedHash", plan.getSourceHash())
                            .put("sandbox", proposed.path("sandbox").asBoolean(true)),
                    context.user());
            plan.setStatus("applied");
            plan.setAppliedAt(System.currentTimeMillis());
            save(plan);
            return result;
        } catch (OperationException e) {
            if (e.getStatus() == 409) {
                plan.setStatus("stale");
                save(plan);
            }
            throw e;
        }
    }

    public JsonNode analyzePipeline(ToolContext context, JsonNode args) throws Exception {
        String job = args.path("job").asText();
        JsonNode source = ToolCatalog.callOperation(
                "get_pipeline_source", Jackson.obj().put("job", job), context.user());
        if (!"inline".equals(source.path("kind").asText()) || source.path("script").asText("").isBlank()) {
            ObjectNode scmOut = Jackson.obj();
            scmOut.put("job", job);
            scmOut.put("kind", source.path("kind").asText("other"));
            scmOut.set("findings", Jackson.arr());
            scmOut.put("note", "Pipeline source is stored in SCM. Analyze the repository Jenkinsfile at the build commit.");
            return scmOut;
        }
        ObjectNode out = Jackson.obj();
        out.put("job", job);
        out.put("kind", "inline");
        out.set("findings", PipelineAnalyzer.analyze(source.path("script").asText()));
        return out;
    }

    public ChangePlan get(String conversationId, String planId) {
        if (!io.jenkins.plugins.copilot.storage.CopilotStorage.isSafeId(planId)) {
            throw new IllegalArgumentException("Invalid plan id");
        }
        File file = file(conversationId, planId);
        if (!file.isFile()) {
            throw new IllegalArgumentException("Change plan not found");
        }
        try {
            return Jackson.MAPPER.readValue(file, ChangePlan.class);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read change plan", e);
        }
    }

    public void save(ChangePlan plan) {
        File file = file(plan.getConversationId(), plan.getId());
        try {
            io.jenkins.plugins.copilot.storage.CopilotStorage.atomicWrite(
                    file, Jackson.MAPPER.writeValueAsBytes(plan));
        } catch (IOException e) {
            throw new IllegalStateException("Could not save change plan", e);
        }
    }

    private File file(String conversationId, String planId) {
        return new File(
                CopilotStorage.dir("change-plans", conversationId),
                planId + ".json");
    }

    static final class PipelineAnalyzer {
        private PipelineAnalyzer() {}

        static JsonNode analyze(String script) {
            List<JsonNode> findings = new ArrayList<>();
            if (!script.matches("(?s).*options\\s*\\{[^}]*timeout\\s*\\(.*")) {
                findings.add(Jackson.obj()
                        .put("id", "missing-timeout")
                        .put("severity", "warning")
                        .put("message", "No pipeline timeout. Add options { timeout(time: 30, unit: 'MINUTES') }."));
            }
            if (!script.contains("disableConcurrentBuilds")) {
                findings.add(Jackson.obj()
                        .put("id", "concurrent-builds")
                        .put("severity", "info")
                        .put("message", "Consider disableConcurrentBuilds() for deployment stages sharing an environment."));
            }
            if (script.matches("(?s).*docker\\s+build.*") && !script.contains("--cache-from") && !script.contains("buildx")) {
                findings.add(Jackson.obj()
                        .put("id", "docker-cache")
                        .put("severity", "warning")
                        .put("message", "Docker builds do not use cache-from or buildx caching."));
            }
            if (!script.contains("cleanWs") && !script.contains("deleteDir")) {
                findings.add(Jackson.obj()
                        .put("id", "workspace-cleanup")
                        .put("severity", "info")
                        .put("message", "No workspace cleanup found. Add cleanWs() in post { always { ... } }."));
            }
            if (!script.contains("post {")) {
                findings.add(Jackson.obj()
                        .put("id", "post-actions")
                        .put("severity", "info")
                        .put("message", "No post block. Add always cleanup and failure notifications."));
            }
            if (script.matches("(?s).*stage\\s*\\([^)]*(test|unit)[^)]*\\).*") && !script.contains("parallel {")) {
                findings.add(Jackson.obj()
                        .put("id", "parallel-tests")
                        .put("severity", "info")
                        .put("message", "Test stages run sequentially. Consider parallel stages."));
            }
            return Jackson.MAPPER.valueToTree(findings);
        }
    }
}
