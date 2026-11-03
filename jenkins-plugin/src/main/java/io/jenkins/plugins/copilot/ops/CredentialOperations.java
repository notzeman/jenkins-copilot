package io.jenkins.plugins.copilot.ops;

import com.cloudbees.plugins.credentials.Credentials;
import com.cloudbees.plugins.credentials.CredentialsDescriptor;
import com.cloudbees.plugins.credentials.CredentialsNameProvider;
import com.cloudbees.plugins.credentials.CredentialsProvider;
import com.cloudbees.plugins.credentials.CredentialsScope;
import com.cloudbees.plugins.credentials.SecretBytes;
import com.cloudbees.plugins.credentials.SystemCredentialsProvider;
import com.cloudbees.plugins.credentials.common.IdCredentials;
import com.cloudbees.plugins.credentials.domains.Domain;
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl;
import hudson.model.User;
import hudson.util.Secret;
import io.jenkins.plugins.copilot.util.Json;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.plaincredentials.impl.FileCredentialsImpl;
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl;

/** System-scope credential inventory and lifecycle. Values are write-only. */
public final class CredentialOperations implements OperationGroup {

    @Override
    public Map<String, Operations.Handler> handlers() {
        Map<String, Operations.Handler> h = new LinkedHashMap<>();
        h.put("list_credentials", this::listCredentials);
        h.put("create_credential", this::createCredential);
        h.put("update_credential", this::updateCredential);
        h.put("delete_credential", this::deleteCredential);
        return h;
    }

    private JSONObject listCredentials(JSONObject args, User user) throws Exception {
        check(CredentialsProvider.VIEW);
        String folder = Json.string(args, "folder", null);
        checkFolder(folder, hudson.model.Item.READ);
        JSONArray out = new JSONArray();
        for (Credentials credentials : store(folder).getCredentials(Domain.global())) {
            out.add(describe(credentials));
        }
        return Json.obj("credentials", out, "count", out.size(), "valuesExposed", false);
    }

    private JSONObject createCredential(JSONObject args, User user) throws Exception {
        check(CredentialsProvider.CREATE);
        String folder = Json.string(args, "folder", null);
        checkFolder(folder, hudson.model.Item.CONFIGURE);
        String id = credentialId(Json.requireString(args, "id"));
        if (find(folder, id) != null) {
            throw OperationException.conflict("A credential with id '" + id + "' already exists");
        }
        Credentials credentials = build(args, id);
        if (!store(folder).addCredentials(Domain.global(), credentials)) {
            throw OperationException.conflict("The credential store rejected the new credential");
        }
        store(folder).save();
        return Json.obj("created", true, "credential", describe(credentials));
    }

    private JSONObject updateCredential(JSONObject args, User user) throws Exception {
        check(CredentialsProvider.UPDATE);
        String folder = Json.string(args, "folder", null);
        checkFolder(folder, hudson.model.Item.CONFIGURE);
        String id = credentialId(Json.requireString(args, "id"));
        Credentials existing = find(folder, id);
        if (existing == null) {
            throw OperationException.notFound("No credential with id '" + id + "'");
        }
        Credentials replacement = build(args, id);
        if (!store(folder).updateCredentials(Domain.global(), existing, replacement)) {
            throw OperationException.conflict("The credential store rejected the update");
        }
        store(folder).save();
        return Json.obj("updated", true, "credential", describe(replacement));
    }

    private JSONObject deleteCredential(JSONObject args, User user) throws Exception {
        check(CredentialsProvider.DELETE);
        String folder = Json.string(args, "folder", null);
        checkFolder(folder, hudson.model.Item.CONFIGURE);
        String id = credentialId(Json.requireString(args, "id"));
        if (!Json.bool(args, "confirm", false)) {
            throw OperationException.invalid("confirm=true is required to delete a credential");
        }
        Credentials existing = find(folder, id);
        if (existing == null) {
            throw OperationException.notFound("No credential with id '" + id + "'");
        }
        if (!store(folder).removeCredentials(Domain.global(), existing)) {
            throw OperationException.conflict("The credential store rejected the delete");
        }
        store(folder).save();
        return Json.obj("deleted", true, "id", id);
    }

