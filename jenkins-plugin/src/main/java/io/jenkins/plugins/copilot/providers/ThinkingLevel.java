package io.jenkins.plugins.copilot.providers;

public enum ThinkingLevel {
    AUTO,
    OFF,
    LOW,
    MEDIUM,
    HIGH;

    public static ThinkingLevel parse(String value) {
        if (value == null || value.isBlank()) {
            return AUTO;
        }
        try {
            return valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return AUTO;
        }
    }

    public boolean enabled() {
        return this == LOW || this == MEDIUM || this == HIGH;
    }
}
