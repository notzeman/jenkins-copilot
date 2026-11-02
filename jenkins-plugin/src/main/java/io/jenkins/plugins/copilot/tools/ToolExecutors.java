package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.util.Jackson;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Executors that are not a direct Jenkins operation. */
public final class ToolExecutors {

    private ToolExecutors() {}

    public static JsonNode execute(String executor, JsonNode args, ToolContext context) throws Exception {
        if (executor == null) {
            throw new IllegalArgumentException("Tool has no executor");
        }
        return switch (executor) {
            case "pipeline.propose" -> context.plans().proposePipelineUpdate(context, args);
            case "pipeline.apply" -> context.plans().applyPipelineUpdate(context, args);
            case "pipeline.analyze" -> context.plans().analyzePipeline(context, args);
            case "recovery.diagnose" -> context.recovery().diagnose(
                    context,
                    args.path("job").asText(),
                    args.hasNonNull("number") ? args.get("number").asInt() : null);
            case "recovery.lastGood" -> context.recovery().lastKnownGood(
                    context,
                    args.path("job").asText(),
                    args.path("environment").asText(null));
            case "recovery.proposeRollback" -> context.recovery().proposeRollback(
                    context, args.path("environment").asText());
            case "recovery.executeRollback" -> context.recovery().executeRollback(
                    context,
                    args.path("environment").asText(),
                    args.path("imageDigest").asText(),
                    args.path("commitSha").asText(null),
                    args.hasNonNull("buildNumber") ? args.get("buildNumber").asInt() : null);
            case "recovery.health" -> context.recovery().health(context, args.path("environment").asText());
            case "github.repo" -> githubRepo(context, args);
            case "github.file" -> githubFile(context, args);
            case "github.commit" -> githubCommit(context, args);
            case "github.compare" -> githubCompare(context, args);
            case "github.branch" -> githubBranch(context, args);
            case "github.patch" -> githubPatch(context, args);
            case "github.pr" -> githubPr(context, args);
            default -> throw new IllegalArgumentException("Unknown executor " + executor);
        };
    }

    private static JsonNode githubRepo(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        JsonNode info = context.github().repository(repo);
        String defaultBranch = info.path("default_branch").asText("main");
        String ref = args.path("ref").asText(defaultBranch);
        JsonNode tree = context.github().tree(repo, ref);
        ArrayNode paths = Jackson.arr();
        int count = 0;
        for (JsonNode entry : tree.path("tree")) {
            if (count++ >= 5000) {
                break;
            }
            paths.add(entry.path("path").asText());
        }
        ObjectNode out = Jackson.obj();
        out.put("owner", repo.owner());
        out.put("repo", repo.repo());
        out.put("defaultBranch", defaultBranch);
        out.put("private", info.path("private").asBoolean());
        out.put("language", info.path("language").asText(null));
        out.put("description", info.path("description").asText(null));
        out.put("htmlUrl", info.path("html_url").asText(null));
        out.set("keyFiles", detectKeyFiles(paths));
        out.set("topLevel", topLevel(paths));
        return out;
    }

    private static JsonNode githubFile(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        String path = validatePath(args.path("path").asText());
        String ref = args.path("ref").asText("main");
        JsonNode file = context.github().file(repo, path, ref);
        long size = file.path("size").asLong(0);
        int maxChars = args.path("maxChars").asInt(16_000);
        if (size > 512 * 1024) {
            return Jackson.obj()
                    .put("repo", repo.owner() + "/" + repo.repo())
                    .put("path", path)
                    .put("sha", file.path("sha").asText())
                    .put("bytes", size)
                    .put("content", "")
                    .put("truncated", true)
                    .put("reason", "File is larger than the inspection limit");
        }
        String content = "";
        if ("base64".equals(file.path("encoding").asText())) {
            content = new String(
                    Base64.getMimeDecoder().decode(file.path("content").asText()), StandardCharsets.UTF_8);
        }
        boolean truncated = content.length() > maxChars;
        return Jackson.obj()
                .put("repo", repo.owner() + "/" + repo.repo())
                .put("path", path)
                .put("sha", file.path("sha").asText())
                .put("bytes", size)
                .put("content", truncated ? content.substring(0, maxChars) : content)
                .put("truncated", truncated);
    }

    private static JsonNode githubCommit(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        JsonNode commit = context.github().commit(repo, requireSha(args.path("sha").asText()));
        ArrayNode files = Jackson.arr();
        int count = 0;
        for (JsonNode file : commit.path("files")) {
            if (count++ >= 100) {
                break;
            }
            ObjectNode item = Jackson.obj()
                    .put("filename", file.path("filename").asText())
                    .put("status", file.path("status").asText())
                    .put("additions", file.path("additions").asInt())
                    .put("deletions", file.path("deletions").asInt());
            if (file.hasNonNull("patch")) {
                String patch = file.get("patch").asText();
                item.put("patch", patch.length() > 4000 ? patch.substring(0, 4000) : patch);
            }
            files.add(item);
        }
        ObjectNode out = Jackson.obj();
        out.put("sha", commit.path("sha").asText());
        out.put("message", commit.path("commit").path("message").asText());
        out.put("author", commit.path("commit").path("author").path("name").asText(null));
        out.set("files", files);
        return out;
    }

