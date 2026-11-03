package io.jenkins.plugins.copilot.ops;

import hudson.model.Item;
import hudson.model.Queue;
import hudson.model.User;
import io.jenkins.plugins.copilot.util.Items;
import io.jenkins.plugins.copilot.util.Json;
import java.util.LinkedHashMap;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Build-queue cancellation. */
public final class QueueOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("cancel_queue_item", this::cancelItem);
        h.put("cancel_job_queue", this::cancelJobQueue);
        return h;
    }

    private JSONObject cancelItem(JSONObject args, User user) throws Exception {
        long id = Json.longValue(args, "id", -1);
        if (id < 0) {
            throw OperationException.invalid("id (queue item id) is required");
        }
        Queue queue = Jenkins.get().getQueue();
        Queue.Item item = queue.getItem(id);
        if (item == null) {
            throw OperationException.notFound("No queue item with id " + id);
        }
        checkCancel(item);
        boolean cancelled = queue.cancel(item);
        return Json.obj(
                "cancelled", cancelled,
                "id", id,
                "task", item.getTask() == null ? null : item.getTask().getFullDisplayName(),
                "why", item.getWhy());
    }

    private JSONObject cancelJobQueue(JSONObject args, User user) throws Exception {
        String jobName = Json.requireString(args, "job");
        var job = Items.job(jobName);
        Items.check(job, Item.CANCEL, job.getFullName());
        if (!(job instanceof Queue.Task task)) {
            throw OperationException.unsupported("This job type does not expose queue tasks");
        }
        Queue queue = Jenkins.get().getQueue();
        JSONArray cancelled = new JSONArray();
        for (Queue.Item item : queue.getItems(task)) {
            if (queue.cancel(item)) {
                cancelled.add(item.getId());
            }
        }
        return Json.obj("job", job.getFullName(), "cancelled", cancelled, "count", cancelled.size());
    }

    private static void checkCancel(Queue.Item item) throws OperationException {
        if (item.getTask() instanceof Item target) {
            if (!target.hasPermission(Item.CANCEL)) {
                throw OperationException.forbidden("You do not have Item/Cancel for " + target.getFullName());
            }
        } else if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            throw OperationException.forbidden("You do not have permission to cancel this queue item");
        }
    }
}
