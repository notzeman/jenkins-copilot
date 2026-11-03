package io.jenkins.plugins.copilot.ops;

import hudson.PluginWrapper;
import hudson.model.Computer;
import hudson.model.Failure;
import hudson.model.Executor;
import hudson.model.Node;
import hudson.model.Queue;
import hudson.model.User;
import hudson.security.Permission;
import hudson.slaves.DumbSlave;
import hudson.slaves.JNLPLauncher;
import hudson.slaves.OfflineCause;
import hudson.slaves.RetentionStrategy;
import hudson.model.Slave;
import io.jenkins.plugins.copilot.util.Json;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Controller, agent, executor, queue, and plugin inventory. */
public final class NodeOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_nodes", this::listNodes);
        h.put("get_node_info", this::getNodeInfo);
        h.put("get_node_status", this::getNodeStatus);
        h.put("get_executor_status", this::getExecutorStatus);
        h.put("get_queue_info", this::getQueueInfo);
        h.put("get_jenkins_version", this::getJenkinsVersion);
        h.put("get_controller_info", this::getControllerInfo);
        h.put("get_plugin_information", this::getPluginInformation);
        h.put("create_node", this::createNode);
        h.put("update_node", this::updateNode);
        h.put("delete_node", this::deleteNode);
        h.put("set_node_offline", this::setNodeOffline);
        h.put("disconnect_node", this::disconnectNode);
        h.put("reconnect_node", this::reconnectNode);
        return h;
    }

    private JSONObject listNodes(JSONObject args, User user) {
        List<JSONObject> nodes = new ArrayList<>();
        for (Computer computer : Jenkins.get().getComputers()) {
            if (!Jenkins.get().hasPermission(Jenkins.READ)) {
                continue;
            }
            nodes.add(computerSummary(computer));
        }
        return Json.obj("nodes", Json.arr(nodes), "count", nodes.size());
    }

    private JSONObject getNodeInfo(JSONObject args, User user) throws Exception {
        Computer computer = computer(Json.requireString(args, "node"));
        Jenkins.get().checkPermission(Jenkins.READ);
        JSONObject out = computerSummary(computer);
        out.put("executors", executors(computer));
        out.put("offlineCause", computer.getOfflineCause() == null
                ? null
                : computer.getOfflineCause().toString());
        out.put("temporarilyOffline", computer.isTemporarilyOffline());
        out.put("connectTime", computer.getConnectTime());
        out.put("idleStart", computer.getIdleStartMilliseconds());
        Node node = computer.getNode();
        if (node != null) {
            out.put("labels", node.getAssignedLabels().stream().map(Object::toString).toList());
            out.put("remoteFs", node.getRootPath() == null ? null : node.getRootPath().getRemote());
            out.put("numExecutors", node.getNumExecutors());
            out.put("mode", node.getMode().name());
        }
        return out;
    }

    private JSONObject getNodeStatus(JSONObject args, User user) throws Exception {
        Computer computer = computer(Json.requireString(args, "node"));
        Jenkins.get().checkPermission(Jenkins.READ);
        return Json.obj(
                "node", computer.getDisplayName(),
                "online", computer.isOnline(),
                "offline", computer.isOffline(),
                "temporarilyOffline", computer.isTemporarilyOffline(),
                "offlineCause", computer.getOfflineCause() == null ? null : computer.getOfflineCause().toString(),
                "busyExecutors", computer.countBusy(),
                "totalExecutors", computer.getNumExecutors(),
                "idle", computer.isIdle());
    }

    private JSONObject getExecutorStatus(JSONObject args, User user) {
        int total = 0;
        int busy = 0;
        JSONArray hosts = new JSONArray();
        for (Computer computer : Jenkins.get().getComputers()) {
            if (!Jenkins.get().hasPermission(Jenkins.READ)) {
                continue;
            }
            int executors = computer.getNumExecutors();
            int used = computer.countBusy();
            total += executors;
            busy += used;
            hosts.add(Json.obj(
                    "node", computer.getDisplayName(),
                    "online", computer.isOnline(),
                    "executors", executors,
                    "busy", used,
                    "idle", Math.max(executors - used, 0)));
        }
        return Json.obj(
                "totalExecutors", total,
                "busyExecutors", busy,
                "freeExecutors", Math.max(total - busy, 0),
                "utilization", total == 0 ? 0.0 : Math.round((busy * 10000.0) / total) / 100.0,
                "nodes", hosts);
    }

    private JSONObject getQueueInfo(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Jenkins.READ);
        Queue queue = Jenkins.get().getQueue();
        JSONArray items = new JSONArray();
        int limit = Math.min(Math.max(Json.integer(args, "limit", 50), 1), 200);
        for (Queue.Item item : queue.getItems()) {
            if (items.size() >= limit) {
                break;
            }
            Queue.Task task = item.task;
            if (task instanceof hudson.model.Item) {
                ((hudson.model.Item) task).checkPermission(hudson.model.Item.READ);
            }
            items.add(Json.obj(
                    "id", item.getId(),
                    "task", task.getFullDisplayName(),
                    "inQueueSince", item.getInQueueSince(),
                    "why", item.getWhy(),
                    "blocked", item.isBlocked(),
                    "stuck", item.isStuck()));
        }
        int stuck = 0;
        for (Queue.Item item : queue.getItems()) {
            if (item.isStuck()) {
                stuck++;
            }
        }
        return Json.obj(
                "items", items,
                "count", items.size(),
                "buildable", queue.getBuildableItems().size(),
                "pending", queue.getPendingItems().size(),
                "stuck", stuck);
    }

    private JSONObject getJenkinsVersion(JSONObject args, User user) {
        Jenkins.get().checkPermission(Jenkins.READ);
        return Json.obj(
                "version", Jenkins.getVersion() == null ? null : Jenkins.getVersion().toString(),
                "core", Jenkins.VERSION);
    }

    private JSONObject getControllerInfo(JSONObject args, User user) {
        Jenkins jenkins = Jenkins.get();
        jenkins.checkPermission(Jenkins.SYSTEM_READ);
        return Json.obj(
                "url", jenkins.getRootUrl(),
                "version", Jenkins.getVersion() == null ? null : Jenkins.getVersion().toString(),
                "numExecutors", jenkins.getNumExecutors(),
                "quietMode", jenkins.isQuietingDown(),
                "useSecurity", jenkins.isUseSecurity(),
                "systemMessage", jenkins.getSystemMessage(),
                "labels", jenkins.getAssignedLabels().stream().map(Object::toString).toList(),
                "nodes", jenkins.getNodes().size(),
                "queueItems", jenkins.getQueue().getItems().length);
    }

    private JSONObject createNode(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Computer.CREATE);
        String name = Json.requireString(args, "name").trim();
        try {
            Jenkins.checkGoodName(name);
        } catch (Failure e) {
            throw OperationException.invalid("Invalid agent name: " + e.getMessage());
        }
        if (Jenkins.get().getNode(name) != null) {
            throw OperationException.conflict("An agent named '" + name + "' already exists");
        }
        String remoteFs = Json.string(args, "remoteFS", "/home/jenkins").trim();
        if (remoteFs.isBlank()) {
            throw OperationException.invalid("remoteFS must not be blank");
        }
        DumbSlave slave = new DumbSlave(name, remoteFs, new JNLPLauncher(true));
        slave.setNumExecutors(executorsArg(args));
        slave.setLabelString(Json.string(args, "labels", ""));
        slave.setMode(modeArg(args));
        String description = Json.string(args, "description", null);
        if (description != null) {
            slave.setNodeDescription(description);
        }
        slave.setRetentionStrategy(RetentionStrategy.INSTANCE);
        Jenkins.get().addNode(slave);
        return Json.obj(
                "created", true,
                "node", slave.getNodeName(),
                "remoteFS", slave.getRemoteFS(),
                "labels", slave.getLabelString(),
                "executors", slave.getNumExecutors(),
                "mode", slave.getMode().name(),
                "launcher", "jnlp");
    }

    private JSONObject updateNode(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Computer.CONFIGURE);
        Slave node = agent(Json.requireString(args, "node"));
        if (args.has("labels")) {
            node.setLabelString(Json.string(args, "labels", ""));
        }
        if (args.has("executors")) {
            node.setNumExecutors(executorsArg(args));
        }
        if (args.has("mode")) {
            node.setMode(modeArg(args));
        }
        if (args.has("description")) {
            node.setNodeDescription(Json.string(args, "description", ""));
        }
        node.save();
        return Json.obj(
                "updated", true,
                "node", node.getNodeName(),
                "labels", node.getLabelString(),
                "executors", node.getNumExecutors(),
                "mode", node.getMode().name(),
                "description", node.getNodeDescription());
    }

    private JSONObject deleteNode(JSONObject args, User user) throws Exception {
        Jenkins.get().checkPermission(Computer.DELETE);
        Node node = agent(Json.requireString(args, "node"));
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete an agent");
        }
        String name = node.getNodeName();
        Jenkins.get().removeNode(node);
        return Json.obj("deleted", true, "node", name);
    }

    private JSONObject setNodeOffline(JSONObject args, User user) throws Exception {
        Computer computer = computer(Json.requireString(args, "node"));
        Jenkins.get().checkPermission(Computer.CONFIGURE);
        boolean offline = Json.bool(args, "offline", true);
        String message = Json.string(args, "message", "Set by Jenkins AI Copilot");
        if (offline) {
            computer.setTemporarilyOffline(true, new OfflineCause.UserCause(user, message));
        } else {
            computer.setTemporarilyOffline(false, null);
        }
        return Json.obj("node", computer.getName(), "temporarilyOffline", computer.isTemporarilyOffline());
    }

    private JSONObject disconnectNode(JSONObject args, User user) throws Exception {
        Computer computer = computer(Json.requireString(args, "node"));
        Jenkins.get().checkPermission(Computer.DISCONNECT);
        computer.disconnect(new OfflineCause.UserCause(
                user, Json.string(args, "message", "Disconnected by Jenkins AI Copilot")));
        return Json.obj("node", computer.getName(), "disconnectRequested", true);
    }

    private JSONObject reconnectNode(JSONObject args, User user) throws Exception {
        Computer computer = computer(Json.requireString(args, "node"));
        Jenkins.get().checkPermission(Computer.CONNECT);
        computer.connect(true);
        return Json.obj("node", computer.getName(), "connectRequested", true);
    }

    private static Slave agent(String name) throws OperationException {
        if (name == null || name.isBlank() || "master".equals(name) || "built-in".equals(name)) {
            throw OperationException.invalid("The built-in controller is not an agent");
        }
        Node node = Jenkins.get().getNode(name);
        if (!(node instanceof Slave slave)) {
            throw OperationException.notFound("No permanent agent named '" + name + "'");
        }
        return slave;
    }

    private static int executorsArg(JSONObject args) throws OperationException {
        int executors = Json.integer(args, "executors", 1);
        if (executors < 0 || executors > 100) {
            throw OperationException.invalid("executors must be between 0 and 100");
        }
        return executors;
    }

    private static Node.Mode modeArg(JSONObject args) throws OperationException {
        String mode = Json.string(args, "mode", "NORMAL");
        try {
            return Node.Mode.valueOf(mode.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw OperationException.invalid("mode must be NORMAL or EXCLUSIVE");
        }
    }

    private JSONObject getPluginInformation(JSONObject args, User user) {
        Jenkins.get().checkPermission(Jenkins.SYSTEM_READ);
        String filter = Json.string(args, "filter", null);
        JSONArray plugins = new JSONArray();
        for (PluginWrapper plugin : Jenkins.get().getPluginManager().getPlugins()) {
            if (filter != null && !filter.isBlank()
                    && !plugin.getShortName().toLowerCase().contains(filter.toLowerCase())) {
                continue;
            }
            plugins.add(Json.obj(
                    "shortName", plugin.getShortName(),
                    "longName", plugin.getLongName(),
                    "version", plugin.getVersion(),
                    "enabled", plugin.isEnabled(),
                    "active", plugin.isActive(),
                    "hasUpdate", plugin.hasUpdate()));
        }
        return Json.obj("plugins", plugins, "count", plugins.size());
    }

    private static JSONObject computerSummary(Computer computer) {
        return Json.obj(
                "name", computer.getName(),
                "displayName", computer.getDisplayName(),
                "online", computer.isOnline(),
                "offline", computer.isOffline(),
                "temporarilyOffline", computer.isTemporarilyOffline(),
                "idle", computer.isIdle(),
                "executors", computer.getNumExecutors(),
                "busyExecutors", computer.countBusy(),
                "offlineCause", computer.getOfflineCause() == null
                        ? null
                        : computer.getOfflineCause().toString(),
                "url", JobOperations.absoluteUrl(computer.getUrl()));
    }

    private static JSONArray executors(Computer computer) {
        JSONArray out = new JSONArray();
        for (Executor executor : computer.getExecutors()) {
            out.add(executorSummary(executor));
        }
        for (Executor executor : computer.getOneOffExecutors()) {
            out.add(executorSummary(executor));
        }
        return out;
    }

    private static JSONObject executorSummary(Executor executor) {
        return Json.obj(
                "number", executor.getNumber(),
                "idle", executor.isIdle(),
                "progress", executor.getProgress(),
                "currentExecutable", executor.getCurrentExecutable() == null
                        ? null
                        : executor.getCurrentExecutable().toString());
    }

    private static Computer computer(String name) throws OperationException {
        if (name == null || name.isBlank() || "master".equals(name) || "built-in".equals(name)) {
            return Jenkins.get().toComputer();
        }
        Computer computer = Jenkins.get().getComputer(name);
        if (computer == null) {
            throw OperationException.notFound("No agent named '" + name + "'");
        }
        return computer;
    }
}
