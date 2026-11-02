package io.jenkins.plugins.copilot.providers;

public class ProviderException extends Exception {
    private final int status;

    public ProviderException(String message) {
        this(0, message);
    }

    public ProviderException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
