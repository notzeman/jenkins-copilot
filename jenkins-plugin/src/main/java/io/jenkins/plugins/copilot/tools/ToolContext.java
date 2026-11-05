package io.jenkins.plugins.copilot.tools;

import com.fasterxml.jackson.databind.JsonNode;
import hudson.model.User;
import io.jenkins.plugins.copilot.CopilotGlobalConfiguration;
import io.jenkins.plugins.copilot.storage.ChangePlanStore;
import io.jenkins.plugins.copilot.storage.ConversationStore;
import io.jenkins.plugins.copilot.storage.SkillStore;

/** Per-request services available to tool executors. */
public final class ToolContext {
    private final User user;
    private final String conversationId;
    private final CopilotGlobalConfiguration config;
    private final GitHubService github;
    private final ChangePlanStore plans;
    private final RecoveryService recovery;
    private final ConversationStore conversations;
    private final SkillStore skills;

    public ToolContext(
            User user,
            String conversationId,
            CopilotGlobalConfiguration config,
            GitHubService github,
            ChangePlanStore plans,
            RecoveryService recovery,
            ConversationStore conversations,
            SkillStore skills) {
        this.user = user;
        this.conversationId = conversationId;
        this.config = config;
        this.github = github;
        this.plans = plans;
        this.recovery = recovery;
        this.conversations = conversations;
        this.skills = skills;
    }

    public User user() {
        return user;
    }

    public String conversationId() {
        return conversationId;
    }

    public CopilotGlobalConfiguration config() {
        return config;
    }

    public GitHubService github() {
        return github;
    }

    public ChangePlanStore plans() {
        return plans;
    }

    public RecoveryService recovery() {
        return recovery;
    }

    public ConversationStore conversations() {
        return conversations;
    }

    public SkillStore skills() {
        return skills;
    }

    /** Convenience for tools that accept a job argument. */
    public static String target(JsonNode args) {
        if (args == null) {
            return null;
        }
        for (String key : new String[] {
                    "job", "view", "node", "plugin", "folder", "id", "sid",
                    "environment", "name", "source", "repoUrl", "planId"
                }) {
            JsonNode value = args.get(key);
            if (value != null && !value.isNull()) {
                return value.asText();
            }
        }
        return null;
    }
}
