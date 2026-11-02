package io.jenkins.plugins.copilot.storage;

import io.jenkins.plugins.copilot.providers.ChatMessage;
import java.util.ArrayList;
import java.util.List;

public class Conversation {
    private String id;
    private String userId;
    private String title = "New conversation";
    private String provider = "openai";
    private String model = "";
    private String thinking = "AUTO";
    private long createdAt = System.currentTimeMillis();
    private long updatedAt = System.currentTimeMillis();
    private List<ChatMessage> messages = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title == null || title.isBlank() ? "New conversation" : title;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getThinking() {
        return thinking;
    }

    public void setThinking(String thinking) {
        this.thinking = thinking;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages == null ? new ArrayList<>() : messages;
    }
}
