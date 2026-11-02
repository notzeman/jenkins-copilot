package io.jenkins.plugins.copilot.util;

import hudson.model.Job;
import hudson.model.Run;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.kohsuke.stapler.Stapler;
import org.kohsuke.stapler.StaplerRequest2;

/** Resolves the page context on the server; the browser cannot spoof it. */
public final class Contexts {

    private Contexts() {}

    public static JSONObject current() {
        JSONObject context = Json.obj(
                "jenkinsUrl", Jenkins.get().getRootUrl(),
                "controller", Jenkins.get().getRootUrl());
        StaplerRequest2 request = Stapler.getCurrentRequest2();
        if (request == null) {
            return context;
        }
        Job<?, ?> job = request.findAncestorObject(Job.class);
        if (job != null) {
            context.put("jobFullName", job.getFullName());
            context.put("jobUrl", JobOperationsUrls.absolute(job.getUrl()));
            context.put("jobType", job.getClass().getSimpleName());
        }
        Run<?, ?> run = request.findAncestorObject(Run.class);
        if (run != null) {
            context.put("jobFullName", run.getParent().getFullName());
            context.put("jobUrl", JobOperationsUrls.absolute(run.getParent().getUrl()));
            context.put("buildNumber", run.getNumber());
            context.put("buildUrl", JobOperationsUrls.absolute(run.getUrl()));
            context.put("buildResult", run.getResult() == null ? null : run.getResult().toString());
        }
        return context;
    }

    /** Avoids a dependency cycle between util and ops. */
    private static final class JobOperationsUrls {
        static String absolute(String relative) {
            String root = Jenkins.get().getRootUrl();
            return root == null ? relative : root.replaceAll("/+$", "") + "/" + relative.replaceAll("^/+", "");
        }
    }
}
