package io.jenkins.plugins.copilot;

import hudson.Extension;
import hudson.util.Secret;
import io.jenkins.plugins.copilot.providers.ProviderConfig;
import io.jenkins.plugins.copilot.providers.ProviderFactory;
import java.util.ArrayList;
import java.util.List;
import jenkins.model.GlobalConfiguration;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.jenkinsci.Symbol;
import org.kohsuke.stapler.DataBoundSetter;

/** Global configuration for the assistant. Secrets are stored as Jenkins Secret values. */
@Extension
@Symbol("jenkinsAiCopilot")
public class CopilotGlobalConfiguration extends GlobalConfiguration {

    private boolean enabled = true;
    private boolean sidebarEnabled = true;

    private Secret openaiApiKey;
    private Secret anthropicApiKey;
    private String opencodeGoBaseUrl = "";
    private Secret opencodeGoApiKey;

    private String defaultProvider = ProviderFactory.OPENAI;
    private String defaultModel = "";
    private int maxSteps = 20;
    private int requestTimeoutSeconds = 300;
    private boolean autoApproveLevel2 = false;

    private Secret githubToken;
    private String githubApiUrl = "https://api.github.com";

    private int maxAttachmentMb = 5;
    private int retentionPerUser = 50;

    public CopilotGlobalConfiguration() {
        load();
    }

    public static CopilotGlobalConfiguration get() {
        CopilotGlobalConfiguration config =
                GlobalConfiguration.all().get(CopilotGlobalConfiguration.class);
        if (config == null) {
            throw new IllegalStateException("Jenkins AI Copilot configuration is unavailable");
        }
        return config;
    }

    public boolean isEnabled() {
        return enabled;
    }

