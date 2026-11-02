package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;

/** A tool exposed to the model. */
public final class ToolSpec {
    private final String name;
    private final String description;
    private final JsonNode parameters;
    private final int risk;
    private final String reason;

    public ToolSpec(String name, String description, JsonNode parameters, int risk, String reason) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
        this.risk = risk;
        this.reason = reason;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public JsonNode getParameters() {
        return parameters;
    }

    public int getRisk() {
        return risk;
    }

    public String getReason() {
        return reason;
    }
}