    private static JsonNode githubCompare(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        JsonNode comparison = context.github().compare(
                repo,
                args.path("base").asText(),
                args.path("head").asText());
        ArrayNode files = Jackson.arr();
        int count = 0;
        for (JsonNode file : comparison.path("files")) {
            if (count++ >= 100) {
                break;
            }
            ObjectNode item = Jackson.obj()
                    .put("filename", file.path("filename").asText())
                    .put("status", file.path("status").asText())
                    .put("additions", file.path("additions").asInt())
                    .put("deletions", file.path("deletions").asInt());
            if (file.hasNonNull("patch")) {
                String patch = file.get("patch").asText();
                item.put("patch", patch.length() > 4000 ? patch.substring(0, 4000) : patch);
            }
            files.add(item);
        }
        ObjectNode out = Jackson.obj();
        out.put("status", comparison.path("status").asText());
        out.put("aheadBy", comparison.path("ahead_by").asInt());
        out.put("behindBy", comparison.path("behind_by").asInt());
        out.set("commits", comparison.path("commits"));
        out.set("files", files);
        return out;
    }

    private static JsonNode githubBranch(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        String branch = args.path("branch").asText();
        if (!branch.matches("^(copilot|recovery)/[A-Za-z0-9._/-]+$") || branch.contains("..")) {
            throw new IllegalArgumentException("Branch must start with copilot/ or recovery/");
        }
        String fromSha = requireSha(args.path("fromSha").asText());
        JsonNode result = context.github().createBranch(repo, branch, fromSha);
        return Jackson.obj()
                .put("repo", repo.owner() + "/" + repo.repo())
                .put("ref", result.path("ref").asText())
                .put("sha", result.path("object").path("sha").asText());
    }

    private static JsonNode githubPatch(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        String branch = args.path("branch").asText();
        if (!branch.matches("^(copilot|recovery)/[A-Za-z0-9._/-]+$") || branch.contains("..")) {
            throw new IllegalArgumentException("Branch must start with copilot/ or recovery/");
        }
        String path = validatePath(args.path("path").asText());
        JsonNode base = context.github().file(repo, path, args.path("baseRef").asText());
        JsonNode result = context.github().putFile(
                repo,
                path,
                branch,
                args.path("message").asText("Apply recovery patch"),
                args.path("content").asText(),
                base.path("sha").asText(null));
        return Jackson.obj()
                .put("path", path)
                .put("branch", branch)
                .put("commitSha", result.path("commit").path("sha").asText())
                .put("url", result.path("content").path("html_url").asText(null));
    }

    private static JsonNode githubPr(ToolContext context, JsonNode args) throws Exception {
        GitHubService.RepoRef repo = requireRepo(args.path("repoUrl").asText());
        String head = args.path("head").asText();
        if (!head.matches("^(copilot|recovery)/[A-Za-z0-9._/-]+$") || head.contains("..")) {
            throw new IllegalArgumentException("Pull request head must be a copilot/ or recovery/ branch");
        }
        JsonNode info = context.github().repository(repo);
        String base = args.path("base").asText(info.path("default_branch").asText("main"));
        JsonNode pr = context.github().createPullRequest(
                repo,
                args.path("title").asText(),
                head,
                base,
                args.path("body").asText(""));
        return Jackson.obj()
                .put("repo", repo.owner() + "/" + repo.repo())
                .put("base", base)
                .put("number", pr.path("number").asInt())
                .put("url", pr.path("html_url").asText());
    }

    private static GitHubService.RepoRef requireRepo(String url) {
        GitHubService.RepoRef repo = GitHubService.parseRepoUrl(url);
        if (repo == null) {
            throw new IllegalArgumentException("Only GitHub repository URLs are supported");
        }
        return repo;
    }

    private static String requireSha(String sha) {
        if (!sha.matches("^[a-f0-9]{7,64}$")) {
            throw new IllegalArgumentException("Invalid commit SHA");
        }
        return sha;
    }

    private static String validatePath(String path) {
        String normalized = path.replace('\\', '/').replaceAll("^/+", "");
        if (normalized.isBlank() || normalized.contains("..") || normalized.contains("\0")) {
            throw new IllegalArgumentException("Invalid repository path");
        }
        return normalized;
    }

    private static JsonNode detectKeyFiles(ArrayNode paths) {
        Map<String, ArrayNode> groups = new LinkedHashMap<>();
        for (String group : List.of("pipeline", "containers", "dependencies", "deployment", "docs")) {
            groups.put(group, Jackson.arr());
        }
        for (JsonNode node : paths) {
            String path = node.asText();
            if (path.matches("(?i)^(.*/)?Jenkinsfile$")) {
                groups.get("pipeline").add(path);
            }
            if (path.matches("(?i)(^|/)(Dockerfile[^/]*|docker-compose[^/]*\\.ya?ml)$")) {
                groups.get("containers").add(path);
            }
            if (path.matches("(?i)(^|/)(requirements[^/]*\\.txt|pyproject\\.toml|package\\.json|package-lock\\.json|pnpm-lock\\.yaml|yarn\\.lock|poetry\\.lock|go\\.mod|Cargo\\.toml)$")) {
                groups.get("dependencies").add(path);
            }
            if (path.matches("(?i)(^|/)(k8s|kubernetes|helm|charts|terraform|deploy|deployment)(/|$).*") || path.matches("(?i).*\\.tf$")) {
                groups.get("deployment").add(path);
            }
            if (path.matches("(?i)(^|/)(AGENTS\\.md|README[^/]*\\.md|CONTRIBUTING[^/]*\\.md)$")) {
                groups.get("docs").add(path);
            }
        }
        ObjectNode out = Jackson.obj();
        groups.forEach(out::set);
        return out;
    }

    private static JsonNode topLevel(ArrayNode paths) {
        ArrayNode top = Jackson.arr();
        for (JsonNode path : paths) {
            String value = path.asText();
            if (!value.contains("/")) {
                top.add(value);
            }
            if (top.size() >= 100) {
                break;
            }
        }
        return top;
    }
}
