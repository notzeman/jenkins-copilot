package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/** Minimal JSON Schema validation for tool arguments: type, required, enum, minimum, maximum, items. */
public final class SchemaValidator {

    private SchemaValidator() {}

    public static List<String> validate(JsonNode schema, JsonNode value) {
        List<String> errors = new ArrayList<>();
        validate(schema, value, "args", errors);
        return errors;
    }

    private static void validate(JsonNode schema, JsonNode value, String path, List<String> errors) {
        if (schema == null || schema.isNull()) {
            return;
        }
        String type = schema.path("type").asText(null);
        if (type != null && !matchesType(type, value)) {
            errors.add(path + " must be " + type);
            return;
        }
        if (value == null || value.isNull()) {
            return;
        }
        if (value.isObject()) {
            JsonNode required = schema.get("required");
            if (required != null && required.isArray()) {
                for (JsonNode name : required) {
                    if (!value.has(name.asText()) || value.get(name.asText()).isNull()) {
                        errors.add(path + "." + name.asText() + " is required");
                    }
                }
            }
            JsonNode properties = schema.get("properties");
            if (properties != null && properties.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = value.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> field = fields.next();
                    if (properties.has(field.getKey())) {
                        validate(properties.get(field.getKey()), field.getValue(), path + "." + field.getKey(), errors);
                    }
                }
            }
        }
        if (value.isArray()) {
            JsonNode items = schema.get("items");
            if (items != null) {
                for (int i = 0; i < value.size(); i++) {
                    validate(items, value.get(i), path + "[" + i + "]", errors);
                }
            }
        }
        if (schema.has("enum")) {
            boolean found = false;
            for (JsonNode option : schema.get("enum")) {
                if (option.equals(value)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                errors.add(path + " must be one of " + schema.get("enum"));
            }
        }
        if (value.isNumber()) {
            if (schema.has("minimum") && value.asDouble() < schema.get("minimum").asDouble()) {
                errors.add(path + " must be >= " + schema.get("minimum").asDouble());
            }
            if (schema.has("maximum") && value.asDouble() > schema.get("maximum").asDouble()) {
                errors.add(path + " must be <= " + schema.get("maximum").asDouble());
            }
        }
        if (schema.has("const") && !schema.get("const").equals(value)) {
            errors.add(path + " must be " + schema.get("const"));
        }
    }

    private static boolean matchesType(String type, JsonNode value) {
        return switch (type) {
            case "object" -> value == null || value.isNull() || value.isObject();
            case "array" -> value == null || value.isNull() || value.isArray();
            case "string" -> value == null || value.isNull() || value.isTextual();
            case "integer" -> value == null || value.isNull() || value.isIntegralNumber();
            case "number" -> value == null || value.isNull() || value.isNumber();
            case "boolean" -> value == null || value.isNull() || value.isBoolean();
            default -> true;
        };
    }
}
