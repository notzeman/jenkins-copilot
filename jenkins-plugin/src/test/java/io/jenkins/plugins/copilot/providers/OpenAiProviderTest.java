package io.jenkins.plugins.copilot.providers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.After;
import org.junit.Test;

public class OpenAiProviderTest {

    private HttpServer server;
    private int port;
    private final AtomicReference<Headers> modelHeaders = new AtomicReference<>();
    private final AtomicReference<Headers> chatHeaders = new AtomicReference<>();
    private volatile int chatStatus = 200;
    private volatile String chatError = "";

    @After
    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    public void sendsStableSessionAndPluginUserAgent() throws Exception {
        start();
        OpenAiProvider provider = new OpenAiProvider("opencode-go", "https://opencode.ai/inference/go");
        ProviderConfig config = new ProviderConfig(
                "opencode-go", "test-key", "http://127.0.0.1:" + port + "/v1");

        List<ModelInfo> models = provider.listModels(config);
        assertEquals("test-model", models.get(0).id());
        assertEquals("Test Model", models.get(0).label());
        assertTrue(modelHeaders.get().getFirst("User-Agent").startsWith("jenkins-ai-copilot/"));

        ProviderResult result = provider.stream(
                config,
                "conversation-uuid",
                "test-model",
                List.of(ChatMessage.user("hi")),
                List.of(),
                ThinkingLevel.AUTO,
                Duration.ofSeconds(30),
                ref -> new byte[0],
                new ProviderStreamSink() {
                    @Override
                    public void text(String delta) {}
                },
                AbortSignal.NEVER);

        assertEquals("hi", result.getText());
        assertEquals("conversation-uuid", chatHeaders.get().getFirst("x-opencode-session"));
        assertTrue(chatHeaders.get().getFirst("User-Agent").startsWith("jenkins-ai-copilot/"));
    }

    @Test
    public void surfacesGatewayErrorType() throws Exception {
        start();
        chatStatus = 400;
        chatError = "{\"type\":\"error\",\"error\":{\"type\":\"MissingSessionID\",\"message\":\"Request is missing x-opencode-session\"}}";
        OpenAiProvider provider = new OpenAiProvider("opencode-go", "https://opencode.ai/inference/go");
        ProviderConfig config = new ProviderConfig(
                "opencode-go", "test-key", "http://127.0.0.1:" + port + "/v1");

        ProviderException error = assertThrows(ProviderException.class, () -> provider.stream(
                config,
                "conversation-uuid",
                "test-model",
                List.of(ChatMessage.user("hi")),
                List.of(),
                ThinkingLevel.AUTO,
                Duration.ofSeconds(30),
                ref -> new byte[0],
                new ProviderStreamSink() {
                    @Override
                    public void text(String delta) {}
                },
                AbortSignal.NEVER));
        assertTrue(error.getMessage().contains("MissingSessionID"));
    }

    @Test
    public void normalizesOpencodeGoBaseUrls() {
        assertEquals(
                "https://opencode.ai/inference/go/v1",
                OpenAiProvider.normalizeBase("https://opencode.ai/inference/go", "opencode-go"));
        assertEquals(
                "https://opencode.ai/inference/go/v1",
                OpenAiProvider.normalizeBase("https://opencode.ai/inference/go/openai", "opencode-go"));
        assertEquals(
                "https://opencode.ai/inference/go/v1",
                OpenAiProvider.normalizeBase("https://opencode.ai/inference/go/openai/v1", "opencode-go"));
        assertEquals(
                "https://opencode.ai/zen/go/v1",
                OpenAiProvider.normalizeBase("https://opencode.ai/zen/go/v1", "opencode-go"));
    }

    private void start() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        port = server.getAddress().getPort();
        server.createContext("/v1/models", exchange -> {
            modelHeaders.set(exchange.getRequestHeaders());
            byte[] body = "{\"data\":[{\"id\":\"test-model\",\"name\":\"Test Model\"}]}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("content-type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.createContext("/v1/chat/completions", exchange -> {
            chatHeaders.set(exchange.getRequestHeaders());
            if (chatStatus >= 400) {
                byte[] body = chatError.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("content-type", "application/json");
                exchange.sendResponseHeaders(chatStatus, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
                return;
            }
            String sse = "data: {\"choices\":[{\"delta\":{\"content\":\"hi\"},\"finish_reason\":null}]}\n\n"
                    + "data: {\"choices\":[{\"delta\":{},\"finish_reason\":\"stop\"}]}\n\n"
                    + "data: [DONE]\n\n";
            byte[] body = sse.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("content-type", "text/event-stream");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
    }
}
