package io.jenkins.plugins.copilot;

import hudson.Extension;
import hudson.model.PageDecorator;
import hudson.model.Job;
import hudson.model.Run;
import io.jenkins.plugins.copilot.util.Contexts;
import jenkins.model.Jenkins;
import org.kohsuke.stapler.Stapler;

/** Injects the assistant mount point on every Jenkins page. */
@Extension
public class CopilotPageDecorator extends PageDecorator {

    public boolean isVisible() {
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        return config.isEnabled()
                && config.isSidebarEnabled()
                && Jenkins.get().hasPermission(Jenkins.READ);
    }

    public String getContextJson() {
        return Contexts.current().toString();
    }

    /** Root-action endpoints: session, chat, decision, api, ops. */
    public String getApiUrl() {
        String root = Jenkins.get().getRootUrl();
        String base = root == null ? "/" : root;
        return base.replaceAll("/+$", "") + "/jenkins-ai-copilot/";
    }

    /** Static webapp asset served by the plugin classloader. */
    public String getUiUrl() {
        String root = Jenkins.get().getRootUrl();
        String base = root == null ? "/" : root;
        return base.replaceAll("/+$", "") + "/plugin/jenkins-ai-copilot/ui/copilot.js";
    }

    public int getMaxSteps() {
        return CopilotGlobalConfiguration.get().getMaxSteps();
    }

    public String getPluginVersion() {
        hudson.PluginWrapper plugin = Jenkins.get().getPluginManager().getPlugin("jenkins-ai-copilot");
        return plugin == null ? "development" : plugin.getVersion();
    }
}
