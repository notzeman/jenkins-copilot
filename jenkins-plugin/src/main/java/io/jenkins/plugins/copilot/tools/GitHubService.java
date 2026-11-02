package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.util.Jackson;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

/** Minimal GitHub REST client for repository inspection and recovery pull requests. */
public class GitHubService {

    public record RepoRef(String owner, String repo) {}

    private final String token;
    private final String apiUrl;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NEVER)
            .proxy(java.net.ProxySelector.getDefault())
            .build();

    public GitHubService(String token, String apiUrl) {
        this.token = token;
        this.apiUrl = (apiUrl == null || apiUrl.isBlank() ? "https://api.github.com" : apiUrl)
                .replaceAll("/+$", "");
    }

    public boolean configured() {
        return token != null && !token.isBlank();
    }

    public static RepoRef parseRepoUrl(String value) {
        if (value == null) {
            return null;
        }
        String url = value.trim().replaceAll("\\.git$", "").replaceAll("/+$", "");
        java.util.regex.Matcher https =
                java.util.regex.Pattern.compile("^https?://(?:[^@/]+@)?github\\.com/([^/]+)/([^/]+)$", java.util.regex.Pattern.CASE_INSENSITIVE)
                        .matcher(url);
        if (https.matches()) {
            return new RepoRef(https.group(1), https.group(2));
        }
        java.util.regex.Matcher ssh = java.util.regex.Pattern
                .compile("^git@github\\.com:([^/]+)/([^/]+)$", java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(url);
        if (ssh.matches()) {
            return new RepoRef(ssh.group(1), ssh.group(2));
        }
        return null;
    }

    public JsonNode repository(RepoRef repo) throws Exception {
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo(), "GET", null);
    }

    public JsonNode tree(RepoRef repo, String ref) throws Exception {
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/git/trees/"
                + enc(ref) + "?recursive=1", "GET", null);
    }

    public JsonNode file(RepoRef repo, String path, String ref) throws Exception {
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/contents/"
                + encodePath(path) + "?ref=" + enc(ref), "GET", null);
    }

    public JsonNode commit(RepoRef repo, String sha) throws Exception {
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/commits/" + enc(sha), "GET", null);
    }

    public JsonNode compare(RepoRef repo, String base, String head) throws Exception {
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/compare/"
                + enc(base) + "..." + enc(head), "GET", null);
    }

    public JsonNode createBranch(RepoRef repo, String branch, String fromSha) throws Exception {
        ObjectNode body = Jackson.obj()
                .put("ref", "refs/heads/" + branch)
                .put("sha", fromSha);
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/git/refs", "POST", body);
    }

    public JsonNode putFile(
            RepoRef repo,
            String path,
            String branch,
            String message,
            String content,
            String previousSha)
            throws Exception {
        ObjectNode body = Jackson.obj()
                .put("message", message)
                .put("content", Base64.getEncoder().encodeToString(content.getBytes(StandardCharsets.UTF_8)))
                .put("branch", branch);
        if (previousSha != null && !previousSha.isBlank()) {
            body.put("sha", previousSha);
        }
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/contents/" + encodePath(path), "PUT", body);
    }

    public JsonNode createPullRequest(
            RepoRef repo, String title, String head, String base, String bodyText) throws Exception {
        ObjectNode body = Jackson.obj()
                .put("title", title)
                .put("head", head)
                .put("base", base)
                .put("body", bodyText == null ? "" : bodyText);
        return request(repo, "/repos/" + repo.owner() + "/" + repo.repo() + "/pulls", "POST", body);
    }

    private JsonNode request(RepoRef repo, String path, String method, JsonNode body) throws Exception {
        if (!configured()) {
            throw new IllegalStateException("No GitHub token is configured. Add one in Jenkins AI Copilot configuration.");
        }
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(apiUrl + path))
                .timeout(Duration.ofSeconds(30))
                .header("accept", "application/vnd.github+json")
                .header("authorization", "Bearer " + token)
                .header("x-github-api-version", "2022-11-28")
                .header("user-agent", "jenkins-ai-copilot");
        if (body == null) {
            builder.GET();
        } else {
            builder.header("content-type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(Jackson.write(body), StandardCharsets.UTF_8));
        }
        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        JsonNode parsed = response.body() == null || response.body().isBlank()
                ? Jackson.obj()
                : Jackson.parse(response.body());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException(
                    "GitHub API returned " + response.statusCode() + ": " + parsed.path("message").asText("error"));
        }
        return parsed;
    }

    private static String enc(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String encodePath(String path) {
        return enc(path).replace("%2F", "/");
    }
}
