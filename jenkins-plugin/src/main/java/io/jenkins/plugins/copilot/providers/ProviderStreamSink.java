package io.jenkins.plugins.copilot.providers;

/** Receives streaming deltas from a provider. */
public interface ProviderStreamSink {
    void text(String delta);

    default void reasoning(String delta) {}

    default void toolCall(ToolCall call) {}
}
