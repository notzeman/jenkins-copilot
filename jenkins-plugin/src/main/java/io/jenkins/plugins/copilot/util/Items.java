package io.jenkins.plugins.copilot.util;

import hudson.model.Item;
import hudson.model.ItemGroup;
import hudson.model.Job;
import hudson.model.Run;
import hudson.security.AccessControlled;
import hudson.security.Permission;
import io.jenkins.plugins.copilot.ops.OperationException;
import jenkins.model.Jenkins;

/** Lookup and authorization helpers. Always called inside an impersonated user context. */
public final class Items {

    private Items() {}

    public static Job<?, ?> job(String fullName) throws OperationException {
        if (fullName == null || fullName.isBlank()) {
            throw OperationException.invalid("job (full name) is required");
        }
        Job<?, ?> job = Jenkins.get().getItemByFullName(fullName, Job.class);
        if (job == null) {
            throw OperationException.notFound("No job named '" + fullName + "'");
        }
        return job;
    }

    public static Run<?, ?> run(Job<?, ?> job, int number) throws OperationException {
        if (number <= 0) {
            throw OperationException.invalid("build number must be positive");
        }
        Run<?, ?> run = job.getBuildByNumber(number);
        if (run == null) {
            throw OperationException.notFound("No build #" + number + " for " + job.getFullName());
        }
        return run;
    }

    public static ItemGroup<?> group(String folder) throws OperationException {
        if (folder == null || folder.isBlank() || "/".equals(folder)) {
            return Jenkins.get();
        }
        Item item = Jenkins.get().getItemByFullName(folder);
        if (!(item instanceof ItemGroup<?> group)) {
            throw OperationException.notFound("No folder named '" + folder + "'");
        }
        return group;
    }

    public static void check(AccessControlled target, Permission permission, String what) throws OperationException {
        if (!target.hasPermission(permission)) {
            throw OperationException.forbidden("You do not have " + permission.getId() + " for " + what);
        }
    }

    public static String displayName(Run<?, ?> run) {
        return run.getDisplayName();
    }
}
