package io.jenkins.plugins.copilot.ops;

import hudson.model.User;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import net.sf.json.JSONObject;

/** A single, typed Jenkins operation exposed to the agent backend. */
public final class Operations {

    @FunctionalInterface
    public interface Handler {
        JSONObject handle(JSONObject args, User user) throws Exception;
    }

    public record Operation(String name, Handler handler) {}

    private static final Map<String, Operation> ALL = build();

    private Operations() {}

    public static Operation require(String name) {
        Operation op = ALL.get(name);
        if (op == null) {
            throw new IllegalArgumentException("unknown operation: " + name);
        }
        return op;
    }

    public static Set<String> names() {
        return ALL.keySet();
    }

    private static Map<String, Operation> build() {
        Map<String, Operation> ops = new LinkedHashMap<>();
        add(ops, new JobOperations());
        add(ops, new ViewOperations());
        add(ops, new SkillOperations());
        add(ops, new FolderOperations());
        add(ops, new QueueOperations());
        add(ops, new BuildOperations());
        add(ops, new NodeOperations());
        add(ops, new PipelineOperations());
        add(ops, new CredentialOperations());
        add(ops, new ScmOperations());
        add(ops, new UserOperations());
        add(ops, new PermissionOperations());
        add(ops, new SystemOperations());
        return Map.copyOf(ops);
    }

    private static void add(Map<String, Operation> ops, OperationGroup group) {
        group.handlers().forEach((name, handler) -> ops.put(name, new Operation(name, handler)));
    }
}
