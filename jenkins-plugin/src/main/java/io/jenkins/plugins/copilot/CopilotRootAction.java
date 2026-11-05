package io.jenkins.plugins.copilot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hudson.Extension;
import hudson.model.UnprotectedRootAction;
import hudson.model.User;
import io.jenkins.plugins.copilot.agent.AgentLoop;
import io.jenkins.plugins.copilot.agent.AgentOutcome;
import io.jenkins.plugins.copilot.agent.AgentRequest;
import io.jenkins.plugins.copilot.agent.AgentSink;
import io.jenkins.plugins.copilot.providers.AbortSignal;
import io.jenkins.plugins.copilot.providers.AttachmentLoader;
import io.jenkins.plugins.copilot.providers.AttachmentRef;
import io.jenkins.plugins.copilot.providers.ChatMessage;
import io.jenkins.plugins.copilot.providers.ModelInfo;
import io.jenkins.plugins.copilot.providers.Provider;
import io.jenkins.plugins.copilot.providers.ProviderConfig;
import io.jenkins.plugins.copilot.providers.ProviderFactory;
import io.jenkins.plugins.copilot.providers.ThinkingLevel;
import io.jenkins.plugins.copilot.providers.ToolCall;
import io.jenkins.plugins.copilot.storage.AccountsStore;
import io.jenkins.plugins.copilot.storage.ApprovalRecord;
import io.jenkins.plugins.copilot.storage.ChangePlanStore;
import io.jenkins.plugins.copilot.storage.Conversation;
import io.jenkins.plugins.copilot.storage.GitHubAccount;
import io.jenkins.plugins.copilot.storage.ProviderAccount;
import io.jenkins.plugins.copilot.storage.ConversationStore;
import io.jenkins.plugins.copilot.storage.CopilotStorage;
import io.jenkins.plugins.copilot.storage.RunState;
import io.jenkins.plugins.copilot.storage.Skill;
import io.jenkins.plugins.copilot.storage.SkillStore;
import io.jenkins.plugins.copilot.tools.GitHubService;
import io.jenkins.plugins.copilot.tools.RecoveryService;
import io.jenkins.plugins.copilot.tools.ToolContext;
import io.jenkins.plugins.copilot.tools.ToolSpec;
import io.jenkins.plugins.copilot.util.Contexts;
import io.jenkins.plugins.copilot.util.Jackson;
import io.jenkins.plugins.copilot.util.JsonBridge;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.Base64;
import java.util.Deque;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;
import java.util.logging.Logger;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.kohsuke.stapler.StaplerRequest2;
import org.kohsuke.stapler.StaplerResponse2;
import org.kohsuke.stapler.verb.POST;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;

/**
 * Same-origin plugin API: session, provider setup, model discovery, chat streaming, approvals,
 * conversation history, and attachments. No external service is involved.
 */
@Extension
public class CopilotRootAction implements UnprotectedRootAction {

    private static final Logger LOGGER = Logger.getLogger(CopilotRootAction.class.getName());
    private static final int MAX_BODY = 30 * 1024 * 1024;
    private static final int MAX_MESSAGE_CHARS = 40_000;
    private static final ConcurrentHashMap<String, Deque<Long>> RATE = new ConcurrentHashMap<>();
    private static final int RATE_LIMIT = 20;
    private static final long RATE_WINDOW_MS = 60_000L;

    @Override
    public String getIconFileName() {
        return null;
    }

    @Override
    public String getDisplayName() {
        return null;
    }

    @Override
    public String getUrlName() {
        return "jenkins-ai-copilot";
    }

    public void doPing(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        writeJson(rsp, 200, Jackson.obj().put("ok", true).put("plugin", "jenkins-ai-copilot"));
    }

    public void doSession(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        User user = currentUser();
        ObjectNode out = Jackson.obj();
        out.put("authenticated", user != null);
        out.put("user", user == null ? null : user.getId());
        out.put("isAdmin", config.hasPermissionToConfigure());
        out.set("context", JsonBridge.toJackson(Contexts.current()));
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        ObjectNode publicConfig = (ObjectNode) JsonBridge.toJackson(config.publicConfig());
        publicConfig.put("setupRequired", accounts.providers().isEmpty());
        publicConfig.put("accountsConfigured", !accounts.providers().isEmpty());
        publicConfig.put("githubConfigured", accounts.defaultGithub() != null || config.githubConfigured());
        publicConfig.put("defaultProviderId", accounts.defaultProviderId());
        out.set("config", publicConfig);
        writeJson(rsp, 200, out);
    }

    @POST
    public void doSetup(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required to configure providers");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String providerId = body.path("provider").asText("");
        String apiKey = body.path("apiKey").asText("");
        String baseUrl = body.path("baseUrl").asText("");
        String model = body.path("model").asText("");
        if (!ProviderFactory.SUPPORTED.contains(providerId)) {
            writeError(rsp, 400, "invalid_provider", "Unsupported provider");
            return;
        }
        if (apiKey.isBlank()) {
            writeError(rsp, 400, "missing_api_key", "API key is required");
            return;
        }
        if (ProviderFactory.OPENCODE_GO.equals(providerId) && baseUrl.isBlank()) {
            writeError(rsp, 400, "missing_base_url", "opencode go requires a base URL");
            return;
        }
        Provider provider = ProviderFactory.create(providerId, baseUrl);
        ProviderConfig probe = new ProviderConfig(
                providerId,
                apiKey,
                ProviderFactory.OPENCODE_GO.equals(providerId) ? baseUrl : null);
        try {
            List<ModelInfo> models = provider.listModels(probe);
            if (models.isEmpty()) {
                writeError(rsp, 400, "no_models", "The provider returned no chat models for this key");
                return;
            }
            String selected = model == null || model.isBlank() ? models.get(0).id() : model;
            CopilotGlobalConfiguration.get().saveProvider(providerId, apiKey, baseUrl, selected);
            new ConversationStore().audit(
                    user.getId(),
                    "provider.setup",
                    providerId,
                    "succeeded",
                    "{\"model\":\"" + selected.replace("\"", "") + "\"}");
            ObjectNode out = Jackson.obj();
            out.put("ok", true);
            out.put("provider", providerId);
            out.put("defaultModel", selected);
            out.set("models", Jackson.MAPPER.valueToTree(models));
            writeJson(rsp, 200, out);
        } catch (Exception e) {
            writeError(rsp, 400, "provider_validation_failed", e.getMessage());
        }
    }