    private static Credentials build(JSONObject args, String id) throws Exception {
        String type = Json.string(args, "type", "string").toLowerCase();
        String description = Json.string(args, "description", "");
        CredentialsScope scope = Json.string(args, "scope", "GLOBAL").equalsIgnoreCase("SYSTEM")
                ? CredentialsScope.SYSTEM
                : CredentialsScope.GLOBAL;
        try {
            return switch (type) {
                case "string", "secret-text", "secret" -> new StringCredentialsImpl(
                        scope,
                        id,
                        description,
                        Secret.fromString(Json.requireString(args, "secret")));
                case "username-password", "username_password", "userpass" -> new UsernamePasswordCredentialsImpl(
                        scope,
                        id,
                        description,
                        Json.requireString(args, "username"),
                        Json.requireString(args, "password"));
                case "file", "secret-file" -> {
                    String fileName = Json.string(args, "fileName", "secret.txt");
                    String encoded = Json.requireString(args, "contentBase64");
                    byte[] bytes;
                    try {
                        bytes = Base64.getDecoder().decode(encoded);
                    } catch (IllegalArgumentException e) {
                        throw OperationException.invalid("contentBase64 is not valid base64");
                    }
                    yield new FileCredentialsImpl(
                            scope, id, description, fileName, SecretBytes.fromBytes(bytes));
                }
                default -> throw OperationException.invalid(
                        "type must be 'string', 'username-password', or 'file'");
            };
        } catch (hudson.model.Descriptor.FormException e) {
            throw OperationException.invalid("Invalid credential: " + e.getMessage());
        }
    }

    private static JSONObject describe(Credentials credentials) {
        CredentialsDescriptor descriptor = credentials.getDescriptor();
        return Json.obj(
                "id", credentials instanceof IdCredentials idCredentials ? idCredentials.getId() : null,
                "description", CredentialsNameProvider.name(credentials),
                "type", descriptor == null ? credentials.getClass().getSimpleName() : descriptor.getDisplayName(),
                "scope", credentials.getScope() == null ? null : credentials.getScope().name());
    }

    private static Credentials find(String folder, String id) throws OperationException {
        for (Credentials credentials : store(folder).getCredentials(Domain.global())) {
            if (credentials instanceof IdCredentials candidate && id.equals(candidate.getId())) {
                return credentials;
            }
        }
        return null;
    }

    private static String credentialId(String value) throws OperationException {
        String id = value == null ? "" : value.trim();
        if (!id.matches("[A-Za-z0-9._-]{1,128}")) {
            throw OperationException.invalid(
                    "Credential id must be 1-128 characters using letters, digits, '.', '_' or '-'");
        }
        return id;
    }

    private static void checkFolder(String folder, hudson.security.Permission permission) throws OperationException {
        if (folder == null || folder.isBlank()) {
            return;
        }
        hudson.model.Item item = Jenkins.get().getItemByFullName(folder);
        if (item == null) {
            throw OperationException.notFound("No folder named '" + folder + "'");
        }
        if (!item.hasPermission(permission)) {
            throw OperationException.forbidden("You do not have " + permission.getId() + " for " + folder);
        }
    }

    private static void check(hudson.security.Permission permission) throws OperationException {
        if (!Jenkins.get().hasPermission(permission)) {
            throw OperationException.forbidden("You do not have " + permission.getId());
        }
    }

    private static SystemCredentialsProvider getProvider() {
        return SystemCredentialsProvider.getInstance();
    }

    private static com.cloudbees.plugins.credentials.CredentialsStore store(String folder) throws OperationException {
        hudson.model.ModelObject context = Jenkins.get();
        if (folder != null && !folder.isBlank()) {
            hudson.model.Item item = Jenkins.get().getItemByFullName(folder);
            if (item == null) {
                throw OperationException.notFound("No folder named '" + folder + "'");
            }
            context = item;
        }
        for (com.cloudbees.plugins.credentials.CredentialsStore store
                : CredentialsProvider.lookupStores(context)) {
            if (store.getContext() == context) {
                return store;
            }
        }
        throw new IllegalStateException("No credential store is available for " + context);
    }


}
