package io.jenkins.plugins.copilot.agent;

import hudson.model.User;
import io.jenkins.plugins.copilot.providers.AttachmentLoader;
import io.jenkins.plugins.copilot.providers.ChatMessage;
import io.jenkins.plugins.copilot.providers.Provider;
import io.jenkins.plugins.copilot.providers.ProviderConfig;
import io.jenkins.plugins.copilot.providers.ThinkingLevel;
import io.jenkins.plugins.copilot.tools.ToolContext;
import java.util.ArrayList;
import java.util.List;

public class AgentRequest {
    private final User user;
    private final String conversationId;
    private final ProviderConfig provider;
    private final Provider providerOverride;
    private final String model;
    private final ThinkingLevel thinking;
    private final List<ChatMessage> messages;
    private final ToolContext tools;
    private final AttachmentLoader attachments;
    private final boolean autoApproveLevel2;
    private boolean autoApproveAll = false;
    private final int maxSteps;
    private final int timeoutSeconds;
    private String pageContext = "{}";

    public AgentRequest(
            User user,
            String conversationId,
            ProviderConfig provider,
            String model,
            ThinkingLevel thinking,
            List<ChatMessage> messages,
            ToolContext tools,
            AttachmentLoader attachments,
            boolean autoApproveLevel2,
            int maxSteps,
            int timeoutSeconds) {
        this.user = user;
        this.conversationId = conversationId;
        this.provider = provider;
        this.providerOverride = null;
        this.model = model;
        this.thinking = thinking == null ? ThinkingLevel.AUTO : thinking;
        this.messages = messages == null ? new ArrayList<>() : new ArrayList<>(messages);
        this.tools = tools;
        this.attachments = attachments;
        this.autoApproveLevel2 = autoApproveLevel2;
        this.maxSteps = Math.max(1, maxSteps);
        this.timeoutSeconds = Math.max(30, timeoutSeconds);
    }

    public AgentRequest(
            User user,
            String conversationId,
            ProviderConfig provider,
            Provider providerOverride,
            String model,
            ThinkingLevel thinking,
            List<ChatMessage> messages,
            ToolContext tools,
            AttachmentLoader attachments,
            boolean autoApproveLevel2,
            int maxSteps,
            int timeoutSeconds) {
        this.user = user;
        this.conversationId = conversationId;
        this.provider = provider;
        this.providerOverride = providerOverride;
        this.model = model;
        this.thinking = thinking == null ? ThinkingLevel.AUTO : thinking;
        this.messages = messages == null ? new ArrayList<>() : new ArrayList<>(messages);
        this.tools = tools;
        this.attachments = attachments;
        this.autoApproveLevel2 = autoApproveLevel2;
        this.maxSteps = Math.max(1, maxSteps);
        this.timeoutSeconds = Math.max(30, timeoutSeconds);
    }

    public User user() {
        return user;
    }

    public String conversationId() {
        return conversationId;
    }

    public ProviderConfig provider() {
        return provider;
    }

    public Provider providerOverride() {
        return providerOverride;
    }


    public String model() {
        return model;
    }

    public ThinkingLevel thinking() {
        return thinking;
    }

    public List<ChatMessage> messages() {
        return messages;
    }

    public ToolContext tools() {
        return tools;
    }

    public AttachmentLoader attachments() {
        return attachments;
    }

    public boolean autoApproveLevel2() {
        return autoApproveLevel2;
    }

    public boolean autoApproveAll() {
        return autoApproveAll;
    }

    public void setAutoApproveAll(boolean autoApproveAll) {
        this.autoApproveAll = autoApproveAll;
    }

    public int maxSteps() {
        return maxSteps;
    }

    public int timeoutSeconds() {
        return timeoutSeconds;
    }

    public String pageContext() {
        return pageContext;
    }

    public void setPageContext(String pageContext) {
        this.pageContext = pageContext == null || pageContext.isBlank() ? "{}" : pageContext;
    }
}
