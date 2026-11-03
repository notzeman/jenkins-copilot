package io.jenkins.plugins.copilot.ops;

import hudson.model.User;
import hudson.security.Permission;
import io.jenkins.plugins.copilot.util.Json;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * Permission matrix editing for the Global Matrix Authorization Strategy.
 * Other authorization strategies are intentionally rejected instead of guessed at.
 */
public final class PermissionOperations implements OperationGroup {

    private static final String MATRIX = "hudson.security.GlobalMatrixAuthorizationStrategy";
    private static final String ENTRY = "org.jenkinsci.plugins.matrixauth.PermissionEntry";
    private static final String CONTAINER = "org.jenkinsci.plugins.matrixauth.AuthorizationContainer";

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_permissions", this::listPermissions);
        h.put("grant_permission", this::grantPermission);
        h.put("revoke_permission", this::revokePermission);
        return h;
    }

    private JSONObject listPermissions(JSONObject args, User user) throws Exception {
        Object strategy = matrixStrategy();
        Map<?, ?> granted = granted(strategy);
        JSONArray out = new JSONArray();
        for (Map.Entry<?, ?> entry : granted.entrySet()) {
            Permission permission = (Permission) entry.getKey();
            JSONArray holders = new JSONArray();
            for (Object holder : (Set<?>) entry.getValue()) {
                holders.add(Json.obj(
                        "type", type(holder),
                        "sid", sid(holder)));
            }
            out.add(Json.obj("permission", permission.getId(), "holders", holders));
        }
        return Json.obj("strategy", MATRIX, "permissions", out, "count", out.size());
    }

    private JSONObject grantPermission(JSONObject args, User user) throws Exception {
        Object strategy = matrixStrategy();
        Permission permission = permission(Json.requireString(args, "permission"));
        Object entry = entry(args);
        Class<?> container = Class.forName(CONTAINER);
        Class<?> entryType = Class.forName(ENTRY);
        Method add = container.getMethod("add", Permission.class, entryType);
        add.invoke(strategy, permission, entry);
        Jenkins.get().save();
        return Json.obj(
                "granted", true,
                "permission", permission.getId(),
                "sid", sid(entry),
                "type", type(entry));
    }

    private JSONObject revokePermission(JSONObject args, User user) throws Exception {
        Object strategy = matrixStrategy();
        Permission permission = permission(Json.requireString(args, "permission"));
        Object entry = entry(args);
        Map<?, ?> granted = granted(strategy);
        Object holders = granted.get(permission);
        boolean removed = holders instanceof Set<?> set && set.remove(entry);
        if (!removed) {
            throw OperationException.notFound(
                    "The permission is not granted to " + sid(entry));
        }
        Jenkins.get().save();
        return Json.obj(
                "revoked", true,
                "permission", permission.getId(),
                "sid", sid(entry),
                "type", type(entry));
    }

    private static Object matrixStrategy() throws Exception {
        Jenkins jenkins = Jenkins.get();
        if (!jenkins.hasPermission(Jenkins.ADMINISTER)) {
            throw OperationException.forbidden("You do not have Overall/Administer permission");
        }
        Object strategy = jenkins.getAuthorizationStrategy();
        if (!MATRIX.equals(strategy.getClass().getName())) {
            throw OperationException.unsupported(
                    "Permission editing is only supported for the Global Matrix Authorization Strategy; found "
                            + strategy.getClass().getName());
        }
        return strategy;
    }

    private static Map<?, ?> granted(Object strategy) throws Exception {
        return (Map<?, ?>) strategy.getClass().getMethod("getGrantedPermissionEntries").invoke(strategy);
    }

    private static Object entry(JSONObject args) throws Exception {
        String sid = Json.requireString(args, "sid").trim();
        if (sid.isBlank()) {
            throw OperationException.invalid("sid is required");
        }
        String type = Json.string(args, "type", "user").toLowerCase();
        if (!"user".equals(type) && !"group".equals(type)) {
            throw OperationException.invalid("type must be 'user' or 'group'");
        }
        Class<?> entryType = Class.forName(ENTRY);
        return entryType.getMethod(type, String.class).invoke(null, sid);
    }

    private static Permission permission(String id) throws OperationException {
        Permission permission = Permission.fromId(id);
        if (permission != null) {
            return permission;
        }
        String normalized = id.replace('_', '.');
        for (Permission candidate : Permission.getAll()) {
            if (candidate.getId().equalsIgnoreCase(normalized)
                    || candidate.getId().equalsIgnoreCase("hudson.model." + normalized)) {
                return candidate;
            }
        }
        throw OperationException.invalid("Unknown permission '" + id + "'");
    }

    private static String sid(Object entry) throws Exception {
        return (String) entry.getClass().getMethod("getSid").invoke(entry);
    }

    private static String type(Object entry) throws Exception {
        Object type = entry.getClass().getMethod("getType").invoke(entry);
        return type == null ? "user" : type.toString().toLowerCase();
    }
}
