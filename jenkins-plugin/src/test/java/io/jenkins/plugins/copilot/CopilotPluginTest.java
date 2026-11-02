package io.jenkins.plugins.copilot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import hudson.model.FreeStyleProject;
import hudson.model.User;
import hudson.security.GlobalMatrixAuthorizationStrategy;
import hudson.util.Secret;
import io.jenkins.plugins.copilot.agent.AgentLoop;
import io.jenkins.plugins.copilot.agent.AgentOutcome;
import io.jenkins.plugins.copilot.agent.AgentRequest;
import io.jenkins.plugins.copilot.agent.AgentSink;
import io.jenkins.plugins.copilot.providers.AbortSignal;
import io.jenkins.plugins.copilot.providers.ChatMessage;
import io.jenkins.plugins.copilot.providers.ModelInfo;
import io.jenkins.plugins.copilot.providers.Provider;
import io.jenkins.plugins.copilot.providers.ProviderConfig;
import io.jenkins.plugins.copilot.providers.ProviderResult;
import io.jenkins.plugins.copilot.providers.ProviderStreamSink;
import io.jenkins.plugins.copilot.providers.ThinkingLevel;
import io.jenkins.plugins.copilot.providers.ToolCall;
import io.jenkins.plugins.copilot.storage.ApprovalRecord;
import io.jenkins.plugins.copilot.storage.ChangePlanStore;
import io.jenkins.plugins.copilot.storage.Conversation;
import io.jenkins.plugins.copilot.storage.ConversationStore;
import io.jenkins.plugins.copilot.tools.GitHubService;
import io.jenkins.plugins.copilot.tools.RecoveryService;
import io.jenkins.plugins.copilot.tools.ToolContext;
import io.jenkins.plugins.copilot.tools.ToolSpec;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jenkins.model.Jenkins;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.jvnet.hudson.test.JenkinsRule;

public class CopilotPluginTest {

    @Rule
    public JenkinsRule jenkins = new JenkinsRule();

    @Before
    public void configure() {
        jenkins.jenkins.setSecurityRealm(jenkins.createDummySecurityRealm());
        GlobalMatrixAuthorizationStrategy strategy = new GlobalMatrixAuthorizationStrategy();
        strategy.add(Jenkins.ADMINISTER, "admin");
        strategy.add(Jenkins.READ, "alice");
        strategy.add(hudson.model.Item.READ, "alice");
        jenkins.jenkins.setAuthorizationStrategy(strategy);
        jenkins.jenkins.setCrumbIssuer(null);
        User.getById("admin", true);
        User.getById("alice", true);
    }

    @Test
    public void sidebarMountsOnAJobPage() throws Exception {
        FreeStyleProject job = jenkins.createFreeStyleProject("demo");
        JenkinsRule.WebClient client = jenkins.createWebClient();
        client.login("admin");
        String page = client.goTo("job/demo/").getWebResponse().getContentAsString();
        assertTrue(page.contains("jenkins-ai-copilot-root"));
        assertTrue(page.contains("plugin/jenkins-ai-copilot/ui/copilot.js"));
        assertNotNull(job);
    }

    @Test
    public void sessionReportsSetupAndNeverLeaksKeys() throws Exception {
        CopilotGlobalConfiguration config = CopilotGlobalConfiguration.get();
        Response before = get("jenkins-ai-copilot/session", "admin");
        assertEquals(200, before.status);
        JsonNode first = Jackson.parse(before.body);
        assertTrue(first.path("config").path("setupRequired").asBoolean());
        assertTrue(first.path("isAdmin").asBoolean());

        config.setOpenaiApiKey(Secret.fromString("sk-test-openai-key"));
        config.setGithubToken(Secret.fromString("ghp-test-github-token"));
        config.save();

        Response after = get("jenkins-ai-copilot/session", "admin");
        JsonNode second = Jackson.parse(after.body);
        assertFalse(second.path("config").path("setupRequired").asBoolean());
        assertTrue(second.path("config").path("githubConfigured").asBoolean());
        assertFalse(after.body.contains("sk-test-openai-key"));
        assertFalse(after.body.contains("ghp-test-github-token"));
        assertEquals("openai", second.path("config").path("providers").get(0).path("id").asText());
    }

