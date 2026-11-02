package io.jenkins.plugins.copilot.storage;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.Locale;
import jenkins.model.Jenkins;

/** All plugin state lives under $JENKINS_HOME/jenkins-ai-copilot. No database or external service. */
public final class CopilotStorage {

    private CopilotStorage() {}

    public static File root() {
        return new File(Jenkins.get().getRootDir(), "jenkins-ai-copilot");
    }

    public static File dir(String... parts) {
        File current = root();
        for (String part : parts) {
            current = new File(current, part);
        }
        if (!current.isDirectory() && !current.mkdirs() && !current.isDirectory()) {
            throw new IllegalStateException("Could not create " + current);
        }
        return current;
    }

    public static File userDir(String userId, String child) {
        return dir("users", hash(userId), child);
    }

    public static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static void atomicWrite(File file, String content) throws IOException {
        atomicWrite(file, content.getBytes(StandardCharsets.UTF_8));
    }

    public static void atomicWrite(File file, byte[] content) throws IOException {
        File parent = file.getParentFile();
        if (parent != null && !parent.isDirectory() && !parent.mkdirs() && !parent.isDirectory()) {
            throw new IOException("Could not create " + parent);
        }
        Path temp = Files.createTempFile(parent.toPath(), file.getName(), ".tmp");
        try {
            Files.write(temp, content);
            try {
                Files.move(temp, file.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (java.nio.file.AtomicMoveNotSupportedException e) {
                Files.move(temp, file.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    public static String read(File file) throws IOException {
        return Files.readString(file.toPath(), StandardCharsets.UTF_8);
    }

    public static boolean isSafeId(String value) {
        return value != null
                && value.toLowerCase(Locale.ROOT).matches("[0-9a-f-]{8,64}")
                && !value.contains("..");
    }
}