    @DataBoundSetter
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        save();
    }

    public boolean isSidebarEnabled() {
        return sidebarEnabled;
    }

    @DataBoundSetter
    public void setSidebarEnabled(boolean sidebarEnabled) {
        this.sidebarEnabled = sidebarEnabled;
        save();
    }

    public Secret getOpenaiApiKey() {
        return openaiApiKey;
    }

    @DataBoundSetter
    public void setOpenaiApiKey(Secret openaiApiKey) {
        this.openaiApiKey = openaiApiKey;
        save();
    }

    public Secret getAnthropicApiKey() {
        return anthropicApiKey;
    }

    @DataBoundSetter
    public void setAnthropicApiKey(Secret anthropicApiKey) {
        this.anthropicApiKey = anthropicApiKey;
        save();
    }

    public String getOpencodeGoBaseUrl() {
        return opencodeGoBaseUrl;
    }

    @DataBoundSetter
    public void setOpencodeGoBaseUrl(String opencodeGoBaseUrl) {
        this.opencodeGoBaseUrl = opencodeGoBaseUrl == null ? "" : opencodeGoBaseUrl.trim();
        save();
    }

    public Secret getOpencodeGoApiKey() {
        return opencodeGoApiKey;
    }

    @DataBoundSetter
    public void setOpencodeGoApiKey(Secret opencodeGoApiKey) {
        this.opencodeGoApiKey = opencodeGoApiKey;
        save();
    }

    public String getDefaultProvider() {
        return defaultProvider;
    }

    @DataBoundSetter
    public void setDefaultProvider(String defaultProvider) {
        this.defaultProvider = defaultProvider == null || defaultProvider.isBlank()
                ? ProviderFactory.OPENAI
                : defaultProvider.trim();
        save();
    }

    public String getDefaultModel() {
        return defaultModel;
    }

    @DataBoundSetter
    public void setDefaultModel(String defaultModel) {
        this.defaultModel = defaultModel == null ? "" : defaultModel.trim();
        save();
    }

    public int getMaxSteps() {
        return maxSteps;
    }

    @DataBoundSetter
    public void setMaxSteps(int maxSteps) {
        this.maxSteps = Math.max(1, Math.min(maxSteps, 60));
        save();
    }

    public int getRequestTimeoutSeconds() {
        return requestTimeoutSeconds;
    }

    @DataBoundSetter
    public void setRequestTimeoutSeconds(int requestTimeoutSeconds) {
        this.requestTimeoutSeconds = Math.max(30, Math.min(requestTimeoutSeconds, 900));
        save();
    }

    public boolean isAutoApproveLevel2() {
        return autoApproveLevel2;
    }

    @DataBoundSetter
    public void setAutoApproveLevel2(boolean autoApproveLevel2) {
        this.autoApproveLevel2 = autoApproveLevel2;
        save();
    }

    public Secret getGithubToken() {
        return githubToken;
    }

    @DataBoundSetter
    public void setGithubToken(Secret githubToken) {
        this.githubToken = githubToken;
        save();
    }

    public String getGithubApiUrl() {
        return githubApiUrl;
    }

    @DataBoundSetter
    public void setGithubApiUrl(String githubApiUrl) {
        this.githubApiUrl = githubApiUrl == null || githubApiUrl.isBlank()
                ? "https://api.github.com"
                : githubApiUrl.trim();
        save();
    }

    public int getMaxAttachmentMb() {
        return maxAttachmentMb;
    }

    @DataBoundSetter
    public void setMaxAttachmentMb(int maxAttachmentMb) {
        this.maxAttachmentMb = Math.max(1, Math.min(maxAttachmentMb, 20));
        save();
    }

    public int getRetentionPerUser() {
        return retentionPerUser;
    }

    @DataBoundSetter
    public void setRetentionPerUser(int retentionPerUser) {
        this.retentionPerUser = Math.max(1, Math.min(retentionPerUser, 500));
        save();
    }

    public String githubTokenPlain() {
        return githubToken == null ? "" : githubToken.getPlainText();
    }

    public ProviderConfig providerConfig(String providerId) {
        if (providerId == null) {
            return null;
        }
        return switch (providerId) {
            case ProviderFactory.OPENAI -> secret(openaiApiKey)
                    ? new ProviderConfig(providerId, openaiApiKey.getPlainText(), "https://api.openai.com/v1")
                    : null;
            case ProviderFactory.ANTHROPIC -> secret(anthropicApiKey)
                    ? new ProviderConfig(providerId, anthropicApiKey.getPlainText(), "https://api.anthropic.com")
                    : null;
            case ProviderFactory.OPENCODE_GO -> secret(opencodeGoApiKey) && opencodeGoBaseUrl != null && !opencodeGoBaseUrl.isBlank()
                    ? new ProviderConfig(providerId, opencodeGoApiKey.getPlainText(), opencodeGoBaseUrl)
                    : null;
            default -> null;
        };
    }

    public List<String> configuredProviders() {
        List<String> providers = new ArrayList<>();
        for (String provider : ProviderFactory.SUPPORTED) {
            if (providerConfig(provider) != null) {
                providers.add(provider);
            }
        }
        return providers;
    }

    public boolean setupRequired() {
        return configuredProviders().isEmpty();
    }

    public boolean githubConfigured() {
        return secret(githubToken);
    }

    public JSONObject publicConfig() {
        JSONObject out = new JSONObject();
        out.put("enabled", enabled);
        out.put("sidebarEnabled", sidebarEnabled);
        out.put("setupRequired", setupRequired());
        out.put("defaultProvider", defaultProvider);
        out.put("defaultModel", defaultModel == null ? "" : defaultModel);
        out.put("maxSteps", maxSteps);
        out.put("maxAttachmentMb", maxAttachmentMb);
        out.put("autoApproveLevel2", autoApproveLevel2);
        out.put("githubConfigured", githubConfigured());

        JSONArray providers = new JSONArray();
        for (String provider : ProviderFactory.SUPPORTED) {
            JSONObject item = new JSONObject();
            item.put("id", provider);
            item.put("label", ProviderFactory.label(provider));
            item.put("configured", providerConfig(provider) != null);
            if (ProviderFactory.OPENCODE_GO.equals(provider)) {
                item.put("baseUrl", opencodeGoBaseUrl == null ? "" : opencodeGoBaseUrl);
            }
            providers.add(item);
        }
        out.put("providers", providers);
        return out;
    }

    private static boolean secret(Secret value) {
        return value != null && value.getPlainText() != null && !value.getPlainText().isBlank();
    }

    public void saveProvider(String providerId, String apiKey, String baseUrl, String model) {
        switch (providerId) {
            case ProviderFactory.OPENAI -> setOpenaiApiKey(Secret.fromString(apiKey));
            case ProviderFactory.ANTHROPIC -> setAnthropicApiKey(Secret.fromString(apiKey));
            case ProviderFactory.OPENCODE_GO -> {
                if (baseUrl == null || baseUrl.isBlank()) {
                    throw new IllegalArgumentException("opencode go requires a base URL");
                }
                setOpencodeGoBaseUrl(baseUrl);
                setOpencodeGoApiKey(Secret.fromString(apiKey));
            }
            default -> throw new IllegalArgumentException("Unsupported provider: " + providerId);
        }
        setDefaultProvider(providerId);
        if (model != null && !model.isBlank()) {
            setDefaultModel(model);
        }
        save();
    }

    public void clearProvider(String providerId) {
        switch (providerId) {
            case ProviderFactory.OPENAI -> setOpenaiApiKey(null);
            case ProviderFactory.ANTHROPIC -> setAnthropicApiKey(null);
            case ProviderFactory.OPENCODE_GO -> {
                setOpencodeGoApiKey(null);
                setOpencodeGoBaseUrl("");
            }
            default -> {
                return;
            }
        }
        save();
    }

    public boolean hasPermissionToConfigure() {
        return Jenkins.get().hasPermission(Jenkins.ADMINISTER);
    }
}
