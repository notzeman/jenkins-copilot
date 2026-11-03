package io.jenkins.plugins.copilot.ops;

import com.cloudbees.hudson.plugins.folder.AbstractFolder;
import com.cloudbees.hudson.plugins.folder.Folder;
import hudson.model.Failure;
import hudson.model.Item;
import hudson.model.ItemGroup;
import hudson.model.TopLevelItem;
import hudson.model.User;
import hudson.security.AccessControlled;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.Json;
import io.jenkins.plugins.copilot.util.Redactor;
import java.util.LinkedHashMap;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;

/** Folder lifecycle operations. */
public final class FolderOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("get_folder_info", this::getFolderInfo);
        h.put("create_folder", this::createFolder);
        h.put("rename_folder", this::renameFolder);
        h.put("delete_folder", this::deleteFolder);
        return h;
    }

    private JSONObject getFolderInfo(JSONObject args, User user) throws Exception {
        AbstractFolder<?> folder = folder(Json.requireString(args, "folder"));
        Items.check(folder, Item.READ, folder.getFullName());
        return Json.obj(
                "folder", folder.getFullName(),
                "name", folder.getName(),
                "description", folder.getDescription(),
                "url", absolute(folder.getUrl()),
                "jobs", folder.getItems().size(),
                "views", folder.getViews().size(),
                "primaryView", folder.getPrimaryView() == null
                        ? null
                        : folder.getPrimaryView().getViewName());
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private JSONObject createFolder(JSONObject args, User user) throws Exception {
        String name = Json.requireString(args, "name").trim();
        String parentName = Json.string(args, "folder", null);
        ItemGroup<?> parent = Items.group(parentName);
        if (parent instanceof AccessControlled controlled) {
            Items.check(controlled, Item.CREATE, parentName == null || parentName.isBlank() ? "Jenkins" : parentName);
        }
        if (name.isBlank()) {
            throw OperationException.invalid("name is required");
        }
        try {
            Jenkins.checkGoodName(name);
        } catch (Failure e) {
            throw OperationException.invalid("Invalid folder name: " + e.getMessage());
        }
        String fullName = parentName == null || parentName.isBlank()
                ? name
                : parentName.replaceAll("/+$", "") + "/" + name;
        if (Jenkins.get().getItemByFullName(fullName) != null) {
            throw OperationException.conflict("An item named '" + fullName + "' already exists");
        }
        Folder folder = new Folder((ItemGroup) parent, name);
        String description = Json.string(args, "description", null);
        if (description != null) {
            folder.setDescription(description);
        }
        if (parent instanceof Jenkins jenkins) {
            jenkins.add(folder, name);
        } else if (parent instanceof Folder container) {
            container.add(folder, name);
        } else {
            throw OperationException.unsupported("Cannot create folders in " + parent.getClass().getName());
        }
        folder.save();
        return Json.obj(
                "created", true,
                "folder", folder.getFullName(),
                "url", absolute(folder.getUrl()));
    }

    private JSONObject renameFolder(JSONObject args, User user) throws Exception {
        AbstractFolder<?> folder = folder(Json.requireString(args, "folder"));
        Items.check(folder, Item.CONFIGURE, folder.getFullName());
        if (folder.getParent() instanceof AccessControlled parent) {
            Items.check(parent, Item.CREATE, folder.getParent().getFullName());
        }
        String newName = Json.requireString(args, "newName").trim();
        try {
            Jenkins.checkGoodName(newName);
        } catch (Failure e) {
            throw OperationException.invalid("Invalid folder name: " + e.getMessage());
        }
        ItemGroup<?> parent = folder.getParent();
        if (parent != null && parent.getItem(newName) != null) {
            throw OperationException.conflict("An item named '" + newName + "' already exists in the parent folder");
        }
        String oldName = folder.getFullName();
        folder.renameTo(newName);
        folder.save();
        return Json.obj("renamed", true, "oldFolder", oldName, "newFolder", folder.getFullName());
    }

    private JSONObject deleteFolder(JSONObject args, User user) throws Exception {
        AbstractFolder<?> folder = folder(Json.requireString(args, "folder"));
        Items.check(folder, Item.DELETE, folder.getFullName());
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete a folder");
        }
        String name = folder.getFullName();
        String backup = Redactor.redactXml(folder.getConfigFile().asString());
        folder.delete();
        return Json.obj("deleted", true, "folder", name, "configBackup", backup);
    }

    private static AbstractFolder<?> folder(String name) throws OperationException {
        if (name == null || name.isBlank()) {
            throw OperationException.invalid("folder (full name) is required");
        }
        AbstractFolder<?> folder = Jenkins.get().getItemByFullName(name, AbstractFolder.class);
        if (folder == null) {
            throw OperationException.notFound("No folder named '" + name + "'");
        }
        return folder;
    }

    private static String absolute(String relative) {
        String root = Jenkins.get().getRootUrl();
        return root == null ? relative : root.replaceAll("/+$", "") + "/" + relative.replaceAll("^/+", "");
    }
}
