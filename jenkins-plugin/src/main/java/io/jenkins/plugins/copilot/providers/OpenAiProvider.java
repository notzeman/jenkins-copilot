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

/** OpenAI Chat Completions, also used for opencode go and other OpenAI-compatible endpoints. */
public class OpenAiProvider implements Provider {

    private final String id;
    private final String defaultBaseUrl;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .followRedirects(HttpClient.Redirect.NEVER)
            .proxy(java.net.ProxySelector.getDefault())
            .build();

    public OpenAiProvider(String id, String defaultBaseUrl) {
        this.id = id;
        this.defaultBaseUrl = defaultBaseUrl;
    }

    @Override
    public String id() {
        return id;
    }

    @Override
    public List<ModelInfo> listModels(ProviderConfig config) throws Exception {
        String base = normalizeBase(config.baseUrl() == null ? defaultBaseUrl : config.baseUrl());
        HttpRequest request = HttpRequest.newBuilder(URI.create(base + "/models"))
                .timeout(Duration.ofSeconds(30))
                .header("authorization", "Bearer " + config.apiKey())
                .header("accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new ProviderException(response.statusCode(), errorMessage(response.body()));
        }
        JsonNode root = Jackson.parse(response.body());
        List<ModelInfo> models = new ArrayList<>();
        for (JsonNode item : root.path("data")) {
            String modelId = item.path("id").asText("");
            if (modelId.isBlank() || isNonChatModel(modelId)) {
                continue;
            }
            models.add(new ModelInfo(modelId, modelId));
        }
        models.sort(Comparator.comparing(ModelInfo::id));
        return models.size() > 300 ? models.subList(0, 300) : models;
    }

    @Override
    public ProviderResult stream(
            ProviderConfig config,
            String model,
            List<ChatMessage> messages,
            List<ToolSpec> tools,
            ThinkingLevel thinking,
            Duration timeout,
            AttachmentLoader attachments,
            ProviderStreamSink sink,
            AbortSignal abort)
            throws Exception {
        String base = normalizeBase(config.baseUrl() == null ? defaultBaseUrl : config.baseUrl());
        ObjectNode body = Jackson.obj();
        body.put("model", stripProvider(model));
        body.set("messages", toMessages(messages, attachments));
        body.put("stream", true);
        body.put("tool_choice", "auto");
        if (!tools.isEmpty()) {
            ArrayNode toolArray = Jackson.arr();
            for (ToolSpec tool : tools) {
                toolArray.add(Jackson.obj()
                        .put("type", "function")
                        .set("function", Jackson.obj()
                                .put("name", tool.getName())
                                .put("description", tool.getDescription())
                                .set("parameters", tool.getParameters())));
            }
            body.set("tools", toolArray);
        }
        if (thinking.enabled()) {
            body.put("reasoning_effort", thinking.name().toLowerCase());
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create(base + "/chat/completions"))
                .timeout(clampTimeout(timeout))
                .header("authorization", "Bearer " + config.apiKey())
                .header("content-type", "application/json")
                .header("accept", "text/event-stream")
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
        String contentType = response.headers().firstValue("content-type").orElse("");
        if (contentType.contains("application/json")) {
            try (InputStream in = response.body()) {
                return parseNonStreaming(Jackson.parse(new String(in.readAllBytes(), StandardCharsets.UTF_8)), sink);
            }
        }
        return parseStream(response.body(), sink, abort);
    }

