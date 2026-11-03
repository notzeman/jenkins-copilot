package io.jenkins.plugins.copilot.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hudson.util.Secret;
import io.jenkins.plugins.copilot.CopilotGlobalConfiguration;
import io.jenkins.plugins.copilot.providers.ProviderConfig;
import io.jenkins.plugins.copilot.providers.ProviderFactory;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Encrypted, admin-managed provider and GitHub accounts. */
public class AccountsStore {

    private static final Object LOCK = new Object();

    public static final class ProviderView {
        public final ProviderAccount account;
        public final boolean isDefault;

        ProviderView(ProviderAccount account, boolean isDefault) {
            this.account = account;
            this.isDefault = isDefault;
        }
    }

    public File file() {
        return new File(CopilotStorage.dir("settings"), "accounts.json");
    }

    public synchronized void ensureMigrated(CopilotGlobalConfiguration config) {
        ObjectNode root = load();
        ArrayNode providers = root.withArray("providers");
        ArrayNode github = root.withArray("github");
        if (root.path("legacyProviderMigration").asBoolean(true) && providers.isEmpty()) {
            migrateProvider(root, config, ProviderFactory.OPENAI, config.getOpenaiApiKey(), null, "OpenAI");
            migrateProvider(root, config, ProviderFactory.ANTHROPIC, config.getAnthropicApiKey(), null, "Claude");
            migrateProvider(
                    root,
                    config,
                    ProviderFactory.OPENCODE_GO,
                    config.getOpencodeGoApiKey(),
                    config.getOpencodeGoBaseUrl(),
                    "OpenCode Go");
            if (root.path("defaultProviderId").asText("").isBlank() && !providers.isEmpty()) {
                root.put("defaultProviderId", providers.get(0).path("id").asText());
            }
        }
        if (root.path("legacyGithubMigration").asBoolean(true)
                && github.isEmpty()
                && config.getGithubToken() != null
                && !config.getGithubToken().getPlainText().isBlank()) {
            GitHubAccount account = new GitHubAccount();
            account.setId(UUID.randomUUID().toString());
            account.setLabel("GitHub");
            account.setApiUrl(config.getGithubApiUrl());
            account.setEncryptedToken(encrypt(config.getGithubToken().getPlainText()));
            github.add(toGithubNode(account));
            root.put("defaultGithubId", account.getId());
        }
        save(root);
    }

    private void migrateProvider(
            ObjectNode root,
            CopilotGlobalConfiguration config,
            String provider,
            Secret secret,
            String baseUrl,
            String label) {
        if (secret == null || secret.getPlainText() == null || secret.getPlainText().isBlank()) {
            return;
        }
        ProviderAccount account = new ProviderAccount();
        account.setId(UUID.randomUUID().toString());
        account.setProvider(provider);
        account.setLabel(label);
        account.setBaseUrl(baseUrl == null ? "" : baseUrl);
        account.setEncryptedApiKey(encrypt(secret.getPlainText()));
        if (provider.equals(config.getDefaultProvider()) && config.getDefaultModel() != null) {
            account.setDefaultModel(config.getDefaultModel());
        }
        root.withArray("providers").add(toNode(account));
        if (provider.equals(config.getDefaultProvider())) {
            root.put("defaultProviderId", account.getId());
        }
    }

    public synchronized List<ProviderAccount> providers() {
        List<ProviderAccount> out = new ArrayList<>();
        for (JsonNode node : load().path("providers")) {
            out.add(fromNode(node));
        }
        return out;
    }

    public synchronized List<GitHubAccount> githubAccounts() {
        List<GitHubAccount> out = new ArrayList<>();
        for (JsonNode node : load().path("github")) {
            out.add(fromGithubNode(node));
        }
        return out;
    }

    public synchronized ProviderAccount provider(String id) {
        for (ProviderAccount account : providers()) {
            if (account.getId().equals(id)) {
                return account;
            }
        }
        return null;
    }

    public synchronized GitHubAccount github(String id) {
        for (GitHubAccount account : githubAccounts()) {
            if (account.getId().equals(id)) {
                return account;
            }
        }
        return null;
    }

    public synchronized String defaultProviderId() {
        return load().path("defaultProviderId").asText("");
    }

    public synchronized String defaultGithubId() {
        return load().path("defaultGithubId").asText("");
    }

    public synchronized ProviderAccount defaultProvider() {
        String id = defaultProviderId();
        ProviderAccount account = id.isBlank() ? null : provider(id);
        if (account != null) {
            return account;
        }
        List<ProviderAccount> all = providers();
        return all.isEmpty() ? null : all.get(0);
    }

    public synchronized GitHubAccount defaultGithub() {
        String id = defaultGithubId();
        GitHubAccount account = id.isBlank() ? null : github(id);
        if (account != null) {
            return account;
        }
        List<GitHubAccount> all = githubAccounts();
        return all.isEmpty() ? null : all.get(0);
    }

