package io.jenkins.plugins.copilot.ops;

import java.util.Map;

/** Groups a related set of Jenkins operations. */
public interface OperationGroup {
    Map<String, Operations.Handler> handlers();
}