    private ProviderResult parseStream(InputStream body, ProviderStreamSink sink, AbortSignal abort)
            throws Exception {
        ProviderResult result = new ProviderResult();
        Map<Integer, ToolAccumulator> toolCalls = new LinkedHashMap<>();
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
                if (data.isEmpty() || "[DONE]".equals(data)) {
                    continue;
                }
                JsonNode event;
                try {
                    event = Jackson.parse(data);
                } catch (RuntimeException e) {
                    continue;
                }
                JsonNode choice = event.path("choices").path(0);
                JsonNode delta = choice.path("delta");
                if (delta.hasNonNull("content")) {
                    String text = delta.get("content").asText();
                    if (!text.isEmpty()) {
                        result.setText(result.getText() + text);
                        sink.text(text);
                    }
                }
                String reasoning = reasoningText(delta);
                if (reasoning != null && !reasoning.isEmpty()) {
                    sink.reasoning(reasoning);
                }
                JsonNode toolDeltas = delta.path("tool_calls");
                for (JsonNode toolDelta : toolDeltas) {
                    int index = toolDelta.path("index").asInt(0);
                    ToolAccumulator accumulator = toolCalls.computeIfAbsent(index, ignored -> new ToolAccumulator());
                    if (toolDelta.hasNonNull("id")) {
                        accumulator.id = toolDelta.get("id").asText();
                    }
                    JsonNode function = toolDelta.path("function");
                    if (function.hasNonNull("name")) {
                        accumulator.name = function.get("name").asText();
                    }
                    if (function.hasNonNull("arguments")) {
                        accumulator.arguments.append(function.get("arguments").asText());
                    }
                }
                if (choice.hasNonNull("finish_reason")) {
                    result.setFinishReason(choice.get("finish_reason").asText());
                }
                if (event.hasNonNull("usage")) {
                    result.setUsage(mapUsage(event.get("usage")));
                }
            }
        }
        finishToolCalls(toolCalls, result, sink);
        return result;
    }

    private ProviderResult parseNonStreaming(JsonNode root, ProviderStreamSink sink) {
        ProviderResult result = new ProviderResult();
        JsonNode message = root.path("choices").path(0).path("message");
        String text = message.path("content").asText("");
        if (!text.isEmpty()) {
            result.setText(text);
            sink.text(text);
        }
        List<ToolCall> calls = new ArrayList<>();
        for (JsonNode tool : message.path("tool_calls")) {
            String callId = tool.path("id").asText("call_" + calls.size());
            String name = tool.path("function").path("name").asText("");
            String arguments = tool.path("function").path("arguments").asText("{}");
            if (!name.isBlank()) {
                calls.add(new ToolCall(callId, name, arguments));
            }
        }
        for (ToolCall call : calls) {
            sink.toolCall(call);
        }
        result.setToolCalls(calls);
        result.setFinishReason(root.path("choices").path(0).path("finish_reason").asText("stop"));
        if (root.hasNonNull("usage")) {
            result.setUsage(mapUsage(root.get("usage")));
        }
        return result;
    }

    private ArrayNode toMessages(List<ChatMessage> messages, AttachmentLoader attachments) throws Exception {
        ArrayNode out = Jackson.arr();
        for (ChatMessage message : messages) {
            ObjectNode item = Jackson.obj();
            switch (message.getRole()) {
                case SYSTEM -> {
                    item.put("role", "system");
                    item.put("content", message.getContent());
                }
                case USER -> {
                    item.put("role", "user");
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
                            String dataUrl = "data:" + ref.getMediaType() + ";base64,"
                                    + Base64.getEncoder().encodeToString(bytes);
                            content.add(Jackson.obj()
                                    .put("type", "image_url")
                                    .set("image_url", Jackson.obj().put("url", dataUrl)));
                        }
                        if (!message.getContent().isBlank()) {
                            content.add(Jackson.obj().put("type", "text").put("text", message.getContent()));
                        }
                        item.set("content", content);
                    }
                }
                case ASSISTANT -> {
                    item.put("role", "assistant");
                    item.put("content", message.getContent().isBlank() ? null : message.getContent());
                    if (!message.getToolCalls().isEmpty()) {
                        ArrayNode calls = Jackson.arr();
                        for (ToolCall call : message.getToolCalls()) {
                            calls.add(Jackson.obj()
                                    .put("id", call.getId())
                                    .put("type", "function")
                                    .set("function", Jackson.obj()
                                            .put("name", call.getName())
                                            .put("arguments", call.getArguments())));
                        }
                        item.set("tool_calls", calls);
                    }
                }
                case TOOL -> {
                    item.put("role", "tool");
                    item.put("tool_call_id", message.getToolCallId());
                    item.put("content", message.getContent());
                }
                default -> {
                    continue;
                }
            }
            out.add(item);
        }
        return out;
    }

    private static void finishToolCalls(
            Map<Integer, ToolAccumulator> accumulators, ProviderResult result, ProviderStreamSink sink) {
        List<ToolCall> calls = new ArrayList<>();
        accumulators.entrySet().stream().sorted(Map.Entry.comparingByKey()).forEach(entry -> {
            ToolAccumulator accumulator = entry.getValue();
            if (accumulator.name != null && !accumulator.name.isBlank()) {
                ToolCall call = new ToolCall(
                        accumulator.id == null ? "call_" + entry.getKey() : accumulator.id,
                        accumulator.name,
                        accumulator.arguments.length() == 0 ? "{}" : accumulator.arguments.toString());
                calls.add(call);
                sink.toolCall(call);
            }
        });
        result.setToolCalls(calls);
    }

    private static Duration clampTimeout(Duration timeout) {
        long seconds = timeout == null ? 300 : timeout.toSeconds();
        return Duration.ofSeconds(Math.max(30, Math.min(seconds, 900)));
    }

    static String normalizeBase(String value) {
        String base = (value == null ? "" : value.trim()).replaceAll("/+$", "");
        if (base.endsWith("/chat/completions")) {
            base = base.substring(0, base.length() - "/chat/completions".length());
        }
        if (base.isBlank()) {
            base = "https://api.openai.com/v1";
        }
        if (!base.endsWith("/v1")) {
            base += "/v1";
        }
        return base;
    }

    private static String stripProvider(String model) {
        int index = model.indexOf(':');
        return index < 0 ? model : model.substring(index + 1);
    }

    private static boolean isNonChatModel(String id) {
        String lower = id.toLowerCase();
        return lower.contains("embed")
                || lower.contains("tts")
                || lower.contains("whisper")
                || lower.contains("dall-e")
                || lower.contains("audio")
                || lower.contains("realtime")
                || lower.contains("transcribe")
                || lower.contains("moderation")
                || lower.contains("image");
    }

    private static String reasoningText(JsonNode delta) {
        if (delta.hasNonNull("reasoning_content")) {
            return delta.get("reasoning_content").asText();
        }
        if (delta.hasNonNull("reasoning")) {
            return delta.get("reasoning").asText();
        }
        return null;
    }

    private static Map<String, Object> mapUsage(JsonNode usage) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("inputTokens", usage.path("prompt_tokens").asInt(0));
        map.put("outputTokens", usage.path("completion_tokens").asInt(0));
        map.put("totalTokens", usage.path("total_tokens").asInt(0));
        return map;
    }

    private static String errorMessage(String body) {
        try {
            JsonNode node = Jackson.parse(body);
            String message = node.path("error").path("message").asText(null);
            if (message != null) {
                return message;
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
    }
}
