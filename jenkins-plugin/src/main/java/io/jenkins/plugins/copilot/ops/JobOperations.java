package io.jenkins.plugins.copilot.ops;

import hudson.model.AbstractProject;
import hudson.model.BallColor;
import hudson.model.HealthReport;
import hudson.model.Item;
import hudson.model.ItemGroup;
import hudson.model.Job;
import hudson.model.ParameterDefinition;
import hudson.model.ParametersDefinitionProperty;
import hudson.model.Run;
import hudson.model.TopLevelItem;
import hudson.model.User;
import hudson.security.AccessControlled;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.Json;
import io.jenkins.plugins.copilot.util.Redactor;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.xml.transform.stream.StreamSource;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition;
import org.jenkinsci.plugins.workflow.flow.FlowDefinition;
import org.jenkinsci.plugins.workflow.job.WorkflowJob;

/** Job, folder, and pipeline-job lifecycle operations. */
@SuppressWarnings("restriction")
public final class JobOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_jobs", this::listJobs);
        h.put("list_folders", this::listFolders);
        h.put("get_job_info", this::getJobInfo);
        h.put("get_job_config", this::getJobConfig);
        h.put("create_job", this::createJob);
        h.put("copy_job", this::copyJob);
        h.put("rename_job", this::renameJob);
        h.put("move_job", this::moveJob);
        h.put("delete_job", this::deleteJob);
        h.put("enable_job", (a, u) -> setDisabled(a, u, false));
        h.put("disable_job", (a, u) -> setDisabled(a, u, true));
        h.put("get_job_health", this::getJobHealth);
        h.put("get_job_last_build", this::getJobLastBuild);
        return h;
    }

    private JSONObject listJobs(JSONObject args, User user) throws Exception {
        String folder = Json.string(args, "folder", null);
        int limit = Math.min(Math.max(Json.integer(args, "limit", 100), 1), 500);
        String prefix = folder == null || folder.isBlank() ? null : folder.replaceAll("/+$", "") + "/";
        List<JSONObject> out = new ArrayList<>();
        for (Job<?, ?> job : Jenkins.get().getAllItems(Job.class)) {
            if (prefix != null && !job.getFullName().startsWith(prefix)) {
                continue;
            }
            if (prefix == null && job.getFullName().contains("/")) {
                continue;
            }
            if (!job.hasPermission(Item.READ)) {
                continue;
            }
            out.add(summary(job));
            if (out.size() >= limit) {
                break;
            }
        }
        return Json.obj("jobs", Json.arr(out), "count", out.size(), "limit", limit);
    }

    private JSONObject listFolders(JSONObject args, User user) {
        int limit = Math.min(Math.max(Json.integer(args, "limit", 100), 1), 500);
        List<JSONObject> out = new ArrayList<>();
        for (hudson.model.AbstractItem item : Jenkins.get().getAllItems(hudson.model.AbstractItem.class)) {
            if (!(item instanceof com.cloudbees.hudson.plugins.folder.AbstractFolder<?> folder)) {
                continue;
            }
            if (!folder.hasPermission(Item.READ)) {
                continue;
            }
            out.add(Json.obj(
                    "fullName", folder.getFullName(),
                    "name", folder.getName(),
                    "url", absoluteUrl(folder.getUrl()),
                    "description", folder.getDescription(),
                    "type", folder.getClass().getSimpleName()));
            if (out.size() >= limit) {
                break;
            }
        }
        return Json.obj("folders", Json.arr(out), "count", out.size());
    }

    private JSONObject getJobInfo(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.READ, job.getFullName());
        JSONObject out = summary(job);
        out.put("health", health(job));
        out.put("parameters", parameters(job));
        out.put("properties", propertyNames(job));
        if (job instanceof WorkflowJob workflowJob) {
            out.put("definition", definitionSummary(workflowJob));
        }
        Run<?, ?> lastSuccessful = job.getLastSuccessfulBuild();
        Run<?, ?> lastFailed = job.getLastFailedBuild();
        out.put("lastSuccessfulBuild", lastSuccessful == null ? null : buildRef(lastSuccessful));
        out.put("lastFailedBuild", lastFailed == null ? null : buildRef(lastFailed));
        out.put("lastStableBuild", job.getLastStableBuild() == null ? null : buildRef(job.getLastStableBuild()));
        return out;
    }

    private JSONObject getJobConfig(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.EXTENDED_READ, job.getFullName());
        String xml = job.getConfigFile().asString();
        boolean truncated = xml.length() > 200_000;
        String value = truncated ? xml.substring(0, 200_000) : xml;
        return Json.obj(
                "job", job.getFullName(),
                "xml", Redactor.redactXml(value),
                "truncated", truncated,
                "sha256", sha256(xml));
    }

    private JSONObject createJob(JSONObject args, User user) throws Exception {
        String name = Json.requireString(args, "name");
        String folder = Json.string(args, "folder", null);
        String type = Json.string(args, "type", "pipeline");
        String description = Json.string(args, "description", "");
        ItemGroup<?> parent = Items.group(folder);
        if (parent instanceof AccessControlled ac) {
            Items.check(ac, Item.CREATE, parent instanceof Jenkins ? "Jenkins" : folder);
        }
        if (Jenkins.get().getItemByFullName(childName(folder, name)) != null) {
            throw OperationException.invalid("An item named '" + childName(folder, name) + "' already exists");
        }

        TopLevelItem created;
        if ("freestyle".equalsIgnoreCase(type)) {
            hudson.model.FreeStyleProject project = new hudson.model.FreeStyleProject(
                    (ItemGroup) parent, name);
            project.setDescription(description);
            created = project;
        } else if ("pipeline".equalsIgnoreCase(type)) {
            String script = Json.string(args, "jenkinsfile", null);
            if (script == null || script.isBlank()) {
                throw OperationException.invalid("jenkinsfile is required for pipeline jobs");
            }
            WorkflowJob workflowJob = new WorkflowJob((ItemGroup) parent, name);
            workflowJob.setDescription(description);
            workflowJob.setDefinition(new CpsFlowDefinition(script, Json.bool(args, "sandbox", true)));
            created = workflowJob;
        } else {
            throw OperationException.invalid("type must be 'pipeline' or 'freestyle'");
        }
        add(parent, created);
        created.save();
        return Json.obj("created", true, "job", summary((Job<?, ?>) created));
    }

    @SuppressWarnings("restriction")
    private JSONObject copyJob(JSONObject args, User user) throws Exception {
        String sourceName = Json.requireString(args, "source");
        String name = Json.requireString(args, "name");
        String folder = Json.string(args, "folder", null);
        Job<?, ?> source = Items.job(sourceName);
        Items.check(source, Item.READ, sourceName);
        Items.check(source, Item.EXTENDED_READ, sourceName);
        if (folder != null && !folder.isBlank()) {
            throw OperationException.unsupported(
                    "copy_job currently supports the Jenkins root only; omit 'folder'");
        }
        if (Jenkins.get().getItem(name) != null) {
            throw OperationException.invalid("An item named '" + name + "' already exists");
        }
        if (!(source instanceof TopLevelItem topLevelItem)) {
            throw OperationException.unsupported("source is not a top-level item");
        }
        Jenkins.get().checkPermission(Item.CREATE);
        TopLevelItem copy = Jenkins.get().copy(topLevelItem, name);
        Job<?, ?> copyJob = (Job<?, ?>) copy;
        if (copyJob instanceof WorkflowJob workflowJob) {
            setWorkflowDisabled(workflowJob, true);
        } else if (copyJob instanceof AbstractProject<?, ?> project) {
            project.disable();
        }
        String xml = copyJob.getConfigFile().asString();
        String sanitized = xml.replaceAll("(?s)<triggers>.*?</triggers>", "<triggers/>");
        copyJob.updateByXml(new StreamSource(new StringReader(sanitized)));
        copyJob.save();
        return Json.obj(
                "created", true,
                "job", summary(copyJob),
                "sanitized", true,
                "notes", Json.arr(List.of(
                        "Copied job is disabled.",
                        "Triggers were removed; re-enable them deliberately.",
                        "Credential references were copied by ID only; no secret values were read.",
                        "Review environment-specific URLs, hostnames, and deployment targets.")));
    }

    private JSONObject renameJob(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.CONFIGURE, job.getFullName());
        if (job.getParent() instanceof AccessControlled parent) {
            Items.check(parent, Item.CREATE, job.getParent().getFullName());
        }
        String newName = Json.requireString(args, "newName").trim();
        if (job.getParent() != null && job.getParent().getItem(newName) != null) {
            throw OperationException.conflict("An item named '" + newName + "' already exists in the parent folder");
        }
        String oldName = job.getFullName();
        job.renameTo(newName);
        job.save();
        return Json.obj("renamed", true, "oldName", oldName, "newName", job.getFullName());
    }

    private JSONObject moveJob(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.CONFIGURE, job.getFullName());
        String targetName = Json.requireString(args, "folder");
        ItemGroup<?> target = Items.group(targetName);
        if (!(target instanceof jenkins.model.DirectlyModifiableTopLevelItemGroup destination)) {
            throw OperationException.unsupported("Jobs can only be moved to Jenkins or a folder");
        }
        if (target instanceof AccessControlled controlled) {
            Items.check(controlled, Item.CREATE, targetName);
        }
        if (!(job instanceof hudson.model.TopLevelItem)) {
            throw OperationException.unsupported("Only top-level jobs can be moved");
        }
        hudson.model.Items.move(
                (hudson.model.AbstractItem & hudson.model.TopLevelItem) job, destination);
        return Json.obj("moved", true, "job", job.getFullName(), "folder", targetName);
    }

    private JSONObject deleteJob(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.DELETE, job.getFullName());
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete a job");
        }
        String fullName = job.getFullName();
        String backup = Redactor.redactXml(job.getConfigFile().asString());
        job.delete();
        return Json.obj("deleted", true, "job", fullName, "configBackup", backup);
    }

    @SuppressWarnings("restriction")
    private JSONObject setDisabled(JSONObject args, User user, boolean disabled) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.CONFIGURE, job.getFullName());
        if (job instanceof WorkflowJob workflowJob) {
            setWorkflowDisabled(workflowJob, disabled);
            workflowJob.save();
        } else if (job instanceof AbstractProject<?, ?> project) {
            if (disabled) {
                project.disable();
            } else {
                project.enable();
            }
        } else {
            throw OperationException.unsupported("Unsupported job type: " + job.getClass().getName());
        }
        return Json.obj("job", job.getFullName(), "disabled", disabled);
    }

    private JSONObject getJobHealth(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.READ, job.getFullName());
        return Json.obj("job", job.getFullName(), "health", health(job));
    }

    private JSONObject getJobLastBuild(JSONObject args, User user) throws Exception {
        Job<?, ?> job = Items.job(Json.requireString(args, "job"));
        Items.check(job, Item.READ, job.getFullName());
        Run<?, ?> last = job.getLastBuild();
        return Json.obj("job", job.getFullName(), "build", last == null ? null : buildRef(last));
    }

    private static void setWorkflowDisabled(WorkflowJob job, boolean disabled) throws Exception {
        java.lang.reflect.Method method = WorkflowJob.class.getMethod("setDisabled", boolean.class);
        method.invoke(job, disabled);
    }

    private static void add(ItemGroup<?> parent, TopLevelItem item) throws Exception {
        if (parent instanceof Jenkins) {
            Jenkins.get().add(item, item.getName());
        } else if (parent instanceof com.cloudbees.hudson.plugins.folder.Folder folder) {
            folder.add(item, item.getName());
        } else {
            throw OperationException.unsupported("Cannot create items in " + parent.getClass().getName());
        }
    }

    static JSONObject summary(Job<?, ?> job) {
        Run<?, ?> last = job.getLastBuild();
        return Json.obj(
                "fullName", job.getFullName(),
                "name", job.getName(),
                "url", absoluteUrl(job.getUrl()),
                "type", job.getClass().getSimpleName(),
                "description", job.getDescription(),
                "buildable", job.isBuildable(),
                "disabled", job.getIconColor() == BallColor.DISABLED,
                "inQueue", job.isInQueue(),
                "color", job.getIconColor().name(),
                "lastBuild", last == null ? null : buildRef(last));
    }

    static JSONObject buildRef(Run<?, ?> run) {
        return Json.obj(
                "number", run.getNumber(),
                "displayName", run.getDisplayName(),
                "url", absoluteUrl(run.getUrl()),
                "result", run.getResult() == null ? null : run.getResult().toString(),
                "building", run.isBuilding(),
                "timestamp", run.getTimeInMillis(),
                "durationMs", run.getDuration());
    }

    static JSONObject health(Job<?, ?> job) {
        HealthReport report = job.getBuildHealth();
        return Json.obj(
                "score", report.getScore(),
                "description", report.getDescription(),
                "icon", report.getIconClassName());
    }

    static JSONArray parameters(Job<?, ?> job) {
        JSONArray out = new JSONArray();
        ParametersDefinitionProperty property = job.getProperty(ParametersDefinitionProperty.class);
        if (property == null) {
            return out;
        }
        for (ParameterDefinition definition : property.getParameterDefinitions()) {
            Object defaultValue = definition.getDefaultParameterValue() == null
                    ? null
                    : definition.getDefaultParameterValue().getValue();
            out.add(Json.obj(
                    "name", definition.getName(),
                    "type", definition.getType(),
                    "description", definition.getDescription(),
                    "defaultValue", defaultValue));
        }
        return out;
    }

    static JSONArray propertyNames(Job<?, ?> job) {
        List<String> names = new ArrayList<>();
        job.getAllProperties().forEach(p -> names.add(p.getClass().getSimpleName()));
        return Json.arr(names);
    }

    static JSONObject definitionSummary(WorkflowJob job) {
        FlowDefinition definition = job.getDefinition();
        JSONObject out = Json.obj("class", definition == null ? null : definition.getClass().getSimpleName());
        if (definition instanceof CpsFlowDefinition cps) {
            out.put("kind", "inline");
            out.put("sandbox", cps.isSandbox());
            out.put("scriptBytes", cps.getScript() == null ? 0 : cps.getScript().length());
        } else if (definition != null
                && definition.getClass().getName().endsWith("CpsScmFlowDefinition")) {
            out.put("kind", "scm");
        } else {
            out.put("kind", "other");
        }
        return out;
    }

    static String childName(String folder, String name) {
        return folder == null || folder.isBlank() ? name : folder.replaceAll("/+$", "") + "/" + name;
    }

    static String absoluteUrl(String relative) {
        String root = Jenkins.get().getRootUrl();
        return root == null ? relative : root.replaceAll("/+$", "") + "/" + relative.replaceAll("^/+", "");
    }

    static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
