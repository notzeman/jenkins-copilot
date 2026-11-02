package io.jenkins.plugins.copilot.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public final class Jackson {
    public static final ObjectMapper MAPPER = new ObjectMapper();

    private Jackson() {}

    public static ObjectNode obj() {
        return MAPPER.createObjectNode();
    }

    public static ArrayNode arr() {
        return MAPPER.createArrayNode();
    }

    public static JsonNode parse(String json) {
        try {
            return MAPPER.readTree(json == null || json.isBlank() ? "{}" : json);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JSON: " + e.getMessage(), e);
        }
    }

    public static String write(JsonNode node) {
        try {
            return MAPPER.writeValueAsString(node);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static String pretty(JsonNode node) {
        try {
            return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
