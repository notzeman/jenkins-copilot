package io.jenkins.plugins.copilot.util;

import hudson.model.Job;
import hudson.model.Run;
import jenkins.branch.MultiBranchProject;
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
        Run<?, ?> run = request.findAncestorObject(Run.class);
        if (run != null) {
            job = run.getParent();
        }
        if (job != null) {
            context.put("jobFullName", job.getFullName());
            context.put("jobUrl", absolute(job.getUrl()));
            context.put("jobType", job.getClass().getSimpleName());
            context.put("pipeline", pipelineKey(job));
            context.put("jobHealthScore", job.getBuildHealth().getScore());

            Run<?, ?> last = job.getLastCompletedBuild();
            if (last == null) {
                last = job.getLastBuild();
            }
            if (last != null) {
                context.put("lastBuildNumber", last.getNumber());
                context.put("lastBuildUrl", absolute(last.getUrl()));
                context.put("lastBuildResult", last.getResult() == null ? null : last.getResult().toString());
            }
        }
        if (run != null) {
            context.put("buildNumber", run.getNumber());
            context.put("buildUrl", absolute(run.getUrl()));
            context.put("buildResult", run.getResult() == null ? null : run.getResult().toString());
            if (run.getResult() != null) {
                context.put("lastBuildResult", run.getResult().toString());
            }
        }
        return context;
    }

    /**
     * Groups multibranch branches under the parent project; every other job is its own pipeline.
     * This is the key the session list groups by.
     */
    public static String pipelineKey(Job<?, ?> job) {
        if (job == null) {
            return null;
        }
        if (job.getParent() instanceof MultiBranchProject<?, ?> parent) {
            return parent.getFullName();
        }
        return job.getFullName();
    }

    private static String absolute(String relative) {
        String root = Jenkins.get().getRootUrl();
        return root == null ? relative : root.replaceAll("/+$", "") + "/" + relative.replaceAll("^/+", "");
    }
}
