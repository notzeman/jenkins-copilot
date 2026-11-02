package io.jenkins.plugins.copilot.providers;

import java.util.List;

public final class ProviderFactory {

    public static final String OPENAI = "openai";
    public static final String ANTHROPIC = "anthropic";
    public static final String OPENCODE_GO = "opencode-go";

    public static final List<String> SUPPORTED = List.of(OPENAI, ANTHROPIC, OPENCODE_GO);

    private ProviderFactory() {}

    public static Provider create(String providerId, String opencodeGoBaseUrl) {
        return switch (providerId) {
            case OPENAI -> new OpenAiProvider(OPENAI, "https://api.openai.com/v1");
            case ANTHROPIC -> new AnthropicProvider();
            case OPENCODE_GO -> new OpenAiProvider(OPENCODE_GO, opencodeGoBaseUrl);
            default -> throw new IllegalArgumentException("Unsupported provider: " + providerId);
        };
    }

    public static String label(String providerId) {
        return switch (providerId) {
            case OPENAI -> "OpenAI";
            case ANTHROPIC -> "Claude";
            case OPENCODE_GO -> "opencode go";
            default -> providerId;
        };
    }
}
