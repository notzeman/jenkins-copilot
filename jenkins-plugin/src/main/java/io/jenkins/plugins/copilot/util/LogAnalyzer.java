package io.jenkins.plugins.copilot.util;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * Deterministic console-log analysis.
 *
 * <p>The model never receives a whole console log. This extracts bounded evidence: pipeline stage
 * blocks, failure signals, and a small window around the first high-signal error.
 */
public final class LogAnalyzer {

    private static final Pattern STAGE_OPEN = Pattern.compile("^\\[Pipeline\\] \\{ \\((.+)\\)$");
    private static final Pattern PIPELINE_LINE = Pattern.compile("^\\[Pipeline\\] (.*)$");
    private static final Pattern ANSI = Pattern.compile("\\u001B\\[[;\\d]*[ -/]*[@-~]");

    private static final Map<String, Pattern> SIGNALS = new LinkedHashMap<>();

    static {
        SIGNALS.put("docker", Pattern.compile("(?i)(docker: |failed to solve|docker build|dockerd|cannot connect to the docker daemon|manifest unknown|pull access denied)"));
        SIGNALS.put("registry-auth", Pattern.compile("(?i)(401 unauthorized|403 forbidden|denied: |authentication required|ghcr\\.io.*unauthorized)"));
        SIGNALS.put("python-deps", Pattern.compile("(?i)(modulenotfounderror|no matching distribution|could not find a version|pip.*error)"));
        SIGNALS.put("node-deps", Pattern.compile("(?i)(npm ERR!|yarn error|pnpm ERR_|eresolve)"));
        SIGNALS.put("ssh", Pattern.compile("(?i)(permission denied \\(publickey|ssh: connect|host key verification failed|connection refused.*22)"));
        SIGNALS.put("network", Pattern.compile("(?i)(could not resolve host|temporary failure in name resolution|connection timed out|network is unreachable|tls handshake timeout)"));
        SIGNALS.put("credentials", Pattern.compile("(?i)(could not find credentials entry|credential.*not found|missing credentials|invalid credentials)"));
        SIGNALS.put("env", Pattern.compile("(?i)(environment variable .* not set|undefined variable|keyerror: '[A-Z_]+')"));
        SIGNALS.put("database", Pattern.compile("(?i)(operationalerror|connection to server .* failed|migration.*failed|django\\.db)"));
        SIGNALS.put("kubernetes", Pattern.compile("(?i)(kubectl.*error|helm.*failed|crashloopbackoff|imagepullbackoff|deployment .* not ready)"));
        SIGNALS.put("permissions", Pattern.compile("(?i)(permission denied|operation not permitted|read-only file system)"));
        SIGNALS.put("oom", Pattern.compile("(?i)(outofmemoryerror|oomkilled|killed process|exit code 137)"));
        SIGNALS.put("agent", Pattern.compile("(?i)(no agent|agent is offline|there are no nodes|executor.*not available)"));
        SIGNALS.put("syntax", Pattern.compile("(?i)(workflowscript:|unexpected token|groovy\\.lang\\.multiplecompilationerrorsexception|pipeline.*syntax)"));
        SIGNALS.put("test-failure", Pattern.compile("(?i)(tests failed|test failures|assertionerror|failed tests)"));
        SIGNALS.put("generic-failure", Pattern.compile("(?i)(^ERROR: |\\bFAILURE\\b|fatal: |traceback \\(most recent call last\\))"));
    }

    private LogAnalyzer() {}

    public static JSONObject analyze(String rawLog) {
        String log = ANSI.matcher(rawLog == null ? "" : rawLog).replaceAll("");
        String[] lines = log.split("\n", -1);

        List<JSONObject> stages = new ArrayList<>();
        List<Integer> stageStack = new ArrayList<>();
        List<JSONObject> signals = new ArrayList<>();
        int firstSignalLine = -1;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            Matcher open = STAGE_OPEN.matcher(line);
            if (open.matches()) {
                String name = open.group(1);
                JSONObject stage = Json.obj("name", name, "status", "UNKNOWN", "startLine", i, "endLine", -1);
                stages.add(stage);
                stageStack.add(stages.size() - 1);
                continue;
            }
            if (line.trim().equals("[Pipeline] // stage")) {
                if (!stageStack.isEmpty()) {
                    stages.get(stageStack.remove(stageStack.size() - 1)).put("endLine", i);
                }
                continue;
            }
            for (Map.Entry<String, Pattern> signal : SIGNALS.entrySet()) {
                if (signal.getValue().matcher(line).find()) {
                    if (firstSignalLine < 0 && !"generic-failure".equals(signal.getKey())) {
                        firstSignalLine = i;
                    }
                    if (signals.size() < 20) {
                        signals.add(Json.obj(
                                "kind", signal.getKey(),
                                "line", i + 1,
                                "text", Json.truncate(Redactor.redactText(line.trim()), 400)));
                    }
                    break;
                }
            }
        }

        String failedStage = null;
        if (!stageStack.isEmpty()) {
            failedStage = stages.get(stageStack.get(stageStack.size() - 1)).optString("name", null);
        } else if (!signals.isEmpty() && !stages.isEmpty()) {
            failedStage = stages.get(stages.size() - 1).optString("name", null);
        }
        int failedIndex = -1;
        for (int i = 0; i < stages.size(); i++) {
            if (stages.get(i).optString("name", "").equals(failedStage)) {
                failedIndex = i;
                break;
            }
        }
        for (int i = 0; i < stages.size(); i++) {
            stages.get(i).put("status", i == failedIndex ? "FAILED" : i < failedIndex ? "SUCCESS" : "UNKNOWN");
        }

        if (firstSignalLine < 0 && !signals.isEmpty()) {
            firstSignalLine = signals.get(0).optInt("line", 1) - 1;
        }
        String window = window(lines, firstSignalLine, 40, 12_000);
        return Json.obj(
                "stages", Json.arr(stages),
                "failedStage", failedStage,
                "signals", Json.arr(signals),
                "signalKinds", Json.arr(signals.stream().map(s -> s.optString("kind")).distinct().toList()),
                "window", window,
                "lineCount", lines.length);
    }

    private static String window(String[] lines, int center, int radius, int maxChars) {
        if (center < 0) {
            int start = Math.max(0, lines.length - 60);
            return Json.truncate(Redactor.redactText(String.join("\n", java.util.Arrays.copyOfRange(lines, start, lines.length))), maxChars);
        }
        int start = Math.max(0, center - radius);
        int end = Math.min(lines.length, center + radius);
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < end; i++) {
            sb.append(i + 1).append(": ").append(lines[i]).append('\n');
        }
        return Json.truncate(Redactor.redactText(sb.toString()), maxChars);
    }

    /** Exposed for tests. */
    public static JSONArray stageNames(String log) {
        return analyze(log).getJSONArray("stages");
    }
}
