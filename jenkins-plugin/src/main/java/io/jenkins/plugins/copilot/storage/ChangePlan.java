package io.jenkins.plugins.copilot.storage;

public class ChangePlan {
    private String id;
    private String conversationId;
    private String kind;
    private String target;
    private String sourceHash;
    private String proposedJson;
    private String diff;
    private String validationJson;
    private int risk = 3;
    private String status = "proposed";
    private long createdAt = System.currentTimeMillis();
    private Long appliedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getSourceHash() {
        return sourceHash;
    }

    public void setSourceHash(String sourceHash) {
        this.sourceHash = sourceHash;
    }

    public String getProposedJson() {
        return proposedJson;
    }

    public void setProposedJson(String proposedJson) {
        this.proposedJson = proposedJson;
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

    public int getRisk() {
        return risk;
    }

    public void setRisk(int risk) {
        this.risk = risk;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Long appliedAt) {
        this.appliedAt = appliedAt;
    }
}