    @POST
    public void doModels(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String providerId = body.path("provider").asText("");
        if (!ProviderFactory.SUPPORTED.contains(providerId)) {
            writeError(rsp, 400, "invalid_provider", "Unsupported provider");
            return;
        }
        String suppliedKey = body.path("apiKey").asText("");
        String suppliedBaseUrl = body.path("baseUrl").asText("");
        ProviderConfig providerConfig;
        if (!suppliedKey.isBlank()) {
            if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
                writeError(rsp, 403, "forbidden", "Administrator permission is required to validate a key");
                return;
            }
            providerConfig = new ProviderConfig(providerId, suppliedKey, suppliedBaseUrl);
        } else {
            providerConfig = CopilotGlobalConfiguration.get().providerConfig(providerId);
        }
        if (providerConfig == null) {
            writeError(rsp, 400, "provider_not_configured", "Configure this provider first");
            return;
        }
        try {
            List<ModelInfo> models = ProviderFactory
                    .create(providerId, providerConfig.baseUrl())
                    .listModels(providerConfig);
            writeJson(rsp, 200, Jackson.obj().put("provider", providerId).set(
                    "models", Jackson.MAPPER.valueToTree(models)));
        } catch (Exception e) {
            writeError(rsp, 400, "model_list_failed", e.getMessage());
        }
    }

    @POST
    public void doChat(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        if (!config.isEnabled()) {
            writeError(rsp, 503, "disabled", "The assistant is disabled");
            return;
        }
        if (!allowRequest(user.getId())) {
            writeError(rsp, 429, "rate_limited", "Too many messages; wait a minute and try again");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String pageContext = pageContext(body);
        ConversationStore store = new ConversationStore();
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        Conversation conversation;
        try {
            conversation = resolveConversation(user, store, body, config, accounts);
        } catch (IllegalArgumentException e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        if (conversation == null) {
            writeError(rsp, 409, "setup_required", "An administrator must configure a provider first");
            return;
        }
        RunState existing = store.loadRun(user.getId(), conversation.getId());
        if (existing != null && !existing.pendingApprovals().isEmpty() && !body.has("decision")) {
            writeError(rsp, 409, "approval_pending", "Resolve the pending approval before sending another message");
            return;
        }

        ResolvedProvider resolved = resolveProvider(accounts, config, body, conversation);
        if (resolved == null) {
            writeError(rsp, 400, "provider_not_configured", "The selected provider is not configured");
            return;
        }
        if (resolved.model == null || resolved.model.isBlank()) {
            writeError(rsp, 400, "model_required", "Select a model in the composer");
            return;
        }
        ThinkingLevel thinking = ThinkingLevel.parse(body.path("thinking").asText(conversation.getThinking()));
        conversation.setProvider(resolved.providerId);
        conversation.setProviderAccountId(resolved.account == null ? "" : resolved.account.getId());
        conversation.setPipeline(pipelineFor(body, conversation));
        conversation.setModel(resolved.model);
        conversation.setThinking(thinking.name());
        store.save(conversation);

        if (body.has("decision")) {
            JsonNode decision = body.get("decision");
            RunState state = store.loadRun(user.getId(), conversation.getId());
            if (state == null) {
                writeError(rsp, 409, "nothing_to_resume", "There is no paused run for this conversation");
                return;
            }
            ApprovalRecord approval = findApproval(state, decision.path("approvalId").asText(""));
            if (approval == null) {
                writeError(rsp, 404, "approval_not_found", "Approval not found");
                return;
            }
            if (!approval.pending()) {
                writeError(rsp, 409, "already_decided", "Approval is already " + approval.getStatus());
                return;
            }
            if (approval.getExpiresAt() < System.currentTimeMillis()) {
                approval.setStatus("expired");
                store.saveRun(state);
                writeError(rsp, 409, "expired", "Approval has expired");
                return;
            }
            boolean approved = decision.path("approved").asBoolean(false);
            approval.setStatus(approved ? "approved" : "rejected");
            approval.setDecidedBy(user.getId());
            approval.setComment(decision.path("comment").asText(""));
            store.saveRun(state);
            store.audit(
                    user.getId(),
                    "approval." + (approved ? "approve" : "reject"),
                    approval.getToolName(),
                    approved ? "allowed" : "denied",
                    Jackson.write(Jackson.obj().put("approvalId", approval.getApprovalId())));
            synchronized (store.runLock(conversation.getId())) {
                streamResume(user, rsp, conversation, state, store, config, resolved.config, pageContext);
            }
            return;
        }

        String message = body.path("message").asText("").trim();
        if (message.length() > MAX_MESSAGE_CHARS) {
            writeError(rsp, 400, "message_too_large", "Message is too large");
            return;
        }
        List<AttachmentRef> attachments;
        try {
            attachments = saveAttachments(user, store, conversation, body.path("attachments"), config);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_attachment", e.getMessage());
            return;
        }
        if (message.isBlank() && attachments.isEmpty()) {
            writeError(rsp, 400, "empty_message", "Type a message or attach an image");
            return;
        }
        ChatMessage userMessage = new ChatMessage(ChatMessage.Role.USER, message);
        userMessage.setImages(attachments);
        store.append(userMessage, conversation);

        List<ChatMessage> history = new ArrayList<>(conversation.getMessages());
        AgentRequest request = new AgentRequest(
                user,
                conversation.getId(),
                resolved.config,
                resolved.model,
                thinking,
                history,
                toolContext(user, conversation, config),
                attachmentLoader(user.getId(), conversation.getId(), store),
                config.isAutoApproveLevel2(),
                config.getMaxSteps(),
                config.getRequestTimeoutSeconds());
        request.setAutoApproveAll(config.isAutoApproveAll());
        synchronized (store.runLock(conversation.getId())) {
            streamRun(rsp, conversation, store, request, pageContext);
        }
    }

    @POST
    public void doDecision(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!allowRequest(user.getId())) {
            writeError(rsp, 429, "rate_limited", "Too many requests; wait a minute and try again");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String conversationId = body.path("conversationId").asText("");
        ConversationStore store = new ConversationStore();
        String pageContext = pageContext(body);
        Conversation conversation;
        try {
            conversation = store.get(user.getId(), conversationId);
        } catch (IllegalArgumentException e) {
            writeError(rsp, 404, "conversation_not_found", "Conversation not found");
            return;
        }
        RunState state = store.loadRun(user.getId(), conversationId);
        if (state == null) {
            writeError(rsp, 409, "nothing_to_resume", "There is no paused run for this conversation");
            return;
        }
        ApprovalRecord approval = findApproval(state, body.path("approvalId").asText(""));
        if (approval == null) {
            writeError(rsp, 404, "approval_not_found", "Approval not found");
            return;
        }
        if (!approval.pending()) {
            writeError(rsp, 409, "already_decided", "Approval is already " + approval.getStatus());
            return;
        }
        if (approval.getExpiresAt() < System.currentTimeMillis()) {
            approval.setStatus("expired");
            store.saveRun(state);
            writeError(rsp, 409, "expired", "Approval has expired");
            return;
        }
        boolean approved = body.path("approved").asBoolean(false);
        approval.setStatus(approved ? "approved" : "rejected");
        approval.setDecidedBy(user.getId());
        approval.setComment(body.path("comment").asText(""));
        store.saveRun(state);
        store.audit(
                user.getId(),
                "approval." + (approved ? "approve" : "reject"),
                approval.getToolName(),
                approved ? "allowed" : "denied",
                Jackson.write(Jackson.obj().put("approvalId", approval.getApprovalId())));

        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        ProviderConfig providerConfig = providerConfigFor(accounts, config, conversation);
        if (providerConfig == null) {
            writeError(rsp, 400, "provider_not_configured", "The selected provider is not configured");
            return;
        }
        synchronized (store.runLock(conversation.getId())) {
            streamResume(user, rsp, conversation, state, store, config, providerConfig, pageContext);
        }
    }

    public void doConversations(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        ConversationStore store = new ConversationStore();
        List<JsonNode> conversations =
                store.list(user.getId(), CopilotGlobalConfiguration.get().getRetentionPerUser());
        writeJson(rsp, 200, Jackson.obj().set("conversations", Jackson.MAPPER.valueToTree(conversations)));
    }

    public void doConversation(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        String id = req.getParameter("id");
        ConversationStore store = new ConversationStore();
        try {
            Conversation conversation = store.get(user.getId(), id);
            RunState state = store.loadRun(user.getId(), id);
            ObjectNode out = Jackson.obj();
            out.set("conversation", Jackson.MAPPER.valueToTree(conversation));
            out.set("messages", Jackson.MAPPER.valueToTree(conversation.getMessages()));
            out.set("pendingApprovals", state == null
                    ? Jackson.arr()
                    : Jackson.MAPPER.valueToTree(state.pendingApprovals()));
            writeJson(rsp, 200, out);
        } catch (IllegalArgumentException e) {
            writeError(rsp, 404, "conversation_not_found", "Conversation not found");
        }
    }

    @POST
    public void doDeleteConversation(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String id = body.path("id").asText("");
        ConversationStore store = new ConversationStore();
        store.delete(user.getId(), id);
        store.audit(user.getId(), "conversation.delete", id, "succeeded", "{}");
        writeJson(rsp, 200, Jackson.obj().put("deleted", true));
    }

    @POST
    public void doCreateConversation(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        if (accounts.providers().isEmpty() && config.setupRequired()) {
            writeError(rsp, 409, "setup_required", "An administrator must configure a provider first");
            return;
        }
        String requestedAccountId = body.path("providerAccountId").asText("");
        ProviderAccount account = requestedAccountId.isBlank()
                ? accounts.defaultProvider()
                : accounts.provider(requestedAccountId);
        if (account == null) {
            account = accounts.defaultProvider();
        }
        String provider = account != null ? account.getProvider() : config.getDefaultProvider();
        String model = firstNonBlank(
                body.path("model").asText(""),
                account == null ? "" : account.getDefaultModel(),
                config.getDefaultModel());
        String pipeline = body.path("pipeline").asText("General");
        Conversation conversation = new ConversationStore().create(
                user.getId(),
                provider,
                model,
                body.path("thinking").asText("AUTO"),
                pipeline,
                account == null ? "" : account.getId());
        writeJson(rsp, 200, Jackson.MAPPER.valueToTree(conversation));
    }

    @POST
    public void doRenameConversation(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String id = body.path("id").asText("");
        String title = body.path("title").asText("").trim();
        if (title.isBlank() || title.length() > 120) {
            writeError(rsp, 400, "invalid_title", "Title must be between 1 and 120 characters");
            return;
        }
        ConversationStore store = new ConversationStore();
        try {
            store.rename(user.getId(), id, title);
            store.audit(user.getId(), "conversation.rename", id, "succeeded", "{}");
            writeJson(rsp, 200, Jackson.obj().put("renamed", true).put("id", id).put("title", title));
        } catch (IllegalArgumentException e) {
            writeError(rsp, 404, "conversation_not_found", "Conversation not found");
        }
    }

    public void doSettingsSkills(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        SkillStore skills = new SkillStore();
        ObjectNode response = Jackson.obj();
        response.set("skills", Jackson.MAPPER.valueToTree(skills.list()));
        response.put("count", skills.list().size());
        writeJson(rsp, 200, response);
    }

    @POST
    public void doSaveSkill(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        try {
            Skill input = Jackson.MAPPER.treeToValue(body, Skill.class);
            SkillStore skills = new SkillStore();
            Skill saved = skills.save(input, user.getId());
            new AccountsStore().audit(user.getId(), "settings.skill.save", saved.getSlug(), "succeeded", "{}");
            ObjectNode response = Jackson.obj();
            response.put("saved", true);
            response.set("skill", Jackson.MAPPER.valueToTree(saved));
            response.set("skills", Jackson.MAPPER.valueToTree(skills.list()));
            writeJson(rsp, 200, response);
        } catch (IllegalArgumentException e) {
            writeError(rsp, 400, "invalid_skill", e.getMessage());
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_skill", e.getMessage() == null ? "Could not save the skill" : e.getMessage());
        }
    }

    @POST
    public void doDeleteSkill(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String key = body.path("skill").asText(body.path("id").asText(""));
        if (!body.path("confirm").asBoolean(false)) {
            writeError(rsp, 400, "confirm_required", "confirm=true is required to delete a skill");
            return;
        }
        SkillStore skills = new SkillStore();
        if (!skills.delete(key)) {
            writeError(rsp, 404, "skill_not_found", "No skill named '" + key + "'");
            return;
        }
        new AccountsStore().audit(user.getId(), "settings.skill.delete", key, "succeeded", "{}");
        ObjectNode response = Jackson.obj();
        response.put("deleted", true);
        response.set("skills", Jackson.MAPPER.valueToTree(skills.list()));
        writeJson(rsp, 200, response);
    }

    @POST
    public void doSetSkillEnabled(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String key = body.path("skill").asText(body.path("id").asText(""));
        boolean enabled = body.path("enabled").asBoolean(true);
        SkillStore skills = new SkillStore();
        Skill saved = skills.setEnabled(key, enabled);
        if (saved == null) {
            writeError(rsp, 404, "skill_not_found", "No skill named '" + key + "'");
            return;
        }
        new AccountsStore().audit(user.getId(), "settings.skill.enabled", key, enabled ? "enabled" : "disabled", "{}");
        ObjectNode response = Jackson.obj();
        response.put("enabled", saved.isEnabled());
        response.set("skill", Jackson.MAPPER.valueToTree(saved));
        response.set("skills", Jackson.MAPPER.valueToTree(skills.list()));
        writeJson(rsp, 200, response);
    }

    @POST
    public void doSetApprovalMode(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        String mode = body.path("mode").asText("ask").toLowerCase();
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        switch (mode) {
            case "ask" -> {
                config.setAutoApproveLevel2(false);
                config.setAutoApproveAll(false);
            }
            case "auto" -> {
                config.setAutoApproveLevel2(true);
                config.setAutoApproveAll(false);
            }
            case "bypass" -> {
                config.setAutoApproveLevel2(true);
                config.setAutoApproveAll(true);
            }
            default -> {
                writeError(rsp, 400, "invalid_mode", "mode must be 'ask', 'auto', or 'bypass'");
                return;
            }
        }
        new AccountsStore().audit(user.getId(), "settings.approvals", mode, "succeeded", "{}");
        writeJson(rsp, 200, Jackson.obj()
                .put("mode", mode)
                .put("autoApproveLevel2", config.isAutoApproveLevel2())
                .put("autoApproveAll", config.isAutoApproveAll()));
    }

    public void doSettingsAccounts(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        writeJson(rsp, 200, accounts.masked());
    }

    @POST
    public void doSaveProvider(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(CopilotGlobalConfiguration.get());
        try {
            ProviderAccount account = accounts.saveProvider(
                    body.path("id").asText(""),
                    body.path("provider").asText(""),
                    body.path("label").asText(""),
                    body.path("apiKey").asText(""),
                    body.path("baseUrl").asText(""),
                    body.path("defaultModel").asText(""));
            accounts.audit(user.getId(), "settings.provider.save", account.getId(), "succeeded", "{}");
            writeJson(rsp, 200, Jackson.obj()
                    .put("saved", true)
                    .put("id", account.getId())
                    .set("accounts", accounts.masked()));
        } catch (IllegalArgumentException e) {
            writeError(rsp, 400, "invalid_provider", e.getMessage());
        }
    }

    @POST
    public void doDeleteProvider(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body = readJson(req);
        String id = body.path("id").asText("");
        AccountsStore accounts = new AccountsStore();
        accounts.deleteProvider(id);
        accounts.audit(user.getId(), "settings.provider.delete", id, "succeeded", "{}");
        writeJson(rsp, 200, Jackson.obj().put("deleted", true).set("accounts", accounts.masked()));
    }

    @POST
    public void doDefaultProvider(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body = readJson(req);
        String id = body.path("id").asText("");
        AccountsStore accounts = new AccountsStore();
        try {
            accounts.setDefaultProvider(id);
            accounts.audit(user.getId(), "settings.provider.default", id, "succeeded", "{}");
            writeJson(rsp, 200, Jackson.obj().put("saved", true).set("accounts", accounts.masked()));
        } catch (IllegalArgumentException e) {
            writeError(rsp, 404, "provider_not_found", e.getMessage());
        }
    }

    @POST
    public void doProviderModels(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        JsonNode body;
        try {
            body = readJson(req);
        } catch (Exception e) {
            writeError(rsp, 400, "invalid_request", e.getMessage());
            return;
        }
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        String accountId = body.path("id").asText("");
        String providerId = body.path("provider").asText("");
        String apiKey = body.path("apiKey").asText("");
        String baseUrl = body.path("baseUrl").asText("");

        ProviderConfig providerConfig;
        if (!accountId.isBlank()) {
            ProviderAccount account = accounts.provider(accountId);
            if (account == null) {
                writeError(rsp, 404, "provider_not_found", "Provider account not found");
                return;
            }
            providerId = account.getProvider();
            providerConfig = accounts.providerConfig(account);
        } else if (!apiKey.isBlank()) {
            if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
                writeError(rsp, 403, "forbidden", "Administrator permission is required to validate a key");
                return;
            }
            if (!ProviderFactory.SUPPORTED.contains(providerId)) {
                writeError(rsp, 400, "invalid_provider", "Unsupported provider");
                return;
            }
            providerConfig = new ProviderConfig(providerId, apiKey, baseUrl);
        } else {
            providerConfig = config.providerConfig(providerId);
        }
        if (providerConfig == null) {
            writeError(rsp, 400, "provider_not_configured", "Configure this provider first");
            return;
        }
        if ((ProviderFactory.OPENCODE_GO.equals(providerId)
                        || ProviderFactory.OPENAI_COMPATIBLE.equals(providerId))
                && (providerConfig.baseUrl() == null || providerConfig.baseUrl().isBlank())) {
            writeError(rsp, 400, "missing_base_url", "A base URL is required for " + providerId);
            return;
        }
        try {
            List<ModelInfo> models = ProviderFactory
                    .create(providerId, providerConfig.baseUrl())
                    .listModels(providerConfig);
            writeJson(rsp, 200, Jackson.obj()
                    .put("provider", providerId)
                    .put("accountId", accountId)
                    .set("models", Jackson.MAPPER.valueToTree(models)));
        } catch (Exception e) {
            writeError(rsp, 400, "model_list_failed", e.getMessage());
        }
    }

    @POST
    public void doSaveGithub(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body = readJson(req);
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(CopilotGlobalConfiguration.get());
        try {
            GitHubAccount account = accounts.saveGithub(
                    body.path("id").asText(""),
                    body.path("label").asText(""),
                    body.path("token").asText(""),
                    body.path("apiUrl").asText(""));
            accounts.audit(user.getId(), "settings.github.save", account.getId(), "succeeded", "{}");
            writeJson(rsp, 200, Jackson.obj()
                    .put("saved", true)
                    .put("id", account.getId())
                    .set("accounts", accounts.masked()));
        } catch (IllegalArgumentException e) {
            writeError(rsp, 400, "invalid_token", e.getMessage());
        }
    }

    @POST
    public void doDeleteGithub(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body = readJson(req);
        String id = body.path("id").asText("");
        AccountsStore accounts = new AccountsStore();
        accounts.deleteGithub(id);
        accounts.audit(user.getId(), "settings.github.delete", id, "succeeded", "{}");
        writeJson(rsp, 200, Jackson.obj().put("deleted", true).set("accounts", accounts.masked()));
    }

    @POST
    public void doDefaultGithub(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            writeError(rsp, 403, "forbidden", "Administrator permission is required");
            return;
        }
        JsonNode body = readJson(req);
        String id = body.path("id").asText("");
        AccountsStore accounts = new AccountsStore();
        try {
            accounts.setDefaultGithub(id);
            accounts.audit(user.getId(), "settings.github.default", id, "succeeded", "{}");
            writeJson(rsp, 200, Jackson.obj().put("saved", true).set("accounts", accounts.masked()));
        } catch (IllegalArgumentException e) {
            writeError(rsp, 404, "github_not_found", e.getMessage());
        }
    }

    public void doAttachment(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        User user = currentUser();
        if (user == null) {
            writeError(rsp, 401, "unauthenticated", "Sign in to Jenkins first");
            return;
        }
        String conversationId = req.getParameter("conversationId");
        String id = req.getParameter("id");
        ConversationStore store = new ConversationStore();
        try {
            byte[] bytes = store.loadAttachment(user.getId(), conversationId, id);
            String mediaType = store.attachmentMediaType(user.getId(), conversationId, id);
            rsp.setStatus(200);
            rsp.setContentType(mediaType);
            rsp.setHeader("Cache-Control", "private, max-age=3600");
            rsp.setHeader("Content-Disposition", "inline");
            try (OutputStream out = rsp.getOutputStream()) {
                out.write(bytes);
            }
        } catch (IllegalArgumentException e) {
            writeError(rsp, 404, "attachment_not_found", "Attachment not found");
        }
    }

    private void streamRun(
            StaplerResponse2 rsp,
            Conversation conversation,
            ConversationStore store,
            AgentRequest request,
            String pageContext)
            throws IOException {
        request.setPageContext(pageContext);
        SseSink sink = openSse(rsp);
        try {
            sink.event("conversation", Jackson.obj()
                    .put("id", conversation.getId())
                    .put("title", conversation.getTitle()));
            AgentOutcome outcome = new AgentLoop().run(request, sink, sink.abortSignal());
            finish(conversation, store, outcome, sink);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "chat failed", e);
            sink.aborted.set(true);
            try {
                sink.event("error", Jackson.obj().put("message", safeMessage(e)).put("retryable", false));
                sink.event("done", Jackson.obj().put("status", "error"));
            } catch (IOException ignored) {
                // Client already disconnected.
            }
        }
    }

    private void streamResume(
            User user,
            StaplerResponse2 rsp,
            Conversation conversation,
            RunState state,
            ConversationStore store,
            CopilotGlobalConfiguration config,
            ProviderConfig providerConfig,
            String pageContext)
            throws IOException {
        SseSink sink = openSse(rsp);
        try {
            sink.event("conversation", Jackson.obj()
                    .put("id", conversation.getId())
                    .put("title", conversation.getTitle()));
            ThinkingLevel thinking = ThinkingLevel.parse(state.getThinking());
            AgentRequest request = new AgentRequest(
                    user,
                    conversation.getId(),
                    providerConfig,
                    state.getModel(),
                    thinking,
                    state.getMessages(),
                    toolContext(user, conversation, config),
                    attachmentLoader(user.getId(), conversation.getId(), store),
                    config.isAutoApproveLevel2(),
                    config.getMaxSteps(),
                    config.getRequestTimeoutSeconds());
            request.setAutoApproveAll(config.isAutoApproveAll());
            request.setPageContext(pageContext);
            AgentOutcome outcome = new AgentLoop().resume(request, state, state.getApprovals(), sink, sink.abortSignal());
            finish(conversation, store, outcome, sink);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "approval resume failed", e);
            sink.aborted.set(true);
            try {
                sink.event("error", Jackson.obj().put("message", safeMessage(e)).put("retryable", false));
                sink.event("done", Jackson.obj().put("status", "error"));
            } catch (IOException ignored2) {
                // Client already disconnected.
            }
        }
    }

    private void finish(
            Conversation conversation, ConversationStore store, AgentOutcome outcome, SseSink sink) throws IOException {
        List<ChatMessage> messages = new ArrayList<>();
        for (ChatMessage message : outcome.getMessages()) {
            if (message.getRole() != ChatMessage.Role.SYSTEM) {
                messages.add(message);
            }
        }
        conversation.setMessages(messages);
        conversation.setStatus(AgentOutcome.AWAITING_APPROVAL.equals(outcome.getStatus())
                ? "awaiting_approval"
                : outcome.getError() != null ? "error" : "idle");
        store.save(conversation);

        if (AgentOutcome.AWAITING_APPROVAL.equals(outcome.getStatus())) {
            RunState state = new RunState();
            state.setConversationId(conversation.getId());
            state.setUserId(conversation.getUserId());
            state.setProvider(conversation.getProvider());
            state.setModel(conversation.getModel());
            state.setThinking(conversation.getThinking());
            state.setMessages(outcome.getMessages());
            state.setApprovals(outcome.getApprovals());
            store.saveRun(state);
            sink.event("message.completed", Jackson.obj()
                    .put("text", sink.text.toString())
                    .put("status", "awaiting_approval"));
            sink.event("done", Jackson.obj()
                    .put("status", "awaiting_approval")
                    .put("approvals", outcome.getApprovals().size()));
        } else {
            store.deleteRun(conversation.getUserId(), conversation.getId());
            if (outcome.getError() != null) {
                sink.event("error", Jackson.obj()
                        .put("message", outcome.getError())
                        .put("retryable", false));
            }
            sink.event("message.completed", Jackson.obj()
                    .put("text", sink.text.toString())
                    .put("status", outcome.getStatus()));
            sink.event("done", Jackson.obj().put("status", outcome.getStatus()));
        }
    }

    private Conversation resolveConversation(
            User user,
            ConversationStore store,
            JsonNode body,
            CopilotGlobalConfiguration config,
            AccountsStore accounts) {
        String id = body.path("conversationId").asText("");
        if (!id.isBlank()) {
            Conversation conversation = store.get(user.getId(), id);
            String explicitPipeline = body.path("pipeline").asText("");
            if (!explicitPipeline.isBlank()) {
                conversation.setPipeline(explicitPipeline);
            } else if ("General".equals(conversation.getPipeline()) && conversation.getMessages().isEmpty()) {
                String pipeline = pipelineFromContext(body);
                if (!pipeline.isBlank()) {
                    conversation.setPipeline(pipeline);
                }
            }
            if (body.hasNonNull("providerAccountId")) {
                conversation.setProviderAccountId(body.get("providerAccountId").asText(""));
            }
            return conversation;
        }
        if (accounts.providers().isEmpty() && config.setupRequired()) {
            return null;
        }
        ProviderAccount account = accounts.defaultProvider();
        String provider = account != null ? account.getProvider() : config.getDefaultProvider();
        String model = firstNonBlank(
                body.path("model").asText(""),
                account == null ? "" : account.getDefaultModel(),
                config.getDefaultModel());
        String pipeline = firstNonBlank(body.path("pipeline").asText(""), pipelineFromContext(body), "General");
        return store.create(
                user.getId(),
                provider,
                model,
                body.path("thinking").asText("AUTO"),
                pipeline,
                account == null ? "" : account.getId());
    }

    private ResolvedProvider resolveProvider(
            AccountsStore accounts,
            CopilotGlobalConfiguration config,
            JsonNode body,
            Conversation conversation) {
        String accountId = firstNonBlank(
                body.path("providerAccountId").asText(""), conversation.getProviderAccountId());
        ProviderAccount account = accountId.isBlank() ? null : accounts.provider(accountId);
        if (account == null) {
            account = accounts.defaultProvider();
        }
        if (account != null) {
            ProviderConfig providerConfig = accounts.providerConfig(account);
            if (providerConfig == null) {
                return null;
            }
            String model = firstNonBlank(
                    body.path("model").asText(""),
                    conversation.getModel(),
                    account.getDefaultModel(),
                    config.getDefaultModel());
            return new ResolvedProvider(account, providerConfig, account.getProvider(), model);
        }
        String providerId = firstNonBlank(
                body.path("provider").asText(""), conversation.getProvider(), config.getDefaultProvider());
        ProviderConfig providerConfig = config.providerConfig(providerId);
        if (providerConfig == null) {
            return null;
        }
        String model = firstNonBlank(
                body.path("model").asText(""), conversation.getModel(), config.getDefaultModel());
        return new ResolvedProvider(null, providerConfig, providerId, model);
    }

    private ProviderConfig providerConfigFor(
            AccountsStore accounts, CopilotGlobalConfiguration config, Conversation conversation) {
        String accountId = conversation.getProviderAccountId();
        ProviderAccount account = accountId == null || accountId.isBlank() ? null : accounts.provider(accountId);
        if (account != null) {
            return accounts.providerConfig(account);
        }
        return config.providerConfig(conversation.getProvider());
    }

    private String pipelineFor(JsonNode body, Conversation conversation) {
        String explicit = body.path("pipeline").asText("");
        if (!explicit.isBlank()) {
            return explicit;
        }
        if ("General".equals(conversation.getPipeline())) {
            String fromContext = pipelineFromContext(body);
            if (!fromContext.isBlank()) {
                return fromContext;
            }
        }
        return conversation.getPipeline();
    }

    private static String pipelineFromContext(JsonNode body) {
        JsonNode context = body.path("context");
        return firstNonBlank(
                context.path("pipeline").asText(""),
                context.path("jobFullName").asText(""),
                "");
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private static final class ResolvedProvider {
        private final ProviderAccount account;
        private final ProviderConfig config;
        private final String providerId;
        private final String model;

        private ResolvedProvider(ProviderAccount account, ProviderConfig config, String providerId, String model) {
            this.account = account;
            this.config = config;
            this.providerId = providerId;
            this.model = model;
        }
    }

    private ToolContext toolContext(User user, Conversation conversation, CopilotGlobalConfiguration config) {
        AccountsStore accounts = new AccountsStore();
        accounts.ensureMigrated(config);
        GitHubAccount github = accounts.defaultGithub();
        String token = accounts.githubToken(github);
        String apiUrl = github == null ? config.getGithubApiUrl() : github.getApiUrl();
        if (token == null || token.isBlank()) {
            token = config.githubTokenPlain();
        }
        return new ToolContext(
                user,
                conversation.getId(),
                config,
                new GitHubService(token, apiUrl),
                new ChangePlanStore(),
                new RecoveryService(),
                new ConversationStore(),
                new SkillStore());
    }

    private AttachmentLoader attachmentLoader(String userId, String conversationId, ConversationStore store) {
        return ref -> store.loadAttachment(userId, conversationId, ref.getId());
    }

    private List<AttachmentRef> saveAttachments(
            User user,
            ConversationStore store,
            Conversation conversation,
            JsonNode attachments,
            CopilotGlobalConfiguration config)
            throws Exception {
        List<AttachmentRef> refs = new ArrayList<>();
        if (!attachments.isArray()) {
            return refs;
        }
        int count = 0;
        for (JsonNode attachment : attachments) {
            if (count++ >= 4) {
                break;
            }
            String mediaType = attachment.path("mediaType").asText("");
            if (!List.of("image/png", "image/jpeg", "image/webp").contains(mediaType)) {
                throw new IllegalArgumentException("Only PNG, JPEG, and WebP images are supported");
            }
            String data = attachment.path("dataBase64").asText("");
            if (data.isBlank()) {
                throw new IllegalArgumentException("Attachment data is missing");
            }
            byte[] bytes;
            try {
                bytes = Base64.getDecoder().decode(data);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Attachment is not valid base64");
            }
            long maxBytes = (long) config.getMaxAttachmentMb() * 1024 * 1024;
            if (bytes.length == 0 || bytes.length > maxBytes) {
                throw new IllegalArgumentException("Attachment exceeds the " + config.getMaxAttachmentMb() + " MB limit");
            }
            if (!magicMatches(mediaType, bytes)) {
                throw new IllegalArgumentException("Attachment content does not match its image type");
            }
            String fileName = attachment.path("fileName").asText("image");
            refs.add(store.saveAttachment(user.getId(), conversation.getId(), mediaType, fileName, bytes));
        }
        return refs;
    }

    private static boolean magicMatches(String mediaType, byte[] bytes) {
        if (bytes.length < 12) {
            return false;
        }
        return switch (mediaType) {
            case "image/png" -> (bytes[0] & 0xFF) == 0x89
                    && bytes[1] == 'P'
                    && bytes[2] == 'N'
                    && bytes[3] == 'G';
            case "image/jpeg" -> (bytes[0] & 0xFF) == 0xFF
                    && (bytes[1] & 0xFF) == 0xD8
                    && (bytes[2] & 0xFF) == 0xFF;
            case "image/webp" -> bytes[0] == 'R'
                    && bytes[1] == 'I'
                    && bytes[2] == 'F'
                    && bytes[3] == 'F'
                    && bytes[8] == 'W'
                    && bytes[9] == 'E'
                    && bytes[10] == 'B'
                    && bytes[11] == 'P';
            default -> false;
        };
    }

    private static ApprovalRecord findApproval(RunState state, String approvalId) {
        for (ApprovalRecord approval : state.getApprovals()) {
            if (approvalId.equals(approval.getApprovalId())) {
                return approval;
            }
        }
        return null;
    }

    private SseSink openSse(StaplerResponse2 rsp) throws IOException {
        rsp.setStatus(200);
        rsp.setContentType("text/event-stream;charset=UTF-8");
        rsp.setHeader("Cache-Control", "no-cache, no-transform");
        rsp.setHeader("X-Accel-Buffering", "no");
        rsp.setHeader("Connection", "keep-alive");
        return new SseSink(rsp.getOutputStream());
    }

    private static String pageContext(JsonNode body) {
        if (body != null && body.path("context").isObject()) {
            return Jackson.write(body.get("context"));
        }
        return Jackson.write(JsonBridge.toJackson(Contexts.current()));
    }

    private static boolean allowRequest(String userId) {
        Deque<Long> events = RATE.computeIfAbsent(userId, ignored -> new ArrayDeque<>());
        synchronized (events) {
            long cutoff = System.currentTimeMillis() - RATE_WINDOW_MS;
            while (!events.isEmpty() && events.peekFirst() < cutoff) {
                events.pollFirst();
            }
            if (events.size() >= RATE_LIMIT) {
                return false;
            }
            events.addLast(System.currentTimeMillis());
            return true;
        }
    }

    private static User currentUser() {
        Authentication authentication = Jenkins.getAuthentication2();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        User user = User.get2(authentication);
        return user == null || user.getId().isBlank() ? null : user;
    }

    private static JsonNode readJson(StaplerRequest2 req) throws IOException {
        byte[] bytes;
        try (InputStream in = req.getInputStream()) {
            bytes = in.readNBytes(MAX_BODY + 1);
        }
        if (bytes.length > MAX_BODY) {
            throw new IOException("Request body is too large");
        }
        return Jackson.parse(new String(bytes, StandardCharsets.UTF_8));
    }

    private static void writeJson(StaplerResponse2 rsp, int status, JsonNode body) throws IOException {
        rsp.setStatus(status);
        rsp.setContentType("application/json;charset=UTF-8");
        rsp.setHeader("Cache-Control", "no-store");
        rsp.getWriter().write(Jackson.write(body));
    }

    private static void writeError(StaplerResponse2 rsp, int status, String code, String message) throws IOException {
        writeJson(rsp, status, Jackson.obj().set(
                "error", Jackson.obj().put("code", code).put("message", message == null ? "" : message)));
    }

    private static String safeMessage(Throwable error) {
        String message = error.getMessage();
        return message == null || message.isBlank() ? error.getClass().getSimpleName() : message;
    }

    /** SSE writer and AgentSink. */
    private static final class SseSink implements AgentSink {
        private final OutputStream out;
        private final AtomicBoolean aborted = new AtomicBoolean(false);
        private final StringBuilder text = new StringBuilder();

        SseSink(OutputStream out) {
            this.out = out;
        }

        AbortSignal abortSignal() {
            return aborted::get;
        }

        synchronized void event(String name, JsonNode data) throws IOException {
            if (aborted.get()) {
                return;
            }
            try {
                String payload = "event: " + name + "\ndata: " + Jackson.write(data) + "\n\n";
                out.write(payload.getBytes(StandardCharsets.UTF_8));
                out.flush();
            } catch (IOException e) {
                aborted.set(true);
                throw e;
            }
        }

        @Override
        public void text(String delta) {
            text.append(delta);
            try {
                event("message.delta", Jackson.obj().put("text", delta));
            } catch (IOException e) {
                aborted.set(true);
            }
        }

        @Override
        public void reasoning(String delta) {
            try {
                event("message.reasoning", Jackson.obj().put("text", delta));
            } catch (IOException e) {
                aborted.set(true);
            }
        }

        @Override
        public void toolStart(ToolCall call, ToolSpec spec, JsonNode args) {
            try {
                ObjectNode payload = Jackson.obj();
                payload.put("toolCallId", call.getId());
                payload.put("toolName", call.getName());
                payload.set("args", args);
                payload.put("risk", spec.getRisk());
                payload.put("reason", spec.getReason());
                event("tool.start", payload);
            } catch (IOException e) {
                aborted.set(true);
            }
        }

        @Override
        public void toolResult(ToolCall call, JsonNode output) {
            try {
                String serialized = Jackson.write(output);
                JsonNode bounded = serialized.length() > 12_000
                        ? Jackson.obj().put("truncated", true).put("preview", serialized.substring(0, 12_000))
                        : output;
                event("tool.result", Jackson.obj()
                        .put("toolCallId", call.getId())
                        .put("toolName", call.getName())
                        .put("summary", summarize(output))
                        .set("output", bounded));
            } catch (IOException e) {
                aborted.set(true);
            }
        }

        @Override
        public void toolError(ToolCall call, String error) {
            try {
                event("tool.error", Jackson.obj()
                        .put("toolCallId", call.getId())
                        .put("toolName", call.getName())
                        .put("error", error));
            } catch (IOException e) {
                aborted.set(true);
            }
        }

        @Override
        public void approvalRequired(ApprovalRecord approval) {
            try {
                ObjectNode payload = Jackson.obj();
                payload.put("approvalId", approval.getApprovalId());
                payload.put("toolCallId", approval.getToolCallId());
                payload.put("toolName", approval.getToolName());
                payload.put("target", approval.getTarget());
                payload.set("args", Jackson.parse(approval.getArgsJson()));
                payload.put("risk", approval.getRisk());
                payload.put("reason", approval.getReason());
                payload.put("diff", approval.getDiff());
                payload.set("validation", approval.getValidationJson() == null
                        ? Jackson.MAPPER.nullNode()
                        : Jackson.parse(approval.getValidationJson()));
                payload.put("expiresAt", approval.getExpiresAt());
                event("approval.required", payload);
            } catch (IOException e) {
                aborted.set(true);
            }
        }

        private static String summarize(JsonNode output) {
            if (output == null || output.isNull()) {
                return "completed";
            }
            if (!output.isObject()) {
                return output.asText("completed");
            }
            List<String> keys = new ArrayList<>();
            output.fieldNames().forEachRemaining(keys::add);
            return keys.isEmpty() ? "completed" : "returned " + String.join(", ", keys.subList(0, Math.min(keys.size(), 8)));
        }
    }
}
