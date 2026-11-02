package io.jenkins.plugins.copilot.providers;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ProviderResult {
    private String text = "";
    private List<ToolCall> toolCalls = new ArrayList<>();
    private String finishReason = "stop";
    private Map<String, Object> usage = new LinkedHashMap<>();

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text == null ? "" : text;
    }

    public List<ToolCall> getToolCalls() {
        return toolCalls;
    }

    public void setToolCalls(List<ToolCall> toolCalls) {
        this.toolCalls = toolCalls == null ? new ArrayList<>() : toolCalls;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public Map<String, Object> getUsage() {
        return usage;
    }

    public void setUsage(Map<String, Object> usage) {
        this.usage = usage == null ? new LinkedHashMap<>() : usage;
    }
}
