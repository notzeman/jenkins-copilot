package io.jenkins.plugins.copilot.providers;

import jenkins.model.Jenkins;

/** Identifies the plugin to provider gateways instead of a generic HTTP-library User-Agent. */
public final class UserAgent {

    private UserAgent() {}

    public static String value() {
        try {
            var plugin = Jenkins.get().getPluginManager().getPlugin("jenkins-ai-copilot");
            if (plugin != null && plugin.getVersion() != null && !plugin.getVersion().isBlank()) {
                return "jenkins-ai-copilot/" + plugin.getVersion();
            }
        } catch (Throwable ignored) {
            // Unit tests and early startup have no Jenkins context.
        }
        return "jenkins-ai-copilot/0.1.0";
    }
}
