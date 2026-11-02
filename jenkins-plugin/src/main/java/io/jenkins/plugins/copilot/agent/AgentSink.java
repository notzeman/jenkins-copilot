package io.jenkins.plugins.copilot.agent;

import com.fasterxml.jackson.databind.JsonNode;
import io.jenkins.plugins.copilot.providers.ToolCall;
import io.jenkins.plugins.copilot.storage.ApprovalRecord;
import io.jenkins.plugins.copilot.tools.ToolSpec;

public interface AgentSink {
    void text(String delta);

    default void reasoning(String delta) {}

    void toolStart(ToolCall call, ToolSpec spec, JsonNode args);

    void toolResult(ToolCall call, JsonNode output);

    void toolError(ToolCall call, String error);

    void approvalRequired(ApprovalRecord approval);
}
