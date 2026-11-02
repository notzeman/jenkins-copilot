package io.jenkins.plugins.copilot.providers;

/** Loads attachment bytes for a stored reference. */
@FunctionalInterface
public interface AttachmentLoader {
    byte[] load(AttachmentRef ref) throws Exception;
}
