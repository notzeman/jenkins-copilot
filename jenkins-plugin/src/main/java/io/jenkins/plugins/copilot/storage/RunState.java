package io.jenkins.plugins.copilot.storage;

import io.jenkins.plugins.copilot.providers.ChatMessage;
import java.util.ArrayList;
import java.util.List;

public class RunState {
    private String conversationId;
    private String userId;
    private String provider;
    private String model;
    private String thinking = "AUTO";
    private long updatedAt = System.currentTimeMillis();
    private List<ChatMessage> messages = new ArrayList<>();
    private List<ApprovalRecord> approvals = new ArrayList<>();

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public List<ApprovalRecord> getApprovals() {
        return approvals;
    }

    public void setApprovals(List<ApprovalRecord> approvals) {
        this.approvals = approvals == null ? new ArrayList<>() : approvals;
    }

    public List<ApprovalRecord> pendingApprovals() {
        List<ApprovalRecord> pending = new ArrayList<>();
        for (ApprovalRecord approval : approvals) {
            if (approval.pending()) {
                pending.add(approval);
            }
        }
        return pending;
    }
}
