package io.jenkins.plugins.copilot.providers;

import java.util.ArrayList;
import java.util.List;

/** A normalized conversation message independent of provider wire formats. */
public class ChatMessage {
    public enum Role {
        SYSTEM,
        USER,
        ASSISTANT,
        TOOL
    }

    private Role role;
    private String content = "";
    private List<ToolCall> toolCalls = new ArrayList<>();
    private String toolCallId;
    private List<AttachmentRef> images = new ArrayList<>();

    public ChatMessage() {}

    public ChatMessage(Role role, String content) {
        this.role = role;
        this.content = content == null ? "" : content;
    }

    public static ChatMessage system(String content) {
        return new ChatMessage(Role.SYSTEM, content);
    }

    public static ChatMessage user(String content) {
        return new ChatMessage(Role.USER, content);
    }

    public static ChatMessage assistant(String content, List<ToolCall> toolCalls) {
        ChatMessage message = new ChatMessage(Role.ASSISTANT, content);
        message.setToolCalls(toolCalls == null ? new ArrayList<>() : toolCalls);
        return message;
    }

    public static ChatMessage tool(String toolCallId, String content) {
        ChatMessage message = new ChatMessage(Role.TOOL, content);
        message.setToolCallId(toolCallId);
        return message;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content == null ? "" : content;
    }

    public List<ToolCall> getToolCalls() {
        return toolCalls;
    }

    public void setToolCalls(List<ToolCall> toolCalls) {
        this.toolCalls = toolCalls == null ? new ArrayList<>() : toolCalls;
    }

    public String getToolCallId() {
        return toolCallId;
    }

    public void setToolCallId(String toolCallId) {
        this.toolCallId = toolCallId;
    }

    public List<AttachmentRef> getImages() {
        return images;
    }

    public void setImages(List<AttachmentRef> images) {
        this.images = images == null ? new ArrayList<>() : images;
    }
}
