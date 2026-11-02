package io.jenkins.plugins.copilot.agent;

import io.jenkins.plugins.copilot.providers.ChatMessage;
import io.jenkins.plugins.copilot.storage.ApprovalRecord;
import java.util.ArrayList;
import java.util.List;

public class AgentOutcome {
    public static final String DONE = "done";
    public static final String AWAITING_APPROVAL = "awaiting_approval";
    public static final String MAX_STEPS = "max_steps";
    public static final String ERROR = "error";

    private String status = DONE;
    private String text = "";
    private String error;
    private List<ChatMessage> messages = new ArrayList<>();
    private List<ApprovalRecord> approvals = new ArrayList<>();

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text == null ? "" : text;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
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
}
