package io.jenkins.plugins.copilot.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.File;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/** Global, admin-managed skills stored as Markdown bodies inside one atomic JSON file. */
public class SkillStore {

    private static final Object LOCK = new Object();
    private static final int MAX_BODY = 32_000;
    private static final int MAX_NAME = 120;
    private static final int MAX_TEXT = 500;
    private static final int MAX_KIND = 40;
    private static final int MAX_TAGS = 12;
    private static final int MAX_TAG_LENGTH = 40;
    private static final int MAX_SOURCES = 50;

    public File file() {
        return new File(CopilotStorage.dir("skills"), "skills.json");
    }

    public synchronized List<Skill> list() {
        List<Skill> out = new ArrayList<>();
        for (JsonNode node : load().path("skills")) {
            try {
                out.add(fromNode(node));
            } catch (Exception ignored) {
                // Skip a malformed skill rather than losing the rest of the store.
            }
        }
        out.sort(Comparator.comparing(Skill::getName, String.CASE_INSENSITIVE_ORDER));
        return out;
    }

    public synchronized Skill get(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }
        String value = key.trim();
        for (Skill skill : list()) {
            if (value.equalsIgnoreCase(skill.getId())
                    || value.equalsIgnoreCase(skill.getSlug())
                    || value.equalsIgnoreCase(skill.getName())) {
                return skill;
            }
        }
        return null;
    }

    public synchronized Skill save(Skill input, String user) {
        validate(input);
        ObjectNode root = load();
        ArrayNode skills = root.withArray("skills");
        Skill existing = input.getId() == null || input.getId().isBlank() ? null : get(input.getId());
        if (input.getId() != null && !input.getId().isBlank() && existing == null) {
            throw new IllegalArgumentException("Unknown skill id: " + input.getId());
        }
        String id = existing == null ? UUID.randomUUID().toString() : existing.getId();
        String slug = existing == null ? uniqueSlug(slugify(input.getName()), null) : existing.getSlug();
        if (input.getSlug() != null && !input.getSlug().isBlank()) {
            String requested = slugify(input.getSlug());
            if (existing == null || !requested.equals(existing.getSlug())) {
                slug = uniqueSlug(requested, id);
            }
        }
        for (Skill other : list()) {
            if (!id.equals(other.getId()) && other.getName().equalsIgnoreCase(input.getName())) {
                throw new IllegalArgumentException("A skill named '" + input.getName() + "' already exists");
            }
        }

        Skill skill = new Skill();
        skill.setId(id);
        skill.setSlug(slug);
        skill.setName(input.getName().trim());
        skill.setKind(blankTo(input.getKind(), "general"));
        skill.setDescription(trim(input.getDescription(), MAX_TEXT));
        skill.setWhenToUse(trim(input.getWhenToUse(), MAX_TEXT));
        skill.setBody(input.getBody() == null ? "" : input.getBody().trim());
        skill.setTags(normalize(input.getTags(), MAX_TAGS, MAX_TAG_LENGTH));
        skill.setSourceJobs(normalize(input.getSourceJobs(), MAX_SOURCES, 300));
        skill.setEnabled(input.isEnabled());
        skill.setCreatedBy(existing == null ? user : existing.getCreatedBy());
        skill.setCreatedAt(existing == null ? System.currentTimeMillis() : existing.getCreatedAt());
        skill.setUpdatedAt(System.currentTimeMillis());
        skill.setVersion(existing == null ? 1 : existing.getVersion() + 1);

        ArrayNode replaced = Jackson.arr();
        boolean found = false;
        for (JsonNode node : skills) {
            if (id.equals(node.path("id").asText())) {
                replaced.add(toNode(skill));
                found = true;
            } else {
                replaced.add(node);
            }
        }
        if (!found) {
            replaced.add(toNode(skill));
        }
        root.set("skills", replaced);
        save(root);
        return skill;
    }

    public synchronized boolean delete(String key) {
        Skill skill = get(key);
        if (skill == null) {
            return false;
        }
        ObjectNode root = load();
        ArrayNode kept = Jackson.arr();
        for (JsonNode node : root.path("skills")) {
            if (!skill.getId().equals(node.path("id").asText())) {
                kept.add(node);
            }
        }
        root.set("skills", kept);
        save(root);
        return true;
    }

    public synchronized Skill setEnabled(String key, boolean enabled) {
        Skill skill = get(key);
        if (skill == null) {
            return null;
        }
        skill.setEnabled(enabled);
        return save(skill, skill.getCreatedBy() == null ? "unknown" : skill.getCreatedBy());
    }

    /** Compact catalogue for the system prompt; bodies stay out until get_skill is called. */
    public synchronized String catalogText(int limit) {
        StringBuilder out = new StringBuilder();
        for (Skill skill : list()) {
            if (!skill.isEnabled()) {
                continue;
            }
            if (out.length() > 0) {
                out.append('\n');
            }
            out.append("- ")
                    .append(skill.getSlug())
                    .append(": ")
                    .append(trim(skill.getName(), 80));
            if (skill.getDescription() != null && !skill.getDescription().isBlank()) {
                out.append(" — ").append(trim(skill.getDescription(), 140));
            }
            if (skill.getWhenToUse() != null && !skill.getWhenToUse().isBlank()) {
                out.append(" [when: ").append(trim(skill.getWhenToUse(), 140)).append(']');
            }
            if (skill.getTags() != null && !skill.getTags().isEmpty()) {
                out.append(" (tags: ").append(String.join(", ", skill.getTags())).append(')');
            }
            if (limit > 0 && out.toString().split("\\n").length >= limit) {
                break;
            }
        }
        return out.toString();
    }

    private static void validate(Skill input) {
        if (input == null) {
            throw new IllegalArgumentException("Skill is required");
        }
        String name = input.getName() == null ? "" : input.getName().trim();
        if (name.isBlank()) {
            throw new IllegalArgumentException("Skill name is required");
        }
        if (name.length() > MAX_NAME) {
            throw new IllegalArgumentException("Skill name must be " + MAX_NAME + " characters or fewer");
        }
        input.setName(name);
        String body = input.getBody() == null ? "" : input.getBody().trim();
        if (body.isBlank()) {
            throw new IllegalArgumentException("Skill body is required");
        }
        if (body.length() > MAX_BODY) {
            throw new IllegalArgumentException("Skill body must be " + MAX_BODY + " characters or fewer");
        }
        if (input.getDescription() != null && input.getDescription().length() > MAX_TEXT) {
            throw new IllegalArgumentException("Skill description must be " + MAX_TEXT + " characters or fewer");
        }
        if (input.getWhenToUse() != null && input.getWhenToUse().length() > MAX_TEXT) {
            throw new IllegalArgumentException("whenToUse must be " + MAX_TEXT + " characters or fewer");
        }
        if (input.getKind() != null && input.getKind().length() > MAX_KIND) {
            throw new IllegalArgumentException("Skill kind must be " + MAX_KIND + " characters or fewer");
        }
    }

    private static List<String> normalize(List<String> values, int max, int itemMax) {
        List<String> out = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        if (values == null) {
            return out;
        }
        for (String value : values) {
            String trimmed = trim(value, itemMax);
            if (trimmed.isBlank() || !seen.add(trimmed.toLowerCase(Locale.ROOT))) {
                continue;
            }
            out.add(trimmed);
            if (out.size() >= max) {
                break;
            }
        }
        return out;
    }

    private static String uniqueSlug(String base, String exceptId) {
        String slug = base.isBlank() ? "skill" : base;
        Set<String> taken = new HashSet<>();
        for (Skill skill : new SkillStore().list()) {
            if (exceptId == null || !exceptId.equals(skill.getId())) {
                taken.add(skill.getSlug());
            }
        }
        String candidate = slug;
        int suffix = 2;
        while (taken.contains(candidate)) {
            candidate = slug + "-" + suffix++;
        }
        return candidate;
    }

    private static String slugify(String value) {
        String slug = value == null ? "" : value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        return slug.length() > 80 ? slug.substring(0, 80) : slug;
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static String trim(String value, int max) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private ObjectNode load() {
        File file = file();
        if (file.isFile()) {
            try {
                ObjectNode root = (ObjectNode) Jackson.MAPPER.readTree(file);
                if (root.has("skills") && root.get("skills").isArray()) {
                    return root;
                }
            } catch (Exception ignored) {
                // Fall through to an empty store.
            }
        }
        ObjectNode root = Jackson.obj();
        root.set("skills", Jackson.arr());
        return root;
    }

    private void save(JsonNode root) {
        try {
            CopilotStorage.atomicWrite(file(), Jackson.MAPPER.writeValueAsBytes(root));
        } catch (Exception e) {
            throw new IllegalStateException("Could not save skills", e);
        }
    }

    private static ObjectNode toNode(Skill skill) {
        return (ObjectNode) Jackson.MAPPER.valueToTree(skill);
    }

    private static Skill fromNode(JsonNode node) {
        try {
            Skill skill = Jackson.MAPPER.treeToValue(node, Skill.class);
            if (skill.getTags() == null) {
                skill.setTags(new ArrayList<>());
            }
            if (skill.getSourceJobs() == null) {
                skill.setSourceJobs(new ArrayList<>());
            }
            if (skill.getKind() == null || skill.getKind().isBlank()) {
                skill.setKind("general");
            }
            return skill;
        } catch (Exception e) {
            throw new IllegalStateException("Could not read skill", e);
        }
    }
}
