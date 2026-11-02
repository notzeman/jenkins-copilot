package io.jenkins.plugins.copilot.util;

import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Removes credential-looking values before anything crosses the LLM boundary. */
public final class Redactor {

    private static final Set<String> SENSITIVE_KEYS = Set.of(
            "password", "passwd", "secret", "token", "accesstoken", "apikey", "api_key",
            "privatekey", "private_key", "passphrase", "authorization", "cookie", "value",
            "clientsecret", "client_secret", "bearer");

    private static final Pattern XML_ATTRIBUTE =
            Pattern.compile("(?i)(password|secret|token|apiKey|privateKey|passphrase)\\s*=\\s*\"[^\"]*\"");
    private static final Pattern XML_ELEMENT = Pattern.compile(
            "(?is)<(password|secret|token|apiKey|privateKey|passphrase)>(.*?)</\\1>");

    private Redactor() {}

    public static boolean isSensitiveKey(String key) {
        if (key == null) {
            return false;
        }
        String normalized = key.toLowerCase(Locale.ROOT).replace("-", "").replace("_", "");
        return SENSITIVE_KEYS.contains(normalized);
    }

    public static JSONObject redact(JSONObject input) {
        if (input == null) {
            return new JSONObject();
        }
        JSONObject out = new JSONObject();
        for (Object rawKey : input.keySet()) {
            String key = String.valueOf(rawKey);
            Object value = input.get(rawKey);
            if (isSensitiveKey(key)) {
                out.put(key, "[redacted]");
            } else if (value instanceof JSONObject) {
                out.put(key, redact((JSONObject) value));
            } else if (value instanceof JSONArray) {
                out.put(key, redact((JSONArray) value));
            } else {
                out.put(key, value);
            }
        }
        return out;
    }

    private static JSONArray redact(JSONArray input) {
        JSONArray out = new JSONArray();
        for (Object value : input) {
            if (value instanceof JSONObject) {
                out.add(redact((JSONObject) value));
            } else if (value instanceof JSONArray) {
                out.add(redact((JSONArray) value));
            } else {
                out.add(value);
            }
        }
        return out;
    }

    public static String redactXml(String xml) {
        if (xml == null) {
            return null;
        }
        String redacted = XML_ATTRIBUTE.matcher(xml).replaceAll("$1=\"[redacted]\"");
        return XML_ELEMENT.matcher(redacted).replaceAll("<$1>[redacted]</$1>");
    }

    public static String stripCredentialsFromUrl(String url) {
        if (url == null) {
            return null;
        }
        return url.replaceAll("(https?://)[^/@]+@", "$1");
    }

    public static String redactText(String text) {
        if (text == null) {
            return null;
        }
        String out = text;
        out = out.replaceAll("(?i)(bearer\\s+)[A-Za-z0-9._~+/=-]+", "$1[redacted]");
        out = out.replaceAll("(?i)((?:password|passwd|token|secret|api[_-]?key)\\s*[=:]\\s*)\\S+", "$1[redacted]");
        return out;
    }

    /** Only used by tests. */
    static Set<String> sensitiveKeys() {
        return SENSITIVE_KEYS;
    }

    static Iterator<String> keys(JSONObject object) {
        return object.keys();
    }
}
