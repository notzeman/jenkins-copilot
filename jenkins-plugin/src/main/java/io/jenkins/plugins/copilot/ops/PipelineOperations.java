package io.jenkins.plugins.copilot.ops;

import hudson.model.Item;
import hudson.model.Job;
import hudson.model.User;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.JenkinsfileValidator;
import io.jenkins.plugins.copilot.util.Json;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.transform.stream.StreamSource;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition;
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition;
import org.jenkinsci.plugins.workflow.flow.FlowDefinition;
import org.jenkinsci.plugins.workflow.job.WorkflowJob;

/** Pipeline source-of-truth handling. */
public final class PipelineOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("get_pipeline_source", this::getPipelineSource);
        h.put("validate_pipeline", this::validatePipeline);
        h.put("update_pipeline", this::updatePipeline);
        h.put("update_job_config", this::updateJobConfig);
        h.put("scan_pipelines", this::scanPipelines);
        return h;
    }

    private JSONObject getPipelineSource(JSONObject args, User user) throws Exception {
        WorkflowJob job = workflowJob(Json.requireString(args, "job"));
        Items.check(job, Item.EXTENDED_READ, job.getFullName());
        FlowDefinition definition = job.getDefinition();
        if (definition instanceof CpsFlowDefinition cps) {
            return Json.obj(
                    "job", job.getFullName(),
                    "kind", "inline",
                    "script", cps.getScript(),
                    "sandbox", cps.isSandbox(),
                    "scriptHash", JobOperations.sha256(cps.getScript() == null ? "" : cps.getScript()));
        }
        if (definition instanceof CpsScmFlowDefinition scm) {
            return Json.obj(
                    "job", job.getFullName(),
                    "kind", "scm",
                    "scriptPath", scm.getScriptPath(),
                    "lightweight", scm.isLightweight(),
                    "scm", ScmOperations.describe(scm.getScm()),
                    "note", "This pipeline is defined in source control. Modify the repository Jenkinsfile; "
                            + "changing the Jenkins job configuration would be overwritten on the next build.");
        }
        return Json.obj(
                "job", job.getFullName(),
                "kind", "other",
                "definition", definition == null ? null : definition.getClass().getName());
    }

    private JSONObject validatePipeline(JSONObject args, User user) {
        Jenkins.get().checkPermission(Jenkins.READ);
        return JenkinsfileValidator.validate(Json.string(args, "jenkinsfile", ""));
    }

    private JSONObject updatePipeline(JSONObject args, User user) throws Exception {
        WorkflowJob job = workflowJob(Json.requireString(args, "job"));
        Items.check(job, Item.CONFIGURE, job.getFullName());
        String script = Json.string(args, "jenkinsfile", null);
        if (script == null || script.isBlank()) {
            throw OperationException.invalid("jenkinsfile is required");
        }
        FlowDefinition definition = job.getDefinition();
        if (definition instanceof CpsScmFlowDefinition) {
            throw OperationException.unsupported(
                    "This job reads its Jenkinsfile from source control. Open a pull request against the "
                            + "repository instead of editing the job configuration.");
        }
        if (!(definition instanceof CpsFlowDefinition current)) {
            throw OperationException.unsupported("Unsupported pipeline definition: "
                    + (definition == null ? "none" : definition.getClass().getName()));
        }
        String previous = current.getScript() == null ? "" : current.getScript();
        String expected = Json.string(args, "expectedHash", null);
        if (expected == null || expected.isBlank()) {
            throw OperationException.invalid("expectedHash is required; read the pipeline first so the change "
                    + "cannot overwrite a concurrent edit");
        }
        if (!JobOperations.sha256(previous).equals(expected)) {
            throw OperationException.conflict("The pipeline changed since it was read; re-read it and regenerate "
                    + "the change");
        }
        JSONObject validation = JenkinsfileValidator.validate(script);
        boolean sandbox = Json.bool(args, "sandbox", current.isSandbox());
        job.setDefinition(new CpsFlowDefinition(script, sandbox));
        job.save();
        return Json.obj(
                "updated", true,
                "job", job.getFullName(),
                "previousHash", JobOperations.sha256(previous),
                "newHash", JobOperations.sha256(script),
                "validation", validation);
    }

    private static final Pattern STAGE = Pattern.compile(
            "(?m)^\\s*stage\\s*\\(\\s*['\"]([^'\"]+)['\"]\\s*\\)");
    private static final Pattern AGENT_LABEL = Pattern.compile(
            "agent\\s*\\{[^}]*?label\\s+['\"]([^'\"]+)['\"]", Pattern.DOTALL);
    private static final Pattern ENV_KEY = Pattern.compile("(?m)^\\s*([A-Z][A-Z0-9_]+)\\s*=");
    private static final Pattern CREDENTIAL = Pattern.compile(
            "credentials\\s*\\(\\s*['\"]([^'\"]+)['\"]");

    private static final Map<String, Pattern> PIPELINE_FLAGS = new LinkedHashMap<>();

    static {
        PIPELINE_FLAGS.put("docker", Pattern.compile("\\bdocker\\b"));
        PIPELINE_FLAGS.put("kubernetes", Pattern.compile("\\bkubernetes\\b"));
        PIPELINE_FLAGS.put("input", Pattern.compile("\\binput\\s*\\("));
        PIPELINE_FLAGS.put("parallel", Pattern.compile("\\bparallel\\b"));
        PIPELINE_FLAGS.put("when", Pattern.compile("\\bwhen\\s*\\{"));
        PIPELINE_FLAGS.put("post", Pattern.compile("\\bpost\\s*\\{"));
        PIPELINE_FLAGS.put("sharedLibrary", Pattern.compile("@Library\\s*\\("));
        PIPELINE_FLAGS.put("checkout", Pattern.compile("\\bcheckout\\s*\\("));
        PIPELINE_FLAGS.put("junit", Pattern.compile("\\bjunit\\s*\\("));
        PIPELINE_FLAGS.put("archiveArtifacts", Pattern.compile("\\barchiveArtifacts\\s*\\("));
        PIPELINE_FLAGS.put("stash", Pattern.compile("\\bstash\\s*\\("));
        PIPELINE_FLAGS.put("timeout", Pattern.compile("\\btimeout\\s*\\("));
        PIPELINE_FLAGS.put("retry", Pattern.compile("\\bretry\\s*\\("));
        PIPELINE_FLAGS.put("sshagent", Pattern.compile("\\bsshagent\\s*\\("));
    }

    private JSONObject scanPipelines(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Jenkins.READ);
        int limit = Math.min(Math.max(Json.integer(args, "limit", 25), 1), 100);
        String folder = Json.string(args, "folder", null);
        List<String> requested = Json.stringList(args, "jobs");
        List<WorkflowJob> jobs = new ArrayList<>();
        if (!requested.isEmpty()) {
            for (String name : requested) {
                Job<?, ?> job = Items.job(name);
                Items.check(job, Item.EXTENDED_READ, job.getFullName());
                if (!(job instanceof WorkflowJob workflowJob)) {
                    throw OperationException.invalid("Job '" + name + "' is not a Pipeline job");
                }
                jobs.add(workflowJob);
            }
        } else {
            String prefix = folder == null || folder.isBlank() || "/".equals(folder)
                    ? null
                    : folder.replaceAll("/+$", "") + "/";
            for (WorkflowJob job : Jenkins.get().getAllItems(WorkflowJob.class)) {
                if (prefix != null && !job.getFullName().startsWith(prefix)) {
                    continue;
                }
                jobs.add(job);
            }
        }
        Set<String> stages = new LinkedHashSet<>();
        Set<String> agents = new LinkedHashSet<>();
        Set<String> credentials = new LinkedHashSet<>();
        Map<String, Integer> kindCounts = new LinkedHashMap<>();
        JSONArray pipelines = new JSONArray();
        int scanned = 0;
        int skipped = 0;
        for (WorkflowJob job : jobs) {
            if (scanned >= limit) {
                break;
            }
            if (!job.hasPermission(Item.EXTENDED_READ)) {
                skipped++;
                continue;
            }
            FlowDefinition definition = job.getDefinition();
            JSONObject out = Json.obj("job", job.getFullName(), "type", job.getClass().getSimpleName());
            String kind;
            if (definition instanceof CpsFlowDefinition cps) {
                kind = "inline";
                String script = cps.getScript() == null ? "" : cps.getScript();
                List<String> jobStages = matches(STAGE, script, 20);
                List<String> jobAgents = matches(AGENT_LABEL, script, 10);
                List<String> envKeys = matches(ENV_KEY, script, 30);
                List<String> creds = matches(CREDENTIAL, script, 20);
                stages.addAll(jobStages);
                agents.addAll(jobAgents);
                credentials.addAll(creds);
                JSONObject flags = Json.obj();
                for (Map.Entry<String, Pattern> flag : PIPELINE_FLAGS.entrySet()) {
                    flags.put(flag.getKey(), flag.getValue().matcher(script).find());
                }
                out.put("kind", kind);
                out.put("sandbox", cps.isSandbox());
                out.put("stages", Json.arr(jobStages));
                out.put("agentLabels", Json.arr(jobAgents));
                out.put("environmentKeys", Json.arr(envKeys));
                out.put("credentialIds", Json.arr(creds));
                out.put("uses", flags);
                out.put("lineCount", script.isEmpty() ? 0 : script.split("\n", -1).length);
            } else if (definition instanceof CpsScmFlowDefinition scm) {
                kind = "scm";
                out.put("kind", kind);
                out.put("scriptPath", scm.getScriptPath());
                out.put("lightweight", scm.isLightweight());
                out.put("scm", ScmOperations.describe(scm.getScm()));
                out.put("note", "Jenkinsfile lives in source control; inspect the repository file for structure.");
            } else {
                kind = "other";
                out.put("kind", kind);
                out.put("definition", definition == null ? null : definition.getClass().getName());
            }
            kindCounts.merge(kind, 1, Integer::sum);
            pipelines.add(out);
            scanned++;
        }
        JSONObject kinds = Json.obj();
        for (Map.Entry<String, Integer> entry : kindCounts.entrySet()) {
            kinds.put(entry.getKey(), entry.getValue());
        }
        JSONObject patterns = Json.obj(
                "kinds", kinds,
                "stages", Json.arr(stages),
                "agentLabels", Json.arr(agents),
                "credentialIds", Json.arr(credentials));
        return Json.obj(
                "scanned", scanned,
                "skipped", skipped,
                "available", jobs.size(),
                "limit", limit,
                "folder", folder == null || folder.isBlank() ? "/" : folder,
                "pipelines", pipelines,
                "patterns", patterns,
                "note", "Compact evidence only; use get_pipeline_source or repository tools for a representative sample.");
    }

    private static List<String> matches(Pattern pattern, String text, int limit) {
        List<String> out = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        Matcher matcher = pattern.matcher(text);
        while (matcher.find() && out.size() < limit) {
            String value = matcher.group(1).trim();
            if (!value.isBlank() && seen.add(value)) {
                out.add(value);
            }
        }
        return out;
    }

    private JSONObject updateJobConfig(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.CONFIGURE, job.getFullName());
        String xml = Json.string(args, "xml", null);
        if (xml == null || xml.isBlank()) {
            throw OperationException.invalid("xml is required");
        }
        String expected = Json.string(args, "expectedHash", null);
        String current = job.getConfigFile().asString();
        if (expected == null || expected.isBlank()) {
            throw OperationException.invalid("expectedHash is required");
        }
        if (!JobOperations.sha256(current).equals(expected)) {
            throw OperationException.conflict("Job configuration changed since it was read");
        }
        job.updateByXml(new StreamSource(new StringReader(xml)));
        job.save();
        return Json.obj(
                "updated", true,
                "job", job.getFullName(),
                "newHash", JobOperations.sha256(job.getConfigFile().asString()));
    }

    private static WorkflowJob workflowJob(String name) throws Exception {
        Job<?, ?> job = Items.job(name);
        if (!(job instanceof WorkflowJob workflowJob)) {
            throw OperationException.unsupported("Job '" + name + "' is not a Pipeline job");
        }
        return workflowJob;
    }
}
