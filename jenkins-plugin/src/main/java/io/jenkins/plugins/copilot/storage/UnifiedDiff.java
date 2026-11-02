package io.jenkins.plugins.copilot.storage;

import java.util.ArrayList;
import java.util.List;

/** Small LCS-based unified diff for pipeline previews. Bounded to avoid pathological inputs. */
public final class UnifiedDiff {

    private UnifiedDiff() {}

    public static String diff(String path, String oldText, String newText) {
        String[] a = oldText == null ? new String[0] : oldText.split("\n", -1);
        String[] b = newText == null ? new String[0] : newText.split("\n", -1);
        if (a.length > 2000 || b.length > 2000) {
            return fallback(path, a, b);
        }
        int[][] lcs = new int[a.length + 1][b.length + 1];
        for (int i = a.length - 1; i >= 0; i--) {
            for (int j = b.length - 1; j >= 0; j--) {
                lcs[i][j] = a[i].equals(b[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
            }
        }
        List<String> lines = new ArrayList<>();
        lines.add("--- a/" + path);
        lines.add("+++ b/" + path);
        lines.add("@@ -1," + a.length + " +1," + b.length + " @@");
        int i = 0;
        int j = 0;
        while (i < a.length && j < b.length) {
            if (a[i].equals(b[j])) {
                lines.add(" " + a[i]);
                i++;
                j++;
            } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
                lines.add("-" + a[i++]);
            } else {
                lines.add("+" + b[j++]);
            }
        }
        while (i < a.length) {
            lines.add("-" + a[i++]);
        }
        while (j < b.length) {
            lines.add("+" + b[j++]);
        }
        return trim(lines);
    }

    private static String fallback(String path, String[] a, String[] b) {
        List<String> lines = new ArrayList<>();
        lines.add("--- a/" + path);
        lines.add("+++ b/" + path);
        lines.add("@@ full file (too large for a line diff) @@");
        for (String line : a) {
            lines.add("-" + line);
        }
        for (String line : b) {
            lines.add("+" + line);
        }
        return trim(lines);
    }

    private static String trim(List<String> lines) {
        String joined = String.join("\n", lines);
        return joined.length() > 40_000 ? joined.substring(0, 40_000) + "\n…[diff truncated]" : joined;
    }
}
