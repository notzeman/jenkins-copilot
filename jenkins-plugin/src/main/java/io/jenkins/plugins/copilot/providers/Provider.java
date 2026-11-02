package io.jenkins.plugins.copilot.providers;

import io.jenkins.plugins.copilot.tools.ToolSpec;
import java.util.List;

public interface Provider {
    String id();

    List<ModelInfo> listModels(ProviderConfig config) throws Exception;

    ProviderResult stream(
            ProviderConfig config,
            String model,
            List<ChatMessage> messages,
            List<ToolSpec> tools,
            ThinkingLevel thinking,
            java.time.Duration timeout,
            AttachmentLoader attachments,
            ProviderStreamSink sink,
            AbortSignal abort)
            throws Exception;
}
