package io.jenkins.plugins.copilot.ops;

import com.cloudbees.plugins.credentials.Credentials;
import com.cloudbees.plugins.credentials.CredentialsDescriptor;
import com.cloudbees.plugins.credentials.CredentialsNameProvider;
import com.cloudbees.plugins.credentials.CredentialsProvider;
import com.cloudbees.plugins.credentials.common.IdCredentials;
import com.cloudbees.plugins.credentials.SystemCredentialsProvider;
import hudson.model.User;
import io.jenkins.plugins.copilot.util.Json;
import java.util.LinkedHashMap;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/** Credential inventory: identifiers and metadata only, never values. */
public final class CredentialOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_credentials", this::listCredentials);
        return h;
    }

    private JSONObject listCredentials(JSONObject args, User user) {
        if (!Jenkins.get().hasPermission(CredentialsProvider.VIEW)) {
            throw new SecurityException("You do not have Credentials/View permission");
        }
        JSONArray out = new JSONArray();
        for (Credentials credentials : SystemCredentialsProvider.getInstance().getCredentials()) {
            CredentialsDescriptor descriptor = credentials.getDescriptor();
            out.add(Json.obj(
                    "id", credentials instanceof IdCredentials idCredentials ? idCredentials.getId() : null,
                    "description", CredentialsNameProvider.name(credentials),
                    "type", descriptor == null ? credentials.getClass().getSimpleName() : descriptor.getDisplayName(),
                    "scope", credentials.getScope() == null ? null : credentials.getScope().name()));
        }
        return Json.obj("credentials", out, "count", out.size(), "valuesExposed", false);
    }
}
