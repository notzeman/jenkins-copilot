package io.jenkins.plugins.copilot.providers;

/** Resolved credentials for one provider. Never persisted or logged. */
public record ProviderConfig(String providerId, String apiKey, String baseUrl) {}
