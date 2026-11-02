package io.jenkins.plugins.copilot.util;

import java.util.ArrayList;
import java.util.List;
import net.sf.json.JSONArray;
import net.sf.json.JSONNull;
import net.sf.json.JSONObject;

/** Small, explicit helpers around Jenkins' bundled net.sf.json. */
public final class Json {

    private Json() {}

    public static JSONObject obj(Object... keyValues) {
        if (keyValues.length % 2 != 0) {
            throw new IllegalArgumentException("key/value pairs required");
        }
        JSONObject o = new JSONObject();
        for (int i = 0; i < keyValues.length; i += 2) {
            String key = String.valueOf(keyValues[i]);
            Object value = keyValues[i + 1];
            o.put(key, value == null ? JSONNull.getInstance() : value);
        }
        return o;
    }

    public static JSONArray arr(Iterable<?> values) {
        JSONArray a = new JSONArray();
        for (Object value : values) {
            a.add(value == null ? JSONNull.getInstance() : value);
        }
        return a;
    }

    public static JSONObject error(String code, String message) {
        return obj("ok", false, "error", obj("code", code, "message", message));
    }

    public static String string(JSONObject o, String key, String fallback) {
        if (o == null || !o.has(key) || o.get(key) == JSONNull.getInstance()) {
            return fallback;
        }
        Object v = o.get(key);
        return v == null ? fallback : String.valueOf(v);
    }

    public static String requireString(JSONObject o, String key) {
        String v = string(o, key, null);
        if (v == null || v.isBlank()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return v;
    }

    public static int integer(JSONObject o, String key, int fallback) {
        if (o == null || !o.has(key)) {
            return fallback;
        }
        return o.optInt(key, fallback);
    }

    public static long longValue(JSONObject o, String key, long fallback) {
        if (o == null || !o.has(key)) {
            return fallback;
        }
        return o.optLong(key, fallback);
    }

    public static boolean bool(JSONObject o, String key, boolean fallback) {
        if (o == null || !o.has(key)) {
            return fallback;
        }
        return o.optBoolean(key, fallback);
    }

    public static JSONObject object(JSONObject o, String key) {
        if (o == null || !o.has(key)) {
            return new JSONObject();
        }
        return o.optJSONObject(key) == null ? new JSONObject() : o.optJSONObject(key);
    }

    public static List<String> stringList(JSONObject o, String key) {
        List<String> out = new ArrayList<>();
        if (o == null || !o.has(key)) {
            return out;
        }
        JSONArray a = o.optJSONArray(key);
        if (a == null) {
            return out;
        }
        for (int i = 0; i < a.size(); i++) {
            out.add(a.getString(i));
        }
        return out;
    }

    public static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max) + "\n…[truncated]";
    }
}
