package io.jenkins.plugins.copilot.storage;

import io.jenkins.plugins.copilot.providers.ChatMessage;
import java.util.ArrayList;
import java.util.List;

public class ApprovalRecord {
    private String approvalId;
    private String toolCallId;
    private String toolName;
    private String target;
    private String argsJson;
    private int risk;
    private String reason;
    private String diff;
    private String validationJson;
    private long createdAt = System.currentTimeMillis();
    private long expiresAt = System.currentTimeMillis() + 30 * 60 * 1000L;
    private String status = "pending";
    private String decidedBy;
    private String comment;

    public String getApprovalId() {
        return approvalId;
    }

    public void setApprovalId(String approvalId) {
        this.approvalId = approvalId;
    }

    public String getToolCallId() {
        return toolCallId;
    }

    public void setToolCallId(String toolCallId) {
        this.toolCallId = toolCallId;
    }

    public String getToolName() {
        return toolName;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getArgsJson() {
        return argsJson;
    }

    public void setArgsJson(String argsJson) {
        this.argsJson = argsJson;
    }

    public int getRisk() {
        return risk;
    }

    public void setRisk(int risk) {
        this.risk = risk;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDiff() {
        return diff;
    }

    public void setDiff(String diff) {
        this.diff = diff;
    }

    public String getValidationJson() {
        return validationJson;
    }

    public void setValidationJson(String validationJson) {
        this.validationJson = validationJson;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDecidedBy() {
        return decidedBy;
    }

    public void setDecidedBy(String decidedBy) {
        this.decidedBy = decidedBy;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public boolean pending() {
        return "pending".equals(status);
    }
}