    @Test
    public void setupRequiresAdministratorAndAnApiKey() throws Exception {
        Response forbidden = post(
                "jenkins-ai-copilot/setup",
                Jackson.write(Jackson.obj().put("provider", "openai").put("apiKey", "sk-x")),
                "alice");
        assertEquals(403, forbidden.status);

        Response missingKey = post(
                "jenkins-ai-copilot/setup",
                Jackson.write(Jackson.obj().put("provider", "openai").put("apiKey", "")),
                "admin");
        assertEquals(400, missingKey.status);
        assertTrue(missingKey.body.contains("API key"));
    }

    @Test
    public void chatRefusesToStartWithoutAProvider() throws Exception {
        Response response = post(
                "jenkins-ai-copilot/chat",
                Jackson.write(Jackson.obj().put("message", "hello")),
                "admin");
        assertEquals(409, response.status);
        assertTrue(response.body.contains("setup_required"));
    }

    @Test
    public void conversationsAreScopedToTheirOwner() {
        ConversationStore store = new ConversationStore();
        Conversation conversation = store.create("alice", "openai", "gpt-test", "AUTO");
        assertEquals("alice", store.get("alice", conversation.getId()).getUserId());
        boolean rejected = false;
        try {
            store.get("bob", conversation.getId());
        } catch (IllegalArgumentException e) {
            rejected = true;
        }
        assertTrue(rejected);
    }

    @Test
    public void privilegedToolPausesForApprovalAndRejectionDoesNotExecute() throws Exception {
        FreeStyleProject job = jenkins.createFreeStyleProject("production-app");
        FakeProvider provider = new FakeProvider(
                toolCall("delete_job", "{\"job\":\"production-app\",\"confirm\":true}"),
                text("I did not delete it."));
        ToolContext tools = toolContext();
        AgentRequest request = request(provider, tools);
        RecordingSink sink = new RecordingSink();
        AgentOutcome outcome = new AgentLoop().run(request, sink, AbortSignal.NEVER);

        assertEquals(AgentOutcome.AWAITING_APPROVAL, outcome.getStatus());
        assertEquals(1, outcome.getApprovals().size());
        assertNotNull(jenkins.jenkins.getItem("production-app"));
        assertTrue(sink.approvals.contains("delete_job"));

        ApprovalRecord approval = outcome.getApprovals().get(0);
        approval.setStatus("rejected");
        approval.setComment("not approved");
        AgentOutcome resumed = new AgentLoop().resume(request, runState(outcome), outcome.getApprovals(), sink, AbortSignal.NEVER);
        assertNotNull(jenkins.jenkins.getItem("production-app"));
        assertEquals(AgentOutcome.DONE, resumed.getStatus());
        assertFalse(sink.executedDelete);
        assertFalse(sink.toolStarts.contains("delete_job"));
    }

    @Test
    public void readOnlyToolExecutesAndTheLoopContinues() throws Exception {
        jenkins.createFreeStyleProject("demo");
        FakeProvider provider = new FakeProvider(
                toolCall("list_jobs", "{}"),
                text("There is one job."));
        AgentOutcome outcome = new AgentLoop().run(request(provider, toolContext()), new RecordingSink(), AbortSignal.NEVER);
        assertEquals(AgentOutcome.DONE, outcome.getStatus());
        assertTrue(outcome.getText().contains("one job"));
        assertTrue(outcome.getMessages().stream().anyMatch(message ->
                message.getRole() == ChatMessage.Role.TOOL && message.getContent().contains("demo")));
    }

    private AgentRequest request(FakeProvider provider, ToolContext tools) {
        User admin = User.getById("admin", true);
        return new AgentRequest(
                admin,
                tools.conversationId(),
                new ProviderConfig("openai", "sk-test", "https://api.openai.com/v1"),
                provider,
                "gpt-test",
                ThinkingLevel.AUTO,
                new ArrayList<>(List.of(ChatMessage.user("do the thing"))),
                tools,
                ref -> new byte[0],
                false,
                5,
                60);
    }