    public synchronized ProviderConfig providerConfig(ProviderAccount account) {
        if (account == null) {
            return null;
        }
        String key = decrypt(account.getEncryptedApiKey());
        if (key == null || key.isBlank()) {
            return null;
        }
        return new ProviderConfig(
                account.getProvider(),
                key,
                account.getBaseUrl() == null || account.getBaseUrl().isBlank()
                        ? null
                        : account.getBaseUrl());
    }

    public synchronized String githubToken(GitHubAccount account) {
        return account == null ? null : decrypt(account.getEncryptedToken());
    }

    public synchronized ProviderAccount saveProvider(
            String id,
            String provider,
            String label,
            String apiKey,
            String baseUrl,
            String defaultModel) {
        if (!ProviderFactory.SUPPORTED.contains(provider)) {
            throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
        if ((ProviderFactory.OPENCODE_GO.equals(provider)
                        || ProviderFactory.OPENAI_COMPATIBLE.equals(provider))
                && (baseUrl == null || baseUrl.isBlank())) {
            throw new IllegalArgumentException("A base URL is required for " + provider);
        }
        ObjectNode root = load();
        ArrayNode providers = root.withArray("providers");
        ProviderAccount account = id == null || id.isBlank() ? null : provider(id);
        if (account == null) {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalArgumentException("API key is required");
            }
            account = new ProviderAccount();
            account.setId(UUID.randomUUID().toString());
            account.setCreatedAt(System.currentTimeMillis());
        }
        account.setProvider(provider);
        account.setLabel(label == null || label.isBlank() ? ProviderFactory.label(provider) : label.trim());
        account.setBaseUrl(baseUrl == null ? "" : baseUrl.trim());
        if (apiKey != null && !apiKey.isBlank()) {
            account.setEncryptedApiKey(encrypt(apiKey));
        }
        account.setDefaultModel(defaultModel == null ? "" : defaultModel.trim());

        ArrayNode replaced = Jackson.arr();
        boolean found = false;
        for (JsonNode node : providers) {
            if (account.getId().equals(node.path("id").asText())) {
                replaced.add(toNode(account));
                found = true;
            } else {
                replaced.add(node);
            }
        }
        if (!found) {
            replaced.add(toNode(account));
        }
        root.set("providers", replaced);
        if (root.path("defaultProviderId").asText("").isBlank()) {
            root.put("defaultProviderId", account.getId());
        }
        save(root);
        return account;
    }

    public synchronized void deleteProvider(String id) {
        ObjectNode root = load();
        ArrayNode kept = Jackson.arr();
        for (JsonNode node : root.path("providers")) {
            if (!id.equals(node.path("id").asText())) {
                kept.add(node);
            }
        }
        root.set("providers", kept);
        if (kept.isEmpty()) {
            root.put("legacyProviderMigration", false);
        }
        if (id.equals(root.path("defaultProviderId").asText())) {
            root.put("defaultProviderId", kept.isEmpty() ? "" : kept.get(0).path("id").asText());
        }
        save(root);
    }

    public synchronized void setDefaultProvider(String id) {
        if (provider(id) == null) {
            throw new IllegalArgumentException("Provider account not found");
        }
        ObjectNode root = load();
        root.put("defaultProviderId", id);
        save(root);
    }

    public synchronized GitHubAccount saveGithub(
            String id, String label, String token, String apiUrl) {
        ObjectNode root = load();
        ArrayNode accounts = root.withArray("github");
        GitHubAccount account = id == null || id.isBlank() ? null : github(id);
        if (account == null) {
            if (token == null || token.isBlank()) {
                throw new IllegalArgumentException("GitHub token is required");
            }
            account = new GitHubAccount();
            account.setId(UUID.randomUUID().toString());
            account.setCreatedAt(System.currentTimeMillis());
        }
        account.setLabel(label == null || label.isBlank() ? "GitHub" : label.trim());
        account.setApiUrl(apiUrl == null || apiUrl.isBlank() ? "https://api.github.com" : apiUrl.trim());
        if (token != null && !token.isBlank()) {
            account.setEncryptedToken(encrypt(token));
        }
        ArrayNode replaced = Jackson.arr();
        boolean found = false;
        for (JsonNode node : accounts) {
            if (account.getId().equals(node.path("id").asText())) {
                replaced.add(toGithubNode(account));
                found = true;
            } else {
                replaced.add(node);
            }
        }
        if (!found) {
            replaced.add(toGithubNode(account));
        }
        root.set("github", replaced);
        if (root.path("defaultGithubId").asText("").isBlank()) {
            root.put("defaultGithubId", account.getId());
        }
        save(root);
        return account;
    }

    public synchronized void deleteGithub(String id) {
        ObjectNode root = load();
        ArrayNode kept = Jackson.arr();
        for (JsonNode node : root.path("github")) {
            if (!id.equals(node.path("id").asText())) {
                kept.add(node);
            }
        }
        root.set("github", kept);
        if (kept.isEmpty()) {
            root.put("legacyGithubMigration", false);
        }
        if (id.equals(root.path("defaultGithubId").asText())) {
            root.put("defaultGithubId", kept.isEmpty() ? "" : kept.get(0).path("id").asText());
        }
        save(root);
    }

