package io.jenkins.plugins.copilot.ops;

import hudson.model.Item;
import hudson.model.Job;
import hudson.model.User;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.JenkinsfileValidator;
import io.jenkins.plugins.copilot.util.Json;
import java.io.StringReader;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.xml.transform.stream.StreamSource;
import jenkins.model.Jenkins;
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
