package io.jenkins.plugins.copilot.ops;

import com.fasterxml.jackson.databind.node.ObjectNode;
import hudson.model.User;
import io.jenkins.plugins.copilot.storage.Skill;
import io.jenkins.plugins.copilot.storage.SkillStore;
import io.jenkins.plugins.copilot.util.Jackson;
import io.jenkins.plugins.copilot.util.Json;
import io.jenkins.plugins.copilot.util.JsonBridge;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Agent-facing skills catalogue and lifecycle. */
public final class SkillOperations implements OperationGroup {

    private final SkillStore store = new SkillStore();

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_skills", this::listSkills);
        h.put("get_skill", this::getSkill);
        h.put("create_skill", this::createSkill);
        h.put("update_skill", this::updateSkill);
        h.put("delete_skill", this::deleteSkill);
        h.put("set_skill_enabled", this::setSkillEnabled);
        return h;
    }

    private JSONObject listSkills(JSONObject args, User user) {
        String query = Json.string(args, "query", "").trim().toLowerCase();
        int limit = Math.min(Math.max(Json.integer(args, "limit", 50), 1), 200);
        JSONArray out = new JSONArray();
        for (Skill skill : store.list()) {
            if (!query.isBlank() && !matches(skill, query)) {
                continue;
            }
            out.add(summary(skill));
            if (out.size() >= limit) {
                break;
            }
        }
        return Json.obj("skills", out, "count", out.size(), "limit", limit);
    }

    private JSONObject getSkill(JSONObject args, User user) throws Exception {
        Skill skill = store.get(Json.requireString(args, "skill"));
        if (skill == null) {
            throw OperationException.notFound("No skill named '" + Json.string(args, "skill", "") + "'");
        }
        return Json.obj("skill", JsonBridge.toNetSf(Jackson.MAPPER.valueToTree(skill)));
    }

    private JSONObject createSkill(JSONObject args, User user) throws Exception {
        requireAdmin();
        try {
            Skill input = new Skill();
            input.setName(Json.requireString(args, "name"));
            input.setSlug(Json.string(args, "slug", ""));
            input.setKind(Json.string(args, "kind", "general"));
            input.setDescription(Json.string(args, "description", ""));
            input.setWhenToUse(Json.string(args, "whenToUse", ""));
            input.setBody(Json.requireString(args, "body"));
            input.setTags(Json.stringList(args, "tags"));
            input.setSourceJobs(Json.stringList(args, "sourceJobs"));
            input.setEnabled(Json.bool(args, "enabled", true));
            Skill saved = store.save(input, user == null ? "unknown" : user.getId());
            return Json.obj("created", true, "skill", JsonBridge.toNetSf(Jackson.MAPPER.valueToTree(saved)));
        } catch (IllegalArgumentException e) {
            throw OperationException.invalid(e.getMessage());
        }
    }

    private JSONObject updateSkill(JSONObject args, User user) throws Exception {
        requireAdmin();
        Skill existing = store.get(Json.requireString(args, "skill"));
        if (existing == null) {
            throw OperationException.notFound("No skill named '" + Json.string(args, "skill", "") + "'");
        }
        if (args.has("slug")) {
            existing.setSlug(Json.string(args, "slug", ""));
        }
        if (args.has("name")) {
            existing.setName(Json.string(args, "name", ""));
        }
        if (args.has("kind")) {
            existing.setKind(Json.string(args, "kind", "general"));
        }
        if (args.has("description")) {
            existing.setDescription(Json.string(args, "description", ""));
        }
        if (args.has("whenToUse")) {
            existing.setWhenToUse(Json.string(args, "whenToUse", ""));
        }
        if (args.has("body")) {
            existing.setBody(Json.string(args, "body", ""));
        }
        if (args.has("tags")) {
            existing.setTags(Json.stringList(args, "tags"));
        }
        if (args.has("sourceJobs")) {
            existing.setSourceJobs(Json.stringList(args, "sourceJobs"));
        }
        if (args.has("enabled")) {
            existing.setEnabled(Json.bool(args, "enabled", existing.isEnabled()));
        }
        try {
            Skill saved = store.save(existing, user == null ? "unknown" : user.getId());
            return Json.obj("updated", true, "skill", JsonBridge.toNetSf(Jackson.MAPPER.valueToTree(saved)));
        } catch (IllegalArgumentException e) {
            throw OperationException.invalid(e.getMessage());
        }
    }

    private JSONObject deleteSkill(JSONObject args, User user) throws Exception {
        requireAdmin();
        String key = Json.requireString(args, "skill");
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete a skill");
        }
        Skill existing = store.get(key);
        if (existing == null) {
            throw OperationException.notFound("No skill named '" + key + "'");
        }
        if (!store.delete(key)) {
            throw OperationException.notFound("No skill named '" + key + "'");
        }
        return Json.obj("deleted", true, "skill", existing.getSlug());
    }

    private JSONObject setSkillEnabled(JSONObject args, User user) throws Exception {
        requireAdmin();
        Skill existing = store.get(Json.requireString(args, "skill"));
        if (existing == null) {
            throw OperationException.notFound("No skill named '" + Json.string(args, "skill", "") + "'");
        }
        Skill saved = store.setEnabled(existing.getId(), Json.bool(args, "enabled", true));
        if (saved == null) {
            throw OperationException.notFound("No skill named '" + Json.string(args, "skill", "") + "'");
        }
        return Json.obj("skill", summary(saved), "enabled", saved.isEnabled());
    }

    private static boolean matches(Skill skill, String query) {
        return skill.getName().toLowerCase().contains(query)
                || skill.getSlug().toLowerCase().contains(query)
                || skill.getDescription().toLowerCase().contains(query)
                || skill.getKind().toLowerCase().contains(query)
                || skill.getTags().stream().anyMatch(tag -> tag.toLowerCase().contains(query));
    }

    private static JSONObject summary(Skill skill) {
        return Json.obj(
                "id", skill.getId(),
                "slug", skill.getSlug(),
                "name", skill.getName(),
                "kind", skill.getKind(),
                "description", skill.getDescription(),
                "whenToUse", skill.getWhenToUse(),
                "tags", Json.arr(skill.getTags()),
                "sourceJobs", Json.arr(skill.getSourceJobs()),
                "enabled", skill.isEnabled(),
                "version", skill.getVersion(),
                "createdBy", skill.getCreatedBy(),
                "createdAt", skill.getCreatedAt(),
                "updatedAt", skill.getUpdatedAt());
    }

    private static void requireAdmin() throws OperationException {
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            throw OperationException.forbidden("You do not have Overall/Administer permission");
        }
    }
}
