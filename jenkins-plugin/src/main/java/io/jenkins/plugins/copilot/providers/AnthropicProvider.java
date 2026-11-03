package io.jenkins.plugins.copilot.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.tools.ToolSpec;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Anthropic Messages API with tool use, vision, and thinking budgets. */
public class AnthropicProvider implements Provider {

    private static final String DEFAULT_BASE = "https://api.anthropic.com";
    private static final String API_VERSION = "2023-06-01";

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .followRedirects(HttpClient.Redirect.NEVER)
            .proxy(java.net.ProxySelector.getDefault())
            .build();

    @Override
    public String id() {
        return "anthropic";
    }

    @Override
    public List<ModelInfo> listModels(ProviderConfig config) throws Exception {
        String base = normalizeBase(config.baseUrl());
        HttpRequest request = HttpRequest.newBuilder(URI.create(base + "/v1/models?limit=100"))
                .timeout(Duration.ofSeconds(30))
                .header("x-api-key", config.apiKey())
                .header("anthropic-version", API_VERSION)
                .header("accept", "application/json")
                .header("user-agent", UserAgent.value())
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new ProviderException(response.statusCode(), errorMessage(response.body()));
        }
        JsonNode root = Jackson.parse(response.body());
        List<ModelInfo> models = new ArrayList<>();
        for (JsonNode item : root.path("data")) {
            String id = item.path("id").asText("");
            if (!id.isBlank()) {
                models.add(new ModelInfo(id, item.path("display_name").asText(id)));
            }
        }
        models.sort(Comparator.comparing(ModelInfo::id));
        return models;
    }

    @Override
    public ProviderResult stream(
            ProviderConfig config,
            String sessionId,
            String model,
            List<ChatMessage> messages,
            List<ToolSpec> tools,
            ThinkingLevel thinking,
            Duration timeout,
            AttachmentLoader attachments,
            ProviderStreamSink sink,
            AbortSignal abort)
            throws Exception {
        String base = normalizeBase(config.baseUrl());
        int maxTokens = switch (thinking) {
            case LOW -> 8192;
            case MEDIUM -> 12288;
            case HIGH -> 16384;
            default -> 8192;
        };
        ObjectNode body = Jackson.obj();
        body.put("model", stripProvider(model));
        body.put("max_tokens", maxTokens);
        body.put("stream", true);
        body.set("system", Jackson.MAPPER.getNodeFactory().textNode(systemPrompt(messages)));
        body.set("messages", toMessages(messages, attachments));
        if (!tools.isEmpty()) {
            ArrayNode array = Jackson.arr();
            for (ToolSpec tool : tools) {
                array.add(Jackson.obj()
                        .put("name", tool.getName())
                        .put("description", tool.getDescription())
                        .set("input_schema", tool.getParameters()));
            }
            body.set("tools", array);
            body.set("tool_choice", Jackson.obj().put("type", "auto"));
        }
        if (thinking.enabled()) {
            int budget = switch (thinking) {
                case LOW -> 1024;
                case MEDIUM -> 4096;
                case HIGH -> 8192;
                default -> 0;
            };
            body.set("thinking", Jackson.obj().put("type", "enabled").put("budget_tokens", budget));
        }

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder(URI.create(base + "/v1/messages"))
                .timeout(clampTimeout(timeout))
                .header("x-api-key", config.apiKey())
                .header("anthropic-version", API_VERSION)
                .header("content-type", "application/json")
                .header("accept", "text/event-stream")
                .header("user-agent", UserAgent.value());
        if (base.contains("opencode.ai") && sessionId != null && !sessionId.isBlank()) {
            requestBuilder.header("x-opencode-session", sessionId);
        }
        HttpRequest request = requestBuilder
                .POST(HttpRequest.BodyPublishers.ofString(Jackson.write(body), StandardCharsets.UTF_8))
                .build();
        HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() >= 400) {
            String error;
            try (InputStream in = response.body()) {
                error = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            }
            throw new ProviderException(response.statusCode(), errorMessage(error));
        }
        return parseStream(response.body(), sink, abort);
    }

    private ProviderResult parseStream(InputStream body, ProviderStreamSink sink, AbortSignal abort) throws Exception {
        ProviderResult result = new ProviderResult();
        Map<Integer, ToolAccumulator> tools = new LinkedHashMap<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(body, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (abort.isAborted()) {
                    throw new ProviderException("aborted");
                }
                if (!line.startsWith("data:")) {
                    continue;
                }
                String data = line.substring(5).trim();
                if (data.isEmpty()) {
                    continue;
                }
                JsonNode event;
                try {
                    event = Jackson.parse(data);
                } catch (RuntimeException e) {
                    continue;
                }
                String type = event.path("type").asText("");
                switch (type) {
                    case "content_block_start" -> {
                        JsonNode block = event.path("content_block");
                        if ("tool_use".equals(block.path("type").asText())) {
                            int index = event.path("index").asInt(0);
                            ToolAccumulator accumulator = tools.computeIfAbsent(index, ignored -> new ToolAccumulator());
                            accumulator.id = block.path("id").asText();
                            accumulator.name = block.path("name").asText();
                        }
                    }
                    case "content_block_delta" -> {
                        JsonNode delta = event.path("delta");
                        String deltaType = delta.path("type").asText("");
                        if ("text_delta".equals(deltaType)) {
                            String text = delta.path("text").asText("");
                            if (!text.isEmpty()) {
                                result.setText(result.getText() + text);
                                sink.text(text);
                            }
                        } else if ("thinking_delta".equals(deltaType)) {
                            String text = delta.path("thinking").asText("");
                            if (!text.isEmpty()) {
                                sink.reasoning(text);
                            }
                        } else if ("input_json_delta".equals(deltaType)) {
                            int index = event.path("index").asInt(0);
                            ToolAccumulator accumulator = tools.computeIfAbsent(index, ignored -> new ToolAccumulator());
                            accumulator.arguments.append(delta.path("partial_json").asText(""));
                        }
                    }
                    case "content_block_stop" -> {
                        int index = event.path("index").asInt(0);
                        ToolAccumulator accumulator = tools.get(index);
                        if (accumulator != null && accumulator.name != null && !accumulator.name.isBlank()) {
                            ToolCall call = accumulator.toCall(index);
                            sink.toolCall(call);
                        }
                    }
                    case "message_delta" -> {
                        result.setFinishReason(event.path("delta").path("stop_reason").asText("stop"));
                        if (event.hasNonNull("usage")) {
                            Map<String, Object> usage = new LinkedHashMap<>();
                            usage.put("outputTokens", event.path("usage").path("output_tokens").asInt(0));
                            result.setUsage(usage);
                        }
                    }
                    case "error" -> {
                        throw new ProviderException(event.path("error").path("message").asText("Provider error"));
                    }
                    default -> {
                        // message_start, message_stop, ping
                    }
                }
            }
        }
        List<ToolCall> calls = new ArrayList<>();
        tools.entrySet().stream().sorted(Map.Entry.comparingByKey()).forEach(entry -> {
            ToolAccumulator accumulator = entry.getValue();
            if (accumulator.name != null && !accumulator.name.isBlank()) {
                calls.add(accumulator.toCall(entry.getKey()));
            }
        });
        result.setToolCalls(calls);
        return result;
    }

    private ArrayNode toMessages(List<ChatMessage> messages, AttachmentLoader attachments) throws Exception {
        ArrayNode out = Jackson.arr();
        for (int i = 0; i < messages.size(); i++) {
            ChatMessage message = messages.get(i);
            switch (message.getRole()) {
                case SYSTEM -> {
                    // Anthropic takes the system prompt as a top-level field.
                }
                case USER -> {
                    ObjectNode item = Jackson.obj().put("role", "user");
                    if (message.getImages().isEmpty()) {
                        item.put("content", message.getContent());
                    } else {
                        ArrayNode content = Jackson.arr();
                        int count = 0;
                        for (AttachmentRef ref : message.getImages()) {
                            if (count++ >= 4) {
                                break;
                            }
                            byte[] bytes = attachments.load(ref);
                            if (bytes == null || bytes.length == 0 || bytes.length > 6_000_000) {
                                continue;
                            }
                            content.add(Jackson.obj()
                                    .put("type", "image")
                                    .set("source", Jackson.obj()
                                            .put("type", "base64")
                                            .put("media_type", ref.getMediaType())
                                            .put("data", Base64.getEncoder().encodeToString(bytes))));
                        }
                        if (!message.getContent().isBlank()) {
                            content.add(Jackson.obj().put("type", "text").put("text", message.getContent()));
                        }
                        item.set("content", content);
                    }
                    out.add(item);
                }
                case ASSISTANT -> {
                    ArrayNode content = Jackson.arr();
                    if (!message.getContent().isBlank()) {
                        content.add(Jackson.obj().put("type", "text").put("text", message.getContent()));
                    }
                    for (ToolCall call : message.getToolCalls()) {
                        content.add(Jackson.obj()
                                .put("type", "tool_use")
                                .put("id", call.getId())
                                .put("name", call.getName())
                                .set("input", safeParse(call.getArguments())));
                    }
                    out.add(Jackson.obj().put("role", "assistant").set("content", content));
                }
                case TOOL -> {
                    ArrayNode results = Jackson.arr();
                    int j = i;
                    while (j < messages.size() && messages.get(j).getRole() == ChatMessage.Role.TOOL) {
                        ChatMessage tool = messages.get(j);
                        results.add(Jackson.obj()
                                .put("type", "tool_result")
                                .put("tool_use_id", tool.getToolCallId())
                                .put("content", tool.getContent()));
                        j++;
                    }
                    out.add(Jackson.obj().put("role", "user").set("content", results));
                    i = j - 1;
                }
            }
        }
        return out;
    }

    private static JsonNode safeParse(String json) {
        try {
            return Jackson.parse(json);
        } catch (RuntimeException e) {
            return Jackson.obj();
        }
    }

    private static String systemPrompt(List<ChatMessage> messages) {
        StringBuilder sb = new StringBuilder();
        for (ChatMessage message : messages) {
            if (message.getRole() == ChatMessage.Role.SYSTEM) {
                if (sb.length() > 0) {
                    sb.append("\n\n");
                }
                sb.append(message.getContent());
            }
        }
        return sb.toString();
    }

    private static Duration clampTimeout(Duration timeout) {
        long seconds = timeout == null ? 300 : timeout.toSeconds();
        return Duration.ofSeconds(Math.max(30, Math.min(seconds, 900)));
    }

    private static String normalizeBase(String value) {
        String base = (value == null || value.isBlank() ? DEFAULT_BASE : value.trim()).replaceAll("/+$", "");
        if (base.endsWith("/v1/messages")) {
            base = base.substring(0, base.length() - "/v1/messages".length());
        }
        if (base.endsWith("/v1")) {
            base = base.substring(0, base.length() - 3);
        }
        return base;
    }

    private static String stripProvider(String model) {
        int index = model.indexOf(':');
        return index < 0 ? model : model.substring(index + 1);
    }

    private static String errorMessage(String body) {
        try {
            JsonNode node = Jackson.parse(body);
            JsonNode error = node.path("error");
            String message = error.path("message").asText(null);
            if (message != null) {
                String type = error.path("type").asText(null);
                return type == null || type.isBlank() ? message : type + ": " + message;
            }
            String topMessage = node.path("message").asText(null);
            if (topMessage != null) {
                return topMessage;
            }
        } catch (RuntimeException ignored) {
            // fall through
        }
        return body == null || body.isBlank() ? "Provider request failed" : body.substring(0, Math.min(body.length(), 1000));
    }

    private static final class ToolAccumulator {
        String id;
        String name;
        final StringBuilder arguments = new StringBuilder();

        ToolCall toCall(int index) {
            return new ToolCall(
                    id == null || id.isBlank() ? "call_" + index : id,
                    name,
                    arguments.length() == 0 ? "{}" : arguments.toString());
        }
    }
}
