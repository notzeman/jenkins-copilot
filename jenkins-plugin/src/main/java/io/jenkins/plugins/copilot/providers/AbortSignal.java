package io.jenkins.plugins.copilot.providers;

@FunctionalInterface
public interface AbortSignal {
    boolean isAborted();

    AbortSignal NEVER = () -> false;
}