    public synchronized void setDefaultGithub(String id) {
        if (github(id) == null) {
            throw new IllegalArgumentException("GitHub account not found");
        }
        ObjectNode root = load();
        root.put("defaultGithubId", id);
        save(root);
    }

    public synchronized ObjectNode masked() {
        ObjectNode out = Jackson.obj();
        ArrayNode providers = Jackson.arr();
        String defaultProviderId = defaultProviderId();
        for (ProviderAccount account : providers()) {
            ObjectNode node = Jackson.obj();
            node.put("id", account.getId());
            node.put("provider", account.getProvider());
            node.put("providerLabel", ProviderFactory.label(account.getProvider()));
            node.put("label", account.getLabel());
            node.put("baseUrl", account.getBaseUrl());
            node.put("defaultModel", account.getDefaultModel());
            node.put("hasKey", account.getEncryptedApiKey() != null && !account.getEncryptedApiKey().isBlank());
            node.put("default", account.getId().equals(defaultProviderId));
            providers.add(node);
        }
        ArrayNode github = Jackson.arr();
        String defaultGithubId = defaultGithubId();
        for (GitHubAccount account : githubAccounts()) {
            ObjectNode node = Jackson.obj();
            node.put("id", account.getId());
            node.put("label", account.getLabel());
            node.put("apiUrl", account.getApiUrl());
            node.put("hasToken", account.getEncryptedToken() != null && !account.getEncryptedToken().isBlank());
            node.put("default", account.getId().equals(defaultGithubId));
            github.add(node);
        }
        out.set("providers", providers);
        out.set("github", github);
        out.put("defaultProviderId", defaultProviderId);
        out.put("defaultGithubId", defaultGithubId);
        return out;
    }

    public void audit(String userId, String action, String target, String result, String detailJson) {
        new ConversationStore().audit(userId, action, target, result, detailJson);
    }

    private ObjectNode load() {
        File file = file();
        ObjectNode root;
        if (file.isFile()) {
            try {
                root = (ObjectNode) Jackson.MAPPER.readTree(file);
            } catch (Exception e) {
                root = empty();
            }
        } else {
            root = empty();
        }
        if (!root.has("providers") || !root.get("providers").isArray()) {
            root.set("providers", Jackson.arr());
        }
        if (!root.has("github") || !root.get("github").isArray()) {
            root.set("github", Jackson.arr());
        }
        return root;
    }

    private static ObjectNode empty() {
        ObjectNode root = Jackson.obj();
        root.set("providers", Jackson.arr());
        root.set("github", Jackson.arr());
        root.put("defaultProviderId", "");
        root.put("defaultGithubId", "");
        return root;
    }

    private void save(JsonNode root) {
        try {
            CopilotStorage.atomicWrite(file(), Jackson.MAPPER.writeValueAsBytes(root));
        } catch (Exception e) {
            throw new IllegalStateException("Could not save accounts", e);
        }
    }

    private static ObjectNode toNode(ProviderAccount account) {
        ObjectNode node = Jackson.obj();
        node.put("id", account.getId());
        node.put("provider", account.getProvider());
        node.put("label", account.getLabel());
        node.put("baseUrl", account.getBaseUrl());
        node.put("encryptedApiKey", account.getEncryptedApiKey());
        node.put("defaultModel", account.getDefaultModel());
        node.put("createdAt", account.getCreatedAt());
        return node;
    }

    private static ProviderAccount fromNode(JsonNode node) {
        ProviderAccount account = new ProviderAccount();
        account.setId(node.path("id").asText());
        account.setProvider(node.path("provider").asText());
        account.setLabel(node.path("label").asText());
        account.setBaseUrl(node.path("baseUrl").asText(""));
        account.setEncryptedApiKey(node.path("encryptedApiKey").asText(""));
        account.setDefaultModel(node.path("defaultModel").asText(""));
        account.setCreatedAt(node.path("createdAt").asLong(System.currentTimeMillis()));
        return account;
    }

    private static ObjectNode toGithubNode(GitHubAccount account) {
        ObjectNode node = Jackson.obj();
        node.put("id", account.getId());
        node.put("label", account.getLabel());
        node.put("apiUrl", account.getApiUrl());
        node.put("encryptedToken", account.getEncryptedToken());
        node.put("createdAt", account.getCreatedAt());
        return node;
    }

    private static GitHubAccount fromGithubNode(JsonNode node) {
        GitHubAccount account = new GitHubAccount();
        account.setId(node.path("id").asText());
        account.setLabel(node.path("label").asText());
        account.setApiUrl(node.path("apiUrl").asText("https://api.github.com"));
        account.setEncryptedToken(node.path("encryptedToken").asText(""));
        account.setCreatedAt(node.path("createdAt").asLong(System.currentTimeMillis()));
        return account;
    }

    private static String encrypt(String plain) {
        return Secret.fromString(plain).getEncryptedValue();
    }

    private static String decrypt(String encrypted) {
        if (encrypted == null || encrypted.isBlank()) {
            return null;
        }
        try {
            Secret secret = Secret.decrypt(encrypted);
            return secret == null ? null : secret.getPlainText();
        } catch (RuntimeException e) {
            return null;
        }
    }
}
