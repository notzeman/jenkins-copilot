package io.jenkins.plugins.copilot.storage;

import com.fasterxml.jackson.databind.JsonNode;
import io.jenkins.plugins.copilot.providers.AttachmentRef;
import io.jenkins.plugins.copilot.providers.ChatMessage;
import io.jenkins.plugins.copilot.util.Jackson;
import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** File-backed conversations, approvals, attachments, and audit trail. */
public class ConversationStore {

    private static final ConcurrentHashMap<String, Object> LOCKS = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Object> RUN_LOCKS = new ConcurrentHashMap<>();

    public Object runLock(String conversationId) {
        return RUN_LOCKS.computeIfAbsent(conversationId, ignored -> new Object());
    }

    private Object lock(String key) {
        return LOCKS.computeIfAbsent(key, ignored -> new Object());
    }

    public Conversation create(String userId, String provider, String model, String thinking) {
        return create(userId, provider, model, thinking, "General", "");
    }

    public Conversation create(
            String userId,
            String provider,
            String model,
            String thinking,
            String pipeline,
            String providerAccountId) {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID().toString());
        conversation.setUserId(userId);
        conversation.setProvider(provider);
        conversation.setModel(model);
        conversation.setThinking(thinking == null ? "AUTO" : thinking);
        conversation.setPipeline(pipeline);
        conversation.setProviderAccountId(providerAccountId);
        save(conversation);
        return conversation;
    }

    public Conversation get(String userId, String conversationId) {
        if (!CopilotStorage.isSafeId(conversationId)) {
            throw new IllegalArgumentException("Invalid conversation id");
        }
        File file = conversationFile(userId, conversationId);
        if (!file.isFile()) {
            throw new IllegalArgumentException("Conversation not found");
        }
        try {
            Conversation conversation = Jackson.MAPPER.readValue(file, Conversation.class);
            if (!userId.equals(conversation.getUserId())) {
                throw new IllegalArgumentException("Conversation not found");
            }
            return conversation;
        } catch (IOException e) {
            throw new IllegalStateException("Could not read conversation", e);
        }
    }

    public void save(Conversation conversation) {
        synchronized (lock(conversation.getUserId() + "/" + conversation.getId())) {
            conversation.setUpdatedAt(System.currentTimeMillis());
            File file = conversationFile(conversation.getUserId(), conversation.getId());
            try {
                CopilotStorage.atomicWrite(file, Jackson.MAPPER.writeValueAsBytes(conversation));
            } catch (IOException e) {
                throw new IllegalStateException("Could not save conversation", e);
            }
        }
    }

    public List<JsonNode> list(String userId, int retention) {
        File dir = CopilotStorage.userDir(userId, "conversations");
        File[] files = dir.listFiles((d, name) -> name.endsWith(".json"));
        List<Conversation> conversations = new ArrayList<>();
        if (files != null) {
            for (File file : files) {
                try {
                    conversations.add(Jackson.MAPPER.readValue(file, Conversation.class));
                } catch (IOException ignored) {
                    // Skip a corrupt conversation file rather than breaking the list.
                }
            }
        }
        conversations.sort(Comparator.comparingLong(Conversation::getUpdatedAt).reversed());
        List<JsonNode> out = new ArrayList<>();
        int limit = Math.max(retention, 1);
        for (int i = 0; i < conversations.size(); i++) {
            Conversation conversation = conversations.get(i);
            if (i >= limit) {
                delete(userId, conversation.getId());
                continue;
            }
            RunState run = loadRun(userId, conversation.getId());
            String status = run != null && !run.pendingApprovals().isEmpty()
                    ? "awaiting_approval"
                    : conversation.getStatus();
            out.add(Jackson.obj()
                    .put("id", conversation.getId())
                    .put("title", conversation.getTitle())
                    .put("updatedAt", conversation.getUpdatedAt())
                    .put("createdAt", conversation.getCreatedAt())
                    .put("provider", conversation.getProvider())
                    .put("model", conversation.getModel())
                    .put("pipeline", conversation.getPipeline())
                    .put("providerAccountId", conversation.getProviderAccountId())
                    .put("messageCount", conversation.getMessages().size())
                    .put("status", status));
        }
        return out;
    }

    public void rename(String userId, String conversationId, String title) {
        Conversation conversation = get(userId, conversationId);
        conversation.setTitle(title);
        save(conversation);
    }

    public void delete(String userId, String conversationId) {
        if (!CopilotStorage.isSafeId(conversationId)) {
            return;
        }
        File conversation = conversationFile(userId, conversationId);
        if (conversation.exists()) {
            conversation.delete();
        }
        File run = runFile(userId, conversationId);
        if (run.exists()) {
            run.delete();
        }
        File attachments = new File(CopilotStorage.userDir(userId, "attachments"), conversationId);
        deleteRecursively(attachments);
    }

    public void append(ChatMessage message, Conversation conversation) {
        conversation.getMessages().add(message);
        if ("New conversation".equals(conversation.getTitle()) && message.getRole() == ChatMessage.Role.USER) {
            String text = message.getContent() == null ? "" : message.getContent().trim();
            conversation.setTitle(text.length() > 80 ? text.substring(0, 80) : text);
        }
        save(conversation);
    }

    public RunState loadRun(String userId, String conversationId) {
        File file = runFile(userId, conversationId);
        if (!file.isFile()) {
            return null;
        }
        try {
            RunState state = Jackson.MAPPER.readValue(file, RunState.class);
            if (!userId.equals(state.getUserId())) {
                return null;
            }
            return state;
        } catch (IOException e) {
            return null;
        }
    }

    public void saveRun(RunState state) {
        state.setUpdatedAt(System.currentTimeMillis());
        try {
            CopilotStorage.atomicWrite(
                    runFile(state.getUserId(), state.getConversationId()),
                    Jackson.MAPPER.writeValueAsBytes(state));
        } catch (IOException e) {
            throw new IllegalStateException("Could not save run state", e);
        }
    }

    public void deleteRun(String userId, String conversationId) {
        File file = runFile(userId, conversationId);
        if (file.exists()) {
            file.delete();
        }
    }

    public AttachmentRef saveAttachment(
            String userId, String conversationId, String mediaType, String fileName, byte[] bytes) {
        String id = UUID.randomUUID().toString();
        File dir = new File(CopilotStorage.userDir(userId, "attachments"), conversationId);
        if (!dir.isDirectory() && !dir.mkdirs() && !dir.isDirectory()) {
            throw new IllegalStateException("Could not create attachment directory");
        }
        try {
            CopilotStorage.atomicWrite(new File(dir, id + ".bin"), bytes);
            JsonNode meta = Jackson.obj()
                    .put("id", id)
                    .put("owner", userId)
                    .put("conversationId", conversationId)
                    .put("mediaType", mediaType)
                    .put("fileName", fileName)
                    .put("size", bytes.length);
            CopilotStorage.atomicWrite(new File(dir, id + ".json"), Jackson.write(meta));
        } catch (IOException e) {
            throw new IllegalStateException("Could not store attachment", e);
        }
        return new AttachmentRef(id, mediaType, fileName, bytes.length);
    }

    public byte[] loadAttachment(String userId, String conversationId, String attachmentId) {
        if (!CopilotStorage.isSafeId(conversationId) || !CopilotStorage.isSafeId(attachmentId)) {
            throw new IllegalArgumentException("Invalid attachment");
        }
        File dir = new File(CopilotStorage.userDir(userId, "attachments"), conversationId);
        File meta = new File(dir, attachmentId + ".json");
        File data = new File(dir, attachmentId + ".bin");
        if (!meta.isFile() || !data.isFile()) {
            throw new IllegalArgumentException("Attachment not found");
        }
        try {
            JsonNode node = Jackson.MAPPER.readTree(meta);
            if (!userId.equals(node.path("owner").asText())) {
                throw new IllegalArgumentException("Attachment not found");
            }
            return Files.readAllBytes(data.toPath());
        } catch (IOException e) {
            throw new IllegalStateException("Could not read attachment", e);
        }
    }

    public String attachmentMediaType(String userId, String conversationId, String attachmentId) {
        File meta = new File(new File(CopilotStorage.userDir(userId, "attachments"), conversationId), attachmentId + ".json");
        try {
            if (!meta.isFile()) {
                return "application/octet-stream";
            }
            JsonNode node = Jackson.MAPPER.readTree(meta);
            return node.path("mediaType").asText("application/octet-stream");
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }

    public void audit(String userId, String action, String target, String result, String detailJson) {
        JsonNode detail;
        try {
            detail = Jackson.parse(detailJson);
        } catch (RuntimeException e) {
            detail = Jackson.obj();
        }
        JsonNode line = Jackson.obj()
                .put("ts", System.currentTimeMillis())
                .put("user", userId)
                .put("action", action)
                .put("target", target)
                .put("result", result)
                .set("detail", detail);
        File file = new File(CopilotStorage.dir("audit"), "audit.jsonl");
        synchronized (lock("audit")) {
            try (RandomAccessFile out = new RandomAccessFile(file, "rw")) {
                out.seek(out.length());
                out.write((Jackson.write(line) + "\n").getBytes(StandardCharsets.UTF_8));
            } catch (IOException e) {
                // Auditing must not break the user-facing operation.
            }
        }
    }

    private File conversationFile(String userId, String conversationId) {
        return new File(CopilotStorage.userDir(userId, "conversations"), conversationId + ".json");
    }

    private File runFile(String userId, String conversationId) {
        return new File(CopilotStorage.userDir(userId, "runs"), conversationId + ".json");
    }

    private static void deleteRecursively(File file) {
        if (file == null || !file.exists()) {
            return;
        }
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) {
                deleteRecursively(child);
            }
        }
        file.delete();
    }
}
