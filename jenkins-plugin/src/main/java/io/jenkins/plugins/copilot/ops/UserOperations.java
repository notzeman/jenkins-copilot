package io.jenkins.plugins.copilot.ops;

import hudson.model.Failure;
import hudson.model.User;
import io.jenkins.plugins.copilot.util.Json;
import java.util.LinkedHashMap;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Jenkins user inventory and private-realm account lifecycle. */
public final class UserOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_users", this::listUsers);
        h.put("create_user", this::createUser);
        h.put("delete_user", this::deleteUser);
        return h;
    }

    private JSONObject listUsers(JSONObject args, User user) {
        Jenkins.get().checkPermission(Jenkins.ADMINISTER);
        JSONArray out = new JSONArray();
        for (User candidate : User.getAll()) {
            out.add(Json.obj(
                    "id", candidate.getId(),
                    "fullName", candidate.getFullName(),
                    "description", candidate.getDescription()));
        }
        return Json.obj("users", out, "count", out.size());
    }

    private JSONObject createUser(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Jenkins.ADMINISTER);
        if (!(Jenkins.get().getSecurityRealm() instanceof hudson.security.HudsonPrivateSecurityRealm realm)) {
            throw OperationException.unsupported(
                    "User creation is only supported with the Jenkins private security realm");
        }
        String id = Json.requireString(args, "id").trim();
        String password = Json.requireString(args, "password");
        try {
            Jenkins.checkGoodName(id);
        } catch (Failure e) {
            throw OperationException.invalid("Invalid user id: " + e.getMessage());
        }
        if (User.getById(id, false) != null) {
            throw OperationException.conflict("A user with id '" + id + "' already exists");
        }
        try {
            User created = realm.createAccount(id, password);
            String fullName = Json.string(args, "fullName", null);
            if (fullName != null && !fullName.isBlank()) {
                created.setFullName(fullName);
            }
            created.save();
            return Json.obj(
                    "created", true,
                    "user", Json.obj("id", created.getId(), "fullName", created.getFullName()));
        } catch (Exception e) {
            throw OperationException.invalid("Could not create the user: " + e.getMessage());
        }
    }

    private JSONObject deleteUser(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Jenkins.ADMINISTER);
        String id = Json.requireString(args, "id").trim();
        if (user != null && id.equals(user.getId())) {
            throw OperationException.invalid("Refusing to delete the account running this request");
        }
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete a user");
        }
        User target = User.getById(id, false);
        if (target == null) {
            throw OperationException.notFound("No user with id '" + id + "'");
        }
        target.delete();
        return Json.obj("deleted", true, "user", id);
    }
}
