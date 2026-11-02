package io.jenkins.plugins.copilot.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Iterator;
import java.util.Map;
import net.sf.json.JSONArray;
import net.sf.json.JSONNull;
import net.sf.json.JSONObject;

/** Bridges Jackson (provider/tool schemas) and net.sf.json (existing Jenkins operations). */
public final class JsonBridge {

    private JsonBridge() {}

    public static JSONObject toNetSf(JsonNode node) {
        JSONObject out = new JSONObject();
        if (node == null || !node.isObject()) {
            return out;
        }
        Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            out.put(entry.getKey(), toNetSfValue(entry.getValue()));
        }
        return out;
    }

    private static Object toNetSfValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return JSONNull.getInstance();
        }
        if (node.isObject()) {
            return toNetSf(node);
        }
        if (node.isArray()) {
            JSONArray array = new JSONArray();
            for (JsonNode item : node) {
                array.add(toNetSfValue(item));
            }
            return array;
        }
        if (node.isBoolean()) {
            return node.booleanValue();
        }
        if (node.isIntegralNumber()) {
            return node.longValue();
        }
        if (node.isFloatingPointNumber()) {
            return node.doubleValue();
        }
        return node.asText();
    }

    public static JsonNode toJackson(JSONObject object) {
        ObjectNode out = Jackson.obj();
        if (object == null) {
            return out;
        }
        for (Object key : object.keySet()) {
            out.set(String.valueOf(key), toJacksonValue(object.get(key)));
        }
        return out;
    }

    public static JsonNode toJackson(JSONArray array) {
        ArrayNode out = Jackson.arr();
        for (Object item : array) {
            out.add(toJacksonValue(item));
        }
        return out;
    }

    private static JsonNode toJacksonValue(Object value) {
        if (value == null || value == JSONNull.getInstance() || value instanceof JSONNull) {
            return NullNode.getInstance();
        }
        if (value instanceof JSONObject object) {
            return toJackson(object);
        }
        if (value instanceof JSONArray array) {
            return toJackson(array);
        }
        if (value instanceof Boolean bool) {
            return Jackson.MAPPER.getNodeFactory().booleanNode(bool);
        }
        if (value instanceof Integer number) {
            return Jackson.MAPPER.getNodeFactory().numberNode(number);
        }
        if (value instanceof Long number) {
            return Jackson.MAPPER.getNodeFactory().numberNode(number);
        }
        if (value instanceof Double number) {
            return Jackson.MAPPER.getNodeFactory().numberNode(number);
        }
        if (value instanceof Number number) {
            return Jackson.MAPPER.getNodeFactory().numberNode(number.doubleValue());
        }
        return Jackson.MAPPER.getNodeFactory().textNode(String.valueOf(value));
    }
}