    private ToolContext toolContext() {
        User admin = User.getById("admin", true);
        return new ToolContext(
                admin,
                UUID.randomUUID().toString(),
                CopilotGlobalConfiguration.get(),
                new GitHubService("", "https://api.github.com"),
                new ChangePlanStore(),
                new RecoveryService(),
                new ConversationStore());
    }

    private static io.jenkins.plugins.copilot.storage.RunState runState(AgentOutcome outcome) {
        io.jenkins.plugins.copilot.storage.RunState state = new io.jenkins.plugins.copilot.storage.RunState();
        state.setConversationId("conv");
        state.setUserId("admin");
        state.setProvider("openai");
        state.setModel("gpt-test");
        state.setThinking("AUTO");
        state.setMessages(outcome.getMessages());
        state.setApprovals(outcome.getApprovals());
        return state;
    }

    private static ProviderResult toolCall(String name, String args) {
        ProviderResult result = new ProviderResult();
        result.setToolCalls(List.of(new ToolCall("call_1", name, args)));
        result.setFinishReason("tool_calls");
        return result;
    }

    private static ProviderResult text(String value) {
        ProviderResult result = new ProviderResult();
        result.setText(value);
        result.setFinishReason("stop");
        return result;
    }

    private static final class FakeProvider implements Provider {
        private final ProviderResult first;
        private final ProviderResult second;
        private int calls;

        FakeProvider(ProviderResult first, ProviderResult second) {
            this.first = first;
            this.second = second;
        }

        @Override
        public String id() {
            return "openai";
        }

        @Override
        public List<ModelInfo> listModels(ProviderConfig config) {
            return List.of();
        }

        @Override
        public ProviderResult stream(
                ProviderConfig config,
                String model,
                List<ChatMessage> messages,
                List<ToolSpec> tools,
                ThinkingLevel thinking,
                java.time.Duration timeout,
                io.jenkins.plugins.copilot.providers.AttachmentLoader attachments,
                ProviderStreamSink sink,
                AbortSignal abort) {
            calls++;
            ProviderResult result = calls == 1 ? first : second;
            if (result.getText() != null && !result.getText().isEmpty()) {
                sink.text(result.getText());
            }
            for (ToolCall call : result.getToolCalls()) {
                sink.toolCall(call);
            }
            return result;
        }
    }

    private static final class RecordingSink implements AgentSink {
        final List<String> approvals = new ArrayList<>();
        final List<String> toolStarts = new ArrayList<>();
        boolean executedDelete;

        @Override
        public void text(String delta) {}

        @Override
        public void toolStart(ToolCall call, ToolSpec spec, JsonNode args) {
            toolStarts.add(call.getName());
        }

        @Override
        public void toolResult(ToolCall call, JsonNode output) {
            if ("delete_job".equals(call.getName())) {
                executedDelete = true;
            }
        }

        @Override
        public void toolError(ToolCall call, String error) {}

        @Override
        public void approvalRequired(ApprovalRecord approval) {
            approvals.add(approval.getToolName());
        }
    }

    private Response get(String path, String user) throws Exception {
        return request("GET", path, null, user);
    }

    private Response post(String path, String body, String user) throws Exception {
        return request("POST", path, body, user);
    }

    private Response request(String method, String path, String body, String user) throws Exception {
        String base = jenkins.getURL().toExternalForm();
        if (!base.endsWith("/")) {
            base += "/";
        }
        HttpURLConnection connection = (HttpURLConnection) new URL(base + path).openConnection();
        connection.setRequestMethod(method);
        String credentials = Base64.getEncoder()
                .encodeToString((user + ":" + user).getBytes(StandardCharsets.UTF_8));
        connection.setRequestProperty("Authorization", "Basic " + credentials);
        connection.setRequestProperty("Accept", "application/json");
        if (body != null) {
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            try (OutputStream output = connection.getOutputStream()) {
                output.write(body.getBytes(StandardCharsets.UTF_8));
            }
        }
        int status = connection.getResponseCode();
        InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String text = stream == null ? "" : new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        return new Response(status, text);
    }

    private record Response(int status, String body) {}
}
