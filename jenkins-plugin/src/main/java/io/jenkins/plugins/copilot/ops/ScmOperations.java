package io.jenkins.plugins.copilot.ops;

import hudson.model.Item;
import hudson.model.Job;
import hudson.model.User;
import hudson.scm.SCM;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.Json;
import io.jenkins.plugins.copilot.util.Redactor;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition;
import org.jenkinsci.plugins.workflow.flow.FlowDefinition;
import org.jenkinsci.plugins.workflow.job.WorkflowJob;

/** Read-only SCM metadata. Credential values are never read. */
public final class ScmOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("get_scm_info", this::getScmInfo);
        return h;
    }

    private JSONObject getScmInfo(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.READ, job.getFullName());
        SCM scm = null;
        String source = null;
        String scriptPath = null;
        if (job instanceof WorkflowJob workflowJob) {
            FlowDefinition definition = workflowJob.getDefinition();
            if (definition instanceof CpsScmFlowDefinition scmDefinition) {
                scm = scmDefinition.getScm();
                source = "pipeline-definition";
                scriptPath = scmDefinition.getScriptPath();
            }
        }
        if (scm == null && job instanceof hudson.model.AbstractProject<?, ?> project) {
            scm = project.getScm();
            source = "job-scm";
        }
        if (scm == null) {
            return Json.obj("job", job.getFullName(), "available", false,
                    "reason", "No SCM configured for this job.");
        }
        JSONObject out = Json.obj("job", job.getFullName(), "available", true, "source", source);
        if (scriptPath != null) {
            out.put("scriptPath", scriptPath);
        }
        out.putAll(describe(scm));
        return out;
    }

    public static JSONObject describe(SCM scm) {
        if (scm == null) {
            return Json.obj("type", null, "available", false);
        }
        JSONObject out = Json.obj("type", scm.getType(), "key", scm.getKey());
        if (!"hudson.plugins.git.GitSCM".equals(scm.getClass().getName())) {
            return out;
        }
        try {
            Method remoteMethod = scm.getClass().getMethod("getUserRemoteConfigs");
            JSONArray remotes = new JSONArray();
            for (Object config : (List<?>) remoteMethod.invoke(scm)) {
                String url = stringMethod(config, "getUrl");
                String credentialsId = stringMethod(config, "getCredentialsId");
                remotes.add(Json.obj(
                        "url", Redactor.stripCredentialsFromUrl(url),
                        "credentialsId", credentialsId));
            }
            out.put("remotes", remotes);

            Method branchesMethod = scm.getClass().getMethod("getBranches");
            JSONArray branches = new JSONArray();
            for (Object branch : (List<?>) branchesMethod.invoke(scm)) {
                String name = stringMethod(branch, "getName");
                branches.add(name == null ? String.valueOf(branch) : name);
            }
            out.put("branches", branches);
        } catch (Exception e) {
            out.put("detailError", e.getClass().getSimpleName());
        }
        return out;
    }

    private static String stringMethod(Object target, String method) {
        try {
            Object value = target.getClass().getMethod(method).invoke(target);
            return value == null ? null : String.valueOf(value);
        } catch (Exception e) {
            return null;
        }
    }
}
