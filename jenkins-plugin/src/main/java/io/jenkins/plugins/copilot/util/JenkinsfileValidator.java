package io.jenkins.plugins.copilot.util;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * Jenkinsfile validation.
 *
 * <p>Declarative pipelines are validated through pipeline-model-definition's own parser. Scripted
 * pipelines get structural checks only; this plugin never executes generated Groovy.
 */
public final class JenkinsfileValidator {

    private JenkinsfileValidator() {}

    public static JSONObject validate(String script) {
        JSONObject out = Json.obj(
                "validated", false,
                "kind", "unknown",
                "errors", new JSONArray(),
                "checks", new JSONArray());
        if (script == null || script.isBlank()) {
            out.put("errors", Json.arr(java.util.List.of("Jenkinsfile is empty")));
            return out;
        }

        JSONArray structural = structuralChecks(script);
        out.put("checks", structural);

        boolean declarative = script.matches("(?s).*\\bpipeline\\s*\\{.*");
        if (!declarative) {
            out.put("kind", "scripted");
            out.put("validated", structural.isEmpty());
            return out;
        }
        out.put("kind", "declarative");
        try {
            Class<?> converter =
                    Class.forName("org.jenkinsci.plugins.pipeline.modeldefinition.parser.Converter");
            Method method = converter.getMethod("scriptToPipelineDef", String.class);
            method.invoke(null, script);
            out.put("validated", structural.isEmpty());
            out.remove("errors");
            out.put("errors", structural);
        } catch (ClassNotFoundException e) {
            out.put("validated", structural.isEmpty());
            out.put("reason", "pipeline-model-definition is not installed; declarative validation unavailable");
            out.put("errors", structural);
        } catch (InvocationTargetException e) {
            JSONArray errors = new JSONArray();
            errors.addAll(structural);
            Throwable cause = e.getCause() == null ? e : e.getCause();
            errors.add(Json.truncate(String.valueOf(cause.getMessage()), 8000));
            out.put("validated", false);
            out.put("errors", errors);
        } catch (Throwable t) {
            JSONArray errors = new JSONArray();
            errors.addAll(structural);
            errors.add(String.valueOf(t.getMessage()));
            out.put("validated", false);
            out.put("errors", errors);
        }
        return out;
    }

    private static JSONArray structuralChecks(String script) {
        JSONArray problems = new JSONArray();
        int braces = 0;
        int brackets = 0;
        int parens = 0;
        boolean inSingle = false;
        boolean inDouble = false;
        boolean escaped = false;
        for (int i = 0; i < script.length(); i++) {
            char c = script.charAt(i);
            if (escaped) {
                escaped = false;
                continue;
            }
            if (c == '\\') {
                escaped = true;
                continue;
            }
            if (c == '\'' && !inDouble) {
                inSingle = !inSingle;
                continue;
            }
            if (c == '"' && !inSingle) {
                inDouble = !inDouble;
                continue;
            }
            if (inSingle || inDouble) {
                continue;
            }
            switch (c) {
                case '{' -> braces++;
                case '}' -> braces--;
                case '[' -> brackets++;
                case ']' -> brackets--;
                case '(' -> parens++;
                case ')' -> parens--;
                default -> {}
            }
            if (braces < 0 || brackets < 0 || parens < 0) {
                problems.add("Unbalanced closing delimiter near offset " + i);
                return problems;
            }
        }
        if (braces != 0) {
            problems.add("Unbalanced braces (" + braces + ")");
        }
        if (brackets != 0) {
            problems.add("Unbalanced square brackets (" + brackets + ")");
        }
        if (parens != 0) {
            problems.add("Unbalanced parentheses (" + parens + ")");
        }
        if (!script.contains("node") && !script.contains("pipeline")) {
            problems.add("Jenkinsfile contains neither a 'pipeline' block nor a 'node' step");
        }
        return problems;
    }
}
