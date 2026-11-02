package io.jenkins.plugins.copilot.ops;

import hudson.model.AbstractBuild;
import hudson.model.Action;
import hudson.model.BooleanParameterValue;
import hudson.model.Cause;
import hudson.model.CauseAction;
import hudson.model.Executor;
import hudson.model.Item;
import hudson.model.Job;
import hudson.model.ParameterValue;
import hudson.model.ParametersAction;
import hudson.model.Result;
import hudson.model.Run;
import hudson.model.StringParameterValue;
import hudson.model.User;
import hudson.scm.ChangeLogSet;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.Json;
import io.jenkins.plugins.copilot.util.LogAnalyzer;
import io.jenkins.plugins.copilot.util.Redactor;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jenkins.model.Jenkins;
import jenkins.model.ParameterizedJobMixIn;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Build inspection, execution, and log operations. */
public final class BuildOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_builds", this::listBuilds);
        h.put("get_build_info", this::getBuildInfo);
        h.put("get_build_status", this::getBuildStatus);
        h.put("get_console_log", this::getConsoleLog);
        h.put("get_failed_stages", this::getFailedStages);
        h.put("get_test_results", this::getTestResults);
        h.put("get_build_parameters", this::getBuildParameters);
        h.put("get_changed_files", this::getChangedFiles);
        h.put("trigger_build", this::triggerBuild);
        h.put("trigger_build_with_parameters", this::triggerBuild);
        h.put("abort_build", this::abortBuild);
        h.put("retry_build", this::retryBuild);
        h.put("restart_pipeline_from_stage", this::restartFromStage);
        return h;
    }

    private JSONObject listBuilds(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.READ, job.getFullName());
        int limit = Math.min(Math.max(Json.integer(args, "limit", 20), 1), 200);
        int offset = Math.max(Json.integer(args, "offset", 0), 0);
        List<JSONObject> builds = new ArrayList<>();
        int index = 0;
        for (Run<?, ?> run : job.getBuilds()) {
            if (index++ < offset) {
                continue;
            }
            if (builds.size() >= limit) {
                break;
            }
            builds.add(JobOperations.buildRef(run));
        }
        return Json.obj("job", job.getFullName(), "builds", Json.arr(builds), "offset", offset, "limit", limit);
    }

    private JSONObject getBuildInfo(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        JSONObject out = JobOperations.buildRef(run);
        out.put("job", run.getParent().getFullName());
        out.put("description", run.getDescription());
        out.put("result", run.getResult() == null ? null : run.getResult().toString());
        out.put("durationMs", run.getDuration());
        out.put("estimatedDurationMs", run.getEstimatedDuration());
        out.put("startTime", run.getTimeInMillis());
        out.put("queueId", run.getQueueId());
        out.put("builtOn", builtOn(run));
        out.put("keepLog", run.isKeepLog());
        JSONArray causes = new JSONArray();
        for (Cause cause : run.getCauses()) {
            causes.add(Json.obj("type", cause.getClass().getSimpleName(), "shortDescription", cause.getShortDescription()));
        }
        out.put("causes", causes);
        out.put("parameters", parameters(run));
        out.put("changeSets", changeSets(run));
        return out;
    }

    private JSONObject getBuildStatus(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        JSONObject out = Json.obj(
                "job", run.getParent().getFullName(),
                "number", run.getNumber(),
                "result", run.getResult() == null ? null : run.getResult().toString(),
                "building", run.isBuilding(),
                "durationMs", run.getDuration(),
                "url", JobOperations.absoluteUrl(run.getUrl()));
        if (run.getResult() == Result.FAILURE || run.getResult() == Result.UNSTABLE) {
            JSONObject analysis = LogAnalyzer.analyze(String.join("\n", run.getLog(4000)));
            out.put("failedStage", analysis.optString("failedStage", null));
            out.put("signals", analysis.optJSONArray("signals"));
        }
        return out;
    }

    private JSONObject getConsoleLog(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        int tailLines = Math.min(Math.max(Json.integer(args, "tailLines", 300), 1), 2000);
        String grep = Json.string(args, "grep", null);
        int fetch = grep == null ? tailLines : Math.min(Math.max(tailLines * 10, 2000), 5000);
        List<String> lines = run.getLog(fetch);
        List<String> selected;
        if (grep != null && !grep.isBlank()) {
            java.util.regex.Pattern pattern;
            try {
                pattern = java.util.regex.Pattern.compile(grep);
            } catch (Exception e) {
                throw OperationException.invalid("Invalid grep pattern: " + e.getMessage());
            }
            selected = lines.stream().filter(l -> pattern.matcher(l).find()).toList();
            if (selected.size() > tailLines) {
                selected = selected.subList(selected.size() - tailLines, selected.size());
            }
        } else {
            selected = lines.size() <= tailLines ? lines : lines.subList(lines.size() - tailLines, lines.size());
        }
        String text = String.join("\n", selected);
        return Json.obj(
                "job", run.getParent().getFullName(),
                "number", run.getNumber(),
                "lines", Json.arr(selected),
                "text", Json.truncate(Redactor.redactText(text), 60_000),
                "returnedLines", selected.size(),
                "truncated", text.length() > 60_000);
    }

    private JSONObject getFailedStages(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        JSONObject analysis = LogAnalyzer.analyze(String.join("\n", run.getLog(10_000)));
        analysis.put("job", run.getParent().getFullName());
        analysis.put("number", run.getNumber());
        analysis.put("result", run.getResult() == null ? null : run.getResult().toString());
        return analysis;
    }

    private JSONObject getTestResults(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        if (Jenkins.get().getPlugin("junit") == null) {
            return Json.obj("available", false, "reason", "The JUnit plugin is not installed.");
        }
        return TestResults.summarize(run, Math.min(Math.max(Json.integer(args, "limit", 20), 1), 100));
    }

    private JSONObject getBuildParameters(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        return Json.obj("job", run.getParent().getFullName(), "number", run.getNumber(), "parameters", parameters(run));
    }

    private JSONObject getChangedFiles(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        return Json.obj(
                "job", run.getParent().getFullName(),
                "number", run.getNumber(),
                "changeSets", changeSets(run));
    }

    private JSONObject triggerBuild(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.BUILD, job.getFullName());
        List<Action> actions = new ArrayList<>();
        actions.add(new CauseAction(new Cause.UserIdCause(user.getId())));
        JSONObject parameters = Json.object(args, "parameters");
        if (!parameters.isEmpty()) {
            actions.add(new ParametersAction(parameterValues(parameters)));
        }
        hudson.model.Queue.Item item =
                ParameterizedJobMixIn.scheduleBuild2(job, 0, actions.toArray(new Action[0]));
        return Json.obj(
                "job", job.getFullName(),
                "queued", item != null,
                "queueId", item == null ? null : item.getId(),
                "url", JobOperations.absoluteUrl(job.getUrl()),
                "parameters", parameters);
    }

    private JSONObject abortBuild(JSONObject args, User user) throws Exception {
        Run<?, ?> run = resolveRun(args);
        Items.check(run.getParent(), Item.CANCEL, run.getParent().getFullName());
        Executor executor = run.getExecutor();
        if (executor == null) {
            executor = run.getOneOffExecutor();
        }
        if (executor == null) {
            throw OperationException.invalid("Build #" + run.getNumber() + " is not running");
        }
        executor.interrupt(Result.ABORTED);
        return Json.obj("job", run.getParent().getFullName(), "number", run.getNumber(), "aborted", true);
    }

    private JSONObject retryBuild(JSONObject args, User user) throws Exception {
        Run<?, ?> original = resolveRun(args);
        Job<?, ?> job = original.getParent();
        Items.check(job, Item.BUILD, job.getFullName());
        List<Action> actions = new ArrayList<>();
        actions.add(new CauseAction(new Cause.UserIdCause(user.getId())));
        ParametersAction params = original.getAction(ParametersAction.class);
        if (params != null) {
            actions.add(new ParametersAction(params.getParameters()));
        }
        ParameterizedJobMixIn.scheduleBuild2(job, 0, actions.toArray(new Action[0]));
        return Json.obj("job", job.getFullName(), "retriedFrom", original.getNumber(), "queued", true);
    }

    private JSONObject restartFromStage(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.BUILD, job.getFullName());
        String stage = Json.requireString(args, "stage");
        boolean supported = job.getProperty(hudson.model.ParametersDefinitionProperty.class) != null
                && job.getProperty(hudson.model.ParametersDefinitionProperty.class).getParameterDefinitions().stream()
                        .anyMatch(d -> "RESTART_FROM_STAGE".equals(d.getName()));
        if (!supported) {
            throw OperationException.unsupported(
                    "This job has no RESTART_FROM_STAGE parameter. Restart-from-stage is not an open-source "
                            + "Jenkins feature; use retry_build, or implement the parameter in the pipeline.");
        }
        JSONObject parameters = Json.obj("RESTART_FROM_STAGE", stage);
        return triggerBuild(Json.obj("job", job.getFullName(), "parameters", parameters), user);
    }

    private Run<?, ?> resolveRun(JSONObject args) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.READ, job.getFullName());
        int number = Json.integer(args, "number", -1);
        if (number <= 0) {
            Run<?, ?> last = job.getLastBuild();
            if (last == null) {
                throw OperationException.notFound("Job " + job.getFullName() + " has no builds");
            }
            return last;
        }
        return Items.run(job, number);
    }

    private static List<ParameterValue> parameterValues(JSONObject parameters) throws OperationException {
        List<ParameterValue> values = new ArrayList<>();
        for (Object rawKey : parameters.keySet()) {
            String name = String.valueOf(rawKey);
            if (Redactor.isSensitiveKey(name)) {
                throw OperationException.invalid(
                        "Refusing to accept secret parameter '" + name + "' through the assistant; use a Jenkins credential.");
            }
            Object value = parameters.get(rawKey);
            if (value instanceof Boolean bool) {
                values.add(new BooleanParameterValue(name, bool));
            } else {
                values.add(new StringParameterValue(name, String.valueOf(value)));
            }
        }
        return values;
    }

    private static JSONArray parameters(Run<?, ?> run) {
        JSONArray out = new JSONArray();
        ParametersAction action = run.getAction(ParametersAction.class);
        if (action == null) {
            return out;
        }
        for (ParameterValue value : action.getParameters()) {
            Object raw = value.getValue();
            out.add(Json.obj(
                    "name", value.getName(),
                    "value", Redactor.isSensitiveKey(value.getName()) ? "[redacted]" : raw,
                    "type", value.getClass().getSimpleName()));
        }
        return out;
    }

    private static String builtOn(Run<?, ?> run) {
        try {
            Object value = run.getClass().getMethod("getBuiltOnStr").invoke(run);
            return value == null ? null : String.valueOf(value);
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private static JSONArray changeSets(Run<?, ?> run) {
        JSONArray sets = new JSONArray();
        java.util.List<ChangeLogSet<? extends ChangeLogSet.Entry>> changeSets;
        try {
            changeSets = (java.util.List<ChangeLogSet<? extends ChangeLogSet.Entry>>)
                    run.getClass().getMethod("getChangeSets").invoke(run);
        } catch (Exception e) {
            return sets;
        }
        for (ChangeLogSet<? extends ChangeLogSet.Entry> set : changeSets) {
            JSONArray commits = new JSONArray();
            int count = 0;
            for (ChangeLogSet.Entry entry : set) {
                if (count++ >= 100) {
                    break;
                }
                commits.add(Json.obj(
                        "commitId", entry.getCommitId(),
                        "author", entry.getAuthor() == null ? null : entry.getAuthor().getFullName(),
                        "message", Json.truncate(entry.getMsg(), 2000),
                        "timestamp", entry.getTimestamp(),
                        "affectedPaths", Json.arr(entry.getAffectedPaths())));
            }
            sets.add(Json.obj("kind", set.getKind(), "commits", commits));
        }
        return sets;
    }

    /** Isolated so a missing JUnit plugin cannot break class loading. */
    private static final class TestResults {
        static JSONObject summarize(Run<?, ?> run, int limit) throws Exception {
            Class<?> actionClass = Class.forName("hudson.tasks.junit.TestResultAction");
            Object action = run.getAction((Class) actionClass);
            if (action == null) {
                return Json.obj("available", false, "reason", "No test results recorded for this build.");
            }
            Object result = actionClass.getMethod("getResult").invoke(action);
            Method getFailCount = result.getClass().getMethod("getFailCount");
            Method getSkipCount = result.getClass().getMethod("getSkipCount");
            Method getPassCount = result.getClass().getMethod("getPassCount");
            Method getFailedTests = result.getClass().getMethod("getFailedTests");
            int failCount = (int) getFailCount.invoke(result);
            int skipCount = (int) getSkipCount.invoke(result);
            int passCount = (int) getPassCount.invoke(result);
            JSONArray failed = new JSONArray();
            for (Object test : (Iterable<?>) getFailedTests.invoke(result)) {
                if (failed.size() >= limit) {
                    break;
                }
                Class<?> testClass = test.getClass();
                failed.add(Json.obj(
                        "name", testClass.getMethod("getName").invoke(test),
                        "fullName", testClass.getMethod("getFullName").invoke(test),
                        "errorDetails", Json.truncate(
                                Redactor.redactText(String.valueOf(testClass.getMethod("getErrorStackTrace").invoke(test))),
                                4000)));
            }
            return Json.obj(
                    "available", true,
                    "total", failCount + skipCount + passCount,
                    "failed", failCount,
                    "skipped", skipCount,
                    "passed", passCount,
                    "failedTests", failed);
        }
    }
}
