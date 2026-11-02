package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;
import hudson.model.User;
import io.jenkins.plugins.copilot.ops.OperationException;
import io.jenkins.plugins.copilot.ops.Operations;
import io.jenkins.plugins.copilot.util.Jackson;
import io.jenkins.plugins.copilot.util.JsonBridge;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONObject;

/**
 * The complete tool catalog. Jenkins operations map directly to the existing typed gateway;
 * a few tools use Java services for GitHub, pipeline plans, and recovery.
 */
public final class ToolCatalog {

    public static final class Entry {
        private final ToolSpec spec;
        private final String operation;
        private final String executor;

        Entry(ToolSpec spec, String operation, String executor) {
            this.spec = spec;
            this.operation = operation;
            this.executor = executor;
        }

        public ToolSpec spec() {
            return spec;
        }

        public String operation() {
            return operation;
        }

        public String executor() {
            return executor;
        }
    }

    private static final Map<String, Entry> ENTRIES = load();

    private ToolCatalog() {}

    public static List<ToolSpec> specs() {
        List<ToolSpec> specs = new ArrayList<>();
        for (Entry entry : ENTRIES.values()) {
            specs.add(entry.spec());
        }
        return specs;
    }

    public static Entry require(String name) throws ToolException {
        Entry entry = ENTRIES.get(name);
        if (entry == null) {
            throw new ToolException("Unknown tool: " + name);
        }
        return entry;
    }

    public static JsonNode execute(String name, JsonNode args, ToolContext context) throws Exception {
        Entry entry = require(name);
        List<String> errors = SchemaValidator.validate(entry.spec().getParameters(), args);
        if (!errors.isEmpty()) {
            throw new ToolException("Invalid arguments for " + name + ": " + String.join("; ", errors));
        }
        if (entry.operation() != null) {
            JSONObject result = Operations.require(entry.operation())
                    .handler()
                    .handle(JsonBridge.toNetSf(args), context.user());
            return JsonBridge.toJackson(result);
        }
        return ToolExecutors.execute(entry.executor(), args, context);
    }

    /** Used by recovery tools that need another Jenkins operation. */
    public static JsonNode callOperation(String name, JsonNode args, User user) throws Exception {
        JSONObject result =
                Operations.require(name).handler().handle(JsonBridge.toNetSf(args), user);
        return JsonBridge.toJackson(result);
    }

    private static Map<String, Entry> load() {
        try (InputStream in = ToolCatalog.class.getResourceAsStream(
                "/io/jenkins/plugins/copilot/tools/tools.json")) {
            if (in == null) {
                throw new IllegalStateException("tools.json is missing");
            }
            JsonNode root = Jackson.MAPPER.readTree(in);
            Map<String, Entry> loaded = new LinkedHashMap<>();
            for (JsonNode node : root.path("tools")) {
                String name = node.path("name").asText();
                ToolSpec spec = new ToolSpec(
                        name,
                        node.path("description").asText(),
                        node.path("parameters"),
                        node.path("risk").asInt(1),
                        node.path("reason").asText(""));
                String operation = node.hasNonNull("operation") ? node.get("operation").asText() : null;
                String executor = node.hasNonNull("executor") ? node.get("executor").asText() : null;
                loaded.put(name, new Entry(spec, operation, executor));
            }
            return Map.copyOf(loaded);
        } catch (Exception e) {
            throw new IllegalStateException("Could not load the tool catalog", e);
        }
    }

    public static class ToolException extends Exception {
        public ToolException(String message) {
            super(message);
        }
    }
}
