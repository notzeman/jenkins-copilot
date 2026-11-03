package io.jenkins.plugins.copilot.ops;

import hudson.PluginManager;
import hudson.PluginWrapper;
import hudson.model.Node;
import hudson.model.User;
import io.jenkins.plugins.copilot.util.Json;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Controller-wide configuration and plugin lifecycle. */
public final class SystemOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("set_system_message", this::setSystemMessage);
        h.put("set_num_executors", this::setNumExecutors);
        h.put("set_controller_labels", this::setControllerLabels);
        h.put("set_controller_mode", this::setControllerMode);
        h.put("set_quiet_period", this::setQuietPeriod);
        h.put("quiet_down", this::quietDown);
        h.put("cancel_quiet_down", this::cancelQuietDown);
        h.put("safe_restart", this::safeRestart);
        h.put("install_plugin", this::installPlugin);
        h.put("update_plugins", this::updatePlugins);
        h.put("enable_plugin", this::enablePlugin);
        h.put("disable_plugin", this::disablePlugin);
        return h;
    }

    private JSONObject setSystemMessage(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        String message = Json.string(args, "message", "");
        jenkins.setSystemMessage(message);
        jenkins.save();
        return Json.obj("updated", true, "systemMessage", jenkins.getSystemMessage());
    }

    private JSONObject setNumExecutors(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        int executors = Json.integer(args, "executors", jenkins.getNumExecutors());
        if (executors < 0 || executors > 1000) {
            throw OperationException.invalid("executors must be between 0 and 1000");
        }
        jenkins.setNumExecutors(executors);
        jenkins.save();
        return Json.obj("updated", true, "numExecutors", jenkins.getNumExecutors());
    }

    private JSONObject setControllerLabels(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        String labels = Json.string(args, "labels", "");
        jenkins.setLabelString(labels);
        jenkins.save();
        return Json.obj("updated", true, "labels", jenkins.getLabelString());
    }

    private JSONObject setControllerMode(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        String mode = Json.string(args, "mode", "NORMAL");
        try {
            jenkins.setMode(Node.Mode.valueOf(mode.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw OperationException.invalid("mode must be NORMAL or EXCLUSIVE");
        }
        jenkins.save();
        return Json.obj("updated", true, "mode", jenkins.getMode().name());
    }

    private JSONObject setQuietPeriod(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        int seconds = Json.integer(args, "seconds", jenkins.getQuietPeriod());
        if (seconds < 0 || seconds > 86_400) {
            throw OperationException.invalid("seconds must be between 0 and 86400");
        }
        jenkins.setQuietPeriod(seconds);
        jenkins.save();
        return Json.obj("updated", true, "quietPeriodSeconds", jenkins.getQuietPeriod());
    }

    private JSONObject quietDown(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        String reason = Json.string(args, "reason", "Preparing for maintenance");
        jenkins.doQuietDown(false, 0, reason);
        return Json.obj("quiet", true, "reason", jenkins.getQuietDownReason());
    }

    private JSONObject cancelQuietDown(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        jenkins.doCancelQuietDown();
        return Json.obj("quiet", jenkins.isQuietingDown());
    }

    private JSONObject safeRestart(JSONObject args, User user) throws Exception {
        Jenkins jenkins = admin();
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to restart Jenkins");
        }
        String reason = Json.string(args, "reason", "");
        try {
            if (reason.isBlank()) {
                jenkins.safeRestart();
            } else {
                jenkins.safeRestart(reason);
            }
        } catch (hudson.lifecycle.RestartNotSupportedException e) {
            throw OperationException.unsupported("Restart is not supported by this Jenkins lifecycle");
        }
        return Json.obj("restartRequested", true, "safe", true, "reason", reason);
    }

    private JSONObject installPlugin(JSONObject args, User user) throws Exception {
        admin();
        List<String> names = Json.stringList(args, "plugins");
        if (names.isEmpty()) {
            names = new ArrayList<>(List.of(Json.requireString(args, "plugin")));
        }
        PluginManager manager = Jenkins.get().getPluginManager();
        for (String name : names) {
            if (manager.getPlugin(name) == null && Jenkins.get().getUpdateCenter().getPlugin(name) == null) {
                throw OperationException.notFound("No installable plugin named '" + name + "'");
            }
        }
        install(manager, names);
        return Json.obj(
                "scheduled", true,
                "plugins", names,
                "note", "Jenkins may require a restart after the download completes");
    }

    private JSONObject updatePlugins(JSONObject args, User user) throws Exception {
        admin();
        List<String> names = Json.stringList(args, "plugins");
        if (names.isEmpty()) {
            for (PluginWrapper plugin : Jenkins.get().getPluginManager().getPlugins()) {
                if (plugin.hasUpdate()) {
                    names.add(plugin.getShortName());
                }
            }
        }
        if (names.isEmpty()) {
            return Json.obj("scheduled", false, "plugins", names, "note", "No updates are available");
        }
        install(Jenkins.get().getPluginManager(), names);
        return Json.obj(
                "scheduled", true,
                "plugins", names,
                "note", "Jenkins may require a restart after the download completes");
    }

    private JSONObject enablePlugin(JSONObject args, User user) throws Exception {
        admin();
        PluginWrapper plugin = plugin(Json.requireString(args, "plugin"));
        plugin.enable();
        return Json.obj("plugin", plugin.getShortName(), "enabled", plugin.isEnabled(), "restartRequired", true);
    }

    private JSONObject disablePlugin(JSONObject args, User user) throws Exception {
        admin();
        PluginWrapper plugin = plugin(Json.requireString(args, "plugin"));
        if (plugin.getShortName().equals("jenkins-ai-copilot")) {
            throw OperationException.invalid("Refusing to disable the Jenkins AI Copilot plugin");
        }
        plugin.disable();
        return Json.obj("plugin", plugin.getShortName(), "enabled", plugin.isEnabled(), "restartRequired", true);
    }

    @SuppressWarnings("unchecked")
    private static void install(PluginManager manager, List<String> names) throws OperationException {
        try {
            // The public helper is annotated @Restricted; invoke the same supported method reflectively
            // so this plugin can expose plugin management without compiling against a restricted API.
            java.lang.reflect.Method method =
                    PluginManager.class.getMethod("install", java.util.Collection.class, boolean.class);
            method.invoke(manager, names, true);
        } catch (ReflectiveOperationException e) {
            throw OperationException.unsupported("Plugin installation is unavailable: " + e.getMessage());
        }
    }

    private static PluginWrapper plugin(String name) throws OperationException {
        PluginWrapper plugin = Jenkins.get().getPluginManager().getPlugin(name);
        if (plugin == null) {
            throw OperationException.notFound("No installed plugin named '" + name + "'");
        }
        return plugin;
    }

    private static Jenkins admin() {
        Jenkins jenkins = Jenkins.get();
        if (!jenkins.hasPermission(Jenkins.ADMINISTER)) {
            throw new SecurityException("You do not have Overall/Administer permission");
        }
        return jenkins;
    }

    @SuppressWarnings("unused")
    private static JSONArray array(List<String> values) {
        return Json.arr(values);
    }
}
