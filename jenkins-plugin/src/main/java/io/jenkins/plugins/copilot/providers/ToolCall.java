package io.jenkins.plugins.copilot.providers;

import java.util.ArrayList;
import java.util.List;

/** One tool call requested by a model. */
public class ToolCall {
    private String id;
    private String name;
    private String arguments;

    public ToolCall() {}

    public ToolCall(String id, String name, String arguments) {
        this.id = id;
        this.name = name;
        this.arguments = arguments;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getArguments() {
        return arguments;
    }

    public void setArguments(String arguments) {
        this.arguments = arguments;
    }

    public static List<ToolCall> list() {
        return new ArrayList<>();
    }
}
