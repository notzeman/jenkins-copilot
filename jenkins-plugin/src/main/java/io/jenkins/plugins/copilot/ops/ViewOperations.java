package io.jenkins.plugins.copilot.ops;

import com.cloudbees.hudson.plugins.folder.AbstractFolder;
import hudson.model.AllView;
import hudson.model.DirectlyModifiableView;
import hudson.model.Failure;
import hudson.model.Item;
import hudson.model.Job;
import hudson.model.ListView;
import hudson.model.TopLevelItem;
import hudson.model.User;
import hudson.model.View;
import hudson.model.ViewGroup;
import hudson.security.Permission;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.Json;
import io.jenkins.plugins.copilot.util.Redactor;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** View and dashboard management for the Jenkins root and folders. */
public final class ViewOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_views", this::listViews);
        h.put("get_view", this::getView);
        h.put("create_view", this::createView);
        h.put("update_view", this::updateView);
        h.put("add_jobs_to_view", this::addJobs);
        h.put("remove_jobs_from_view", this::removeJobs);
        h.put("rename_view", this::renameView);
        h.put("set_primary_view", this::setPrimaryView);
        h.put("delete_view", this::deleteView);
        return h;
    }

    private JSONObject listViews(JSONObject args, User user) throws Exception {
        String folder = Json.string(args, "folder", null);
        ViewGroup group = group(folder);
        int limit = Math.min(Math.max(Json.integer(args, "limit", 100), 1), 500);
        List<View> views = new ArrayList<>(group.getViews());
        views.sort(Comparator.comparing(View::getViewName, String.CASE_INSENSITIVE_ORDER));
        List<JSONObject> out = new ArrayList<>();
        for (View view : views) {
            if (!view.hasPermission(View.READ)) {
                continue;
            }
            out.add(summary(group, view, 20));
            if (out.size() >= limit) {
                break;
            }
        }
        return Json.obj(
                "folder", folder == null || folder.isBlank() ? "/" : folder,
                "views", Json.arr(out),
                "count", out.size(),
                "limit", limit);
    }

    private JSONObject getView(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.READ, view.getViewName());
        int limit = Math.min(Math.max(Json.integer(args, "limit", 200), 1), 500);
        return summary(group, view, limit);
    }

    private JSONObject createView(JSONObject args, User user) throws Exception {
        String name = checkedName(Json.requireString(args, "name"));
        ViewGroup group = group(Json.string(args, "folder", null));
        Items.check(group, View.CREATE, groupName(group));
        if (group.getView(name) != null) {
            throw OperationException.conflict("A view named '" + name + "' already exists in " + groupName(group));
        }
        String type = Json.string(args, "type", "list").toLowerCase();
        String description = Json.string(args, "description", null);
        String includeRegex = Json.string(args, "includeRegex", null);
        boolean recurse = Json.bool(args, "recurse", false);
        List<String> requestedJobs = Json.stringList(args, "jobs");
        if (includeRegex != null && !includeRegex.isBlank()) {
            validateRegex(includeRegex);
        }
        List<TopLevelItem> jobs = resolveJobs(group, requestedJobs);

        View view;
        if ("list".equals(type)) {
            ListView listView = new ListView(name, group);
            if (description != null) {
                listView.setDescription(description);
            }
            if (includeRegex != null) {
                listView.setIncludeRegex(includeRegex);
            }
            listView.setRecurse(recurse);
            for (TopLevelItem item : jobs) {
                listView.add(item);
            }
            view = listView;
        } else if ("all".equals(type)) {
            if (!requestedJobs.isEmpty() || (includeRegex != null && !includeRegex.isBlank())) {
                throw OperationException.invalid("An 'all' view cannot take jobs or includeRegex; use type='list'");
            }
            AllView allView = new AllView(name, group);
            if (description != null) {
                allView.setDescription(description);
            }
            view = allView;
        } else {
            throw OperationException.invalid("type must be 'list' or 'all'");
        }

        if (!(group instanceof hudson.model.ModifiableViewGroup modifiable)) {
            throw OperationException.unsupported("This item does not support views: " + groupName(group));
        }
        modifiable.addView(view);
        view.save();
        group.save();
        if (Json.bool(args, "primary", false)) {
            setPrimary(group, view);
        }
        return Json.obj("created", true, "view", summary(group, view, 50));
    }

    private JSONObject updateView(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.CONFIGURE, view.getViewName());
        if (args.has("description")) {
            view.setDescription(Json.string(args, "description", ""));
        }
        boolean filterChange = args.has("includeRegex") || args.has("recurse");
        if (filterChange) {
            if (!(view instanceof ListView listView)) {
                throw OperationException.unsupported("includeRegex and recurse are only valid for list views");
            }
            if (args.has("includeRegex")) {
                String regex = Json.string(args, "includeRegex", "");
                if (!regex.isBlank()) {
                    validateRegex(regex);
                }
                listView.setIncludeRegex(regex);
            }
            if (args.has("recurse")) {
                listView.setRecurse(Json.bool(args, "recurse", false));
            }
        }
        view.save();
        group.save();
        return Json.obj("updated", true, "view", summary(group, view, 50));
    }

    private JSONObject addJobs(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.CONFIGURE, view.getViewName());
        if (!(view instanceof DirectlyModifiableView modifiable) || !(view instanceof ListView)) {
            throw OperationException.unsupported("Only list views can have jobs added or removed");
        }
        List<TopLevelItem> jobs = resolveJobs(group, Json.stringList(args, "jobs"));
        JSONArray added = new JSONArray();
        JSONArray skipped = new JSONArray();
        for (TopLevelItem item : jobs) {
            if (view.contains(item)) {
                skipped.add(item.getFullName());
            } else {
                modifiable.add(item);
                added.add(item.getFullName());
            }
        }
        view.save();
        group.save();
        return Json.obj(
                "view", view.getViewName(),
                "added", added,
                "skipped", skipped,
                "result", summary(group, view, 100));
    }

    private JSONObject removeJobs(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.CONFIGURE, view.getViewName());
        if (!(view instanceof DirectlyModifiableView modifiable) || !(view instanceof ListView)) {
            throw OperationException.unsupported("Only list views can have jobs added or removed");
        }
        List<TopLevelItem> jobs = resolveJobs(group, Json.stringList(args, "jobs"));
        JSONArray removed = new JSONArray();
        JSONArray skipped = new JSONArray();
        for (TopLevelItem item : jobs) {
            if (view.contains(item)) {
                modifiable.remove(item);
                removed.add(item.getFullName());
            } else {
                skipped.add(item.getFullName());
            }
        }
        view.save();
        group.save();
        return Json.obj(
                "view", view.getViewName(),
                "removed", removed,
                "skipped", skipped,
                "result", summary(group, view, 100));
    }

    private JSONObject renameView(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.CONFIGURE, view.getViewName());
        String newName = checkedName(Json.requireString(args, "newName"));
        if (group.getView(newName) != null) {
            throw OperationException.conflict("A view named '" + newName + "' already exists in " + groupName(group));
        }
        String oldName = view.getViewName();
        view.rename(newName);
        view.save();
        group.save();
        return Json.obj("renamed", true, "oldName", oldName, "newName", newName);
    }

    private JSONObject setPrimaryView(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.CONFIGURE, view.getViewName());
        setPrimary(group, view);
        return Json.obj("primary", true, "view", view.getViewName(), "folder", groupName(group));
    }

    private JSONObject deleteView(JSONObject args, User user) throws Exception {
        ViewGroup group = group(Json.string(args, "folder", null));
        View view = view(group, Json.requireString(args, "view"));
        Items.check(view, View.DELETE, view.getViewName());
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete a view");
        }
        if (!group.canDelete(view)) {
            throw OperationException.conflict("This view cannot be deleted; set another primary view first");
        }
        String name = view.getViewName();
        String backup = null;
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            view.writeXml(out);
            backup = Redactor.redactXml(out.toString(java.nio.charset.StandardCharsets.UTF_8));
        } catch (Exception ignored) {
            // The view is still deleted if the backup cannot be produced.
        }
        group.deleteView(view);
        group.save();
        return Json.obj("deleted", true, "view", name, "configBackup", backup);
    }

    private static void setPrimary(ViewGroup group, View view) throws Exception {
        Items.check(group, View.CONFIGURE, groupName(group));
        if (group instanceof Jenkins jenkins) {
            jenkins.setPrimaryView(view);
        } else if (group instanceof AbstractFolder<?> folder) {
            folder.setPrimaryView(view);
        } else {
            throw OperationException.unsupported("Primary views are not supported for " + groupName(group));
        }
        group.save();
    }

    private static List<TopLevelItem> resolveJobs(ViewGroup group, List<String> names) throws OperationException {
        List<TopLevelItem> out = new ArrayList<>();
        for (String name : names) {
            if (name == null || name.isBlank()) {
                continue;
            }
            Job<?, ?> job = Jenkins.get().getItemByFullName(name, Job.class);
            if (job == null) {
                throw OperationException.notFound("No job named '" + name + "'");
            }
            if (!job.hasPermission(Item.READ)) {
                throw OperationException.forbidden("You do not have Item/Read for " + name);
            }
            if (!(job instanceof TopLevelItem item) || job.getParent() != group) {
                throw OperationException.invalid(
                        "Job '" + name + "' is not a top-level item in " + groupName(group)
                                + ". Create the view inside its parent folder, or use includeRegex with recurse=true.");
            }
            out.add(item);
        }
        return out;
    }

    private static ViewGroup group(String folder) throws OperationException {
        if (folder == null || folder.isBlank() || "/".equals(folder)) {
            return Jenkins.get();
        }
        Item item = Jenkins.get().getItemByFullName(folder);
        if (item == null) {
            throw OperationException.notFound("No folder named '" + folder + "'");
        }
        if (!(item instanceof ViewGroup group)) {
            throw OperationException.invalid("'" + folder + "' is not a view group");
        }
        Items.check(group, View.READ, folder);
        return group;
    }

    private static View view(ViewGroup group, String name) throws OperationException {
        View view = group.getView(name);
        if (view == null) {
            throw OperationException.notFound("No view named '" + name + "' in " + groupName(group));
        }
        return view;
    }

    private static String checkedName(String name) throws OperationException {
        String value = name == null ? "" : name.trim();
        if (value.isBlank()) {
            throw OperationException.invalid("View name is required");
        }
        try {
            Jenkins.checkGoodName(value);
        } catch (Failure e) {
            throw OperationException.invalid("Invalid view name: " + e.getMessage());
        }
        if (value.length() > 200) {
            throw OperationException.invalid("View name must be 200 characters or fewer");
        }
        return value;
    }

    private static void validateRegex(String regex) throws OperationException {
        try {
            Pattern.compile(regex);
        } catch (PatternSyntaxException e) {
            throw OperationException.invalid("Invalid includeRegex: " + e.getDescription());
        }
    }

    private static String groupName(ViewGroup group) {
        if (group instanceof Jenkins) {
            return "Jenkins";
        }
        if (group instanceof Item item) {
            return item.getFullName();
        }
        return group.getClass().getSimpleName();
    }

    private static JSONObject summary(ViewGroup group, View view, int jobLimit) {
        JSONArray jobs = new JSONArray();
        int visible = 0;
        Collection<? extends TopLevelItem> items = view.getItems();
        if (items != null) {
            for (TopLevelItem item : items) {
                if (!item.hasPermission(Item.READ)) {
                    continue;
                }
                visible++;
                if (jobs.size() < jobLimit) {
                    jobs.add(Json.obj(
                            "fullName", item.getFullName(),
                            "name", item.getName(),
                            "type", item.getClass().getSimpleName(),
                            "url", absolute(item.getUrl())));
                }
            }
        }
        JSONObject out = Json.obj(
                "name", view.getViewName(),
                "displayName", view.getDisplayName(),
                "type", viewType(view),
                "description", view.getDescription(),
                "url", absolute(view.getUrl()),
                "primary", group.getPrimaryView() == view,
                "jobCount", visible,
                "jobs", jobs,
                "folder", groupName(group));
        if (view instanceof ListView listView) {
            out.put("includeRegex", listView.getIncludeRegex());
            out.put("recurse", listView.isRecurse());
        }
        return out;
    }

    private static String viewType(View view) {
        if (view instanceof ListView) {
            return "list";
        }
        if (view instanceof AllView) {
            return "all";
        }
        return view.getClass().getSimpleName();
    }

    private static String absolute(String relative) {
        String root = Jenkins.get().getRootUrl();
        return root == null ? relative : root.replaceAll("/+$", "") + "/" + relative.replaceAll("^/+", "");
    }
}
