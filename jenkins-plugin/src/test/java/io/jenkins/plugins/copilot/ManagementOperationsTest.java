package io.jenkins.plugins.copilot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.cloudbees.hudson.plugins.folder.Folder;
import com.fasterxml.jackson.databind.JsonNode;
import hudson.model.FreeStyleProject;
import hudson.model.User;
import hudson.security.ACL;
import hudson.security.ACLContext;
import hudson.security.GlobalMatrixAuthorizationStrategy;
import hudson.security.HudsonPrivateSecurityRealm;
import io.jenkins.plugins.copilot.ops.OperationException;
import io.jenkins.plugins.copilot.ops.Operations;
import io.jenkins.plugins.copilot.tools.GitHubService;
import io.jenkins.plugins.copilot.tools.RecoveryService;
import io.jenkins.plugins.copilot.tools.ToolCatalog;
import io.jenkins.plugins.copilot.tools.ToolContext;
import io.jenkins.plugins.copilot.tools.ToolSpec;
import io.jenkins.plugins.copilot.storage.ChangePlanStore;
import io.jenkins.plugins.copilot.storage.ConversationStore;
import io.jenkins.plugins.copilot.storage.SkillStore;
import io.jenkins.plugins.copilot.util.Jackson;
import io.jenkins.plugins.copilot.util.Json;
import java.io.InputStream;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.util.List;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.jvnet.hudson.test.JenkinsRule;

public class ManagementOperationsTest {

    @Rule
    public JenkinsRule jenkins = new JenkinsRule();

    @Before
    public void configure() {
        User.getById("admin", true);
    }

    @Test
    public void createViewToolAcceptsTheAgentsExactArguments() throws Exception {
        jenkins.createFreeStyleProject("jenkins-copilot");
        User admin = User.getById("admin", true);
        ToolContext context = new ToolContext(
                admin,
                UUID.randomUUID().toString(),
                CopilotGlobalConfiguration.get(),
                new GitHubService("", "https://api.github.com"),
                new ChangePlanStore(),
                new RecoveryService(),
                new ConversationStore(),
                new SkillStore());
        JsonNode result = ToolCatalog.execute(
                "create_view",
                Jackson.parse("{\"name\":\"copilot\",\"type\":\"list\","
                        + "\"description\":\"Jenkins Copilot pipeline only\","
                        + "\"jobs\":[\"jenkins-copilot\"]}"),
                context);
        assertTrue(result.path("created").asBoolean());
        assertEquals(1, Jenkins.get().getView("copilot").getItems().size());
    }

    @Test
    public void jobsCanBeRenamed() throws Exception {
        jenkins.createFreeStyleProject("old-name");
        JSONObject renamed = handle("rename_job", Json.obj("job", "old-name", "newName", "new-name"));
        assertTrue(renamed.getBoolean("renamed"));
        assertNotNull(Jenkins.get().getItemByFullName("new-name"));
        assertNull(Jenkins.get().getItemByFullName("old-name"));

        Folder team = jenkins.jenkins.createProject(Folder.class, "team");
        handle("move_job", Json.obj("job", "new-name", "folder", "team"));
        assertNotNull(Jenkins.get().getItemByFullName("team/new-name"));
        assertNotNull(team);
    }

    @Test
    public void viewsCanBeCreatedPopulatedRenamedAndDeleted() throws Exception {
        jenkins.createFreeStyleProject("demo");
        jenkins.createFreeStyleProject("other");

        JSONObject created = handle("create_view", Json.obj(
                "name", "copilot",
                "type", "list",
                "description", "Copilot pipelines",
                "jobs", Json.arr(List.of("demo"))));
        assertTrue(created.getBoolean("created"));
        assertEquals(1, created.getJSONObject("view").getInt("jobCount"));

        JSONObject listed = handle("list_views", Json.obj());
        assertTrue(listed.getJSONArray("views").toString().contains("copilot"));

        JSONObject added = handle("add_jobs_to_view", Json.obj(
                "view", "copilot", "jobs", Json.arr(List.of("other"))));
        assertEquals(2, added.getJSONObject("result").getInt("jobCount"));

        JSONObject removed = handle("remove_jobs_from_view", Json.obj(
                "view", "copilot", "jobs", Json.arr(List.of("demo"))));
        assertEquals(1, removed.getJSONObject("result").getInt("jobCount"));

        handle("rename_view", Json.obj("view", "copilot", "newName", "copilot-renamed"));
        assertNotNull(Jenkins.get().getView("copilot-renamed"));

        handle("set_primary_view", Json.obj("view", "copilot-renamed"));
        assertEquals("copilot-renamed", Jenkins.get().getPrimaryView().getViewName());
        handle("set_primary_view", Json.obj("view", "all"));

        JSONObject deleted = handle("delete_view", Json.obj("view", "copilot-renamed", "confirm", true));
        assertTrue(deleted.getBoolean("deleted"));
        assertNotNull(deleted.getString("configBackup"));
        assertNull(Jenkins.get().getView("copilot-renamed"));
    }

    @Test
    public void listViewIncludeRegexMatchesJobs() throws Exception {
        jenkins.createFreeStyleProject("demo");
        jenkins.createFreeStyleProject("unrelated");
        handle("create_view", Json.obj(
                "name", "regex-view",
                "type", "list",
                "includeRegex", "^demo$"));
        assertEquals(1, Jenkins.get().getView("regex-view").getItems().size());
    }

    @Test
    public void viewsCanLiveInsideFolders() throws Exception {
        Folder team = jenkins.jenkins.createProject(Folder.class, "team");
        team.createProject(FreeStyleProject.class, "app");
        JSONObject created = handle("create_view", Json.obj(
                "name", "team-view",
                "folder", "team",
                "type", "list",
                "jobs", Json.arr(List.of("team/app"))));
        assertTrue(created.getBoolean("created"));
        assertEquals(1, team.getView("team-view").getItems().size());
        assertEquals("team", created.getJSONObject("view").getString("folder"));
    }

    @Test
    public void viewsRejectBadInput() throws Exception {
        jenkins.createFreeStyleProject("demo");
        handle("create_view", Json.obj("name", "copilot", "type", "list", "jobs", Json.arr(List.of("demo"))));
        try {
            handle("create_view", Json.obj("name", "copilot", "type", "list"));
            fail("duplicate view should fail");
        } catch (OperationException e) {
            assertEquals(409, e.getStatus());
        }
        try {
            handle("delete_view", Json.obj("view", "copilot"));
            fail("delete without confirm should fail");
        } catch (OperationException e) {
            assertEquals(400, e.getStatus());
        }
        try {
            handle("create_view", Json.obj("name", "bad-regex", "type", "list", "includeRegex", "["));
            fail("bad regex should fail");
        } catch (OperationException e) {
            assertEquals(400, e.getStatus());
        }
    }

    @Test
    public void foldersCanBeCreatedRenamedAndDeleted() throws Exception {
        handle("create_folder", Json.obj("name", "apps", "description", "Applications"));
        assertNotNull(Jenkins.get().getItemByFullName("apps"));
        handle("rename_folder", Json.obj("folder", "apps", "newName", "services"));
        assertNotNull(Jenkins.get().getItemByFullName("services"));
        handle("delete_folder", Json.obj("folder", "services", "confirm", true));
        assertNull(Jenkins.get().getItemByFullName("services"));
    }

    @Test
    public void credentialsAreWriteOnlyAndManageable() throws Exception {
        JSONObject created = handle("create_credential", Json.obj(
                "id", "demo-token",
                "type", "string",
                "description", "Demo token",
                "secret", "s3cr3t-value"));
        assertFalse(created.toString().contains("s3cr3t-value"));
        StringCredentialsImpl stored = (StringCredentialsImpl)
                com.cloudbees.plugins.credentials.SystemCredentialsProvider.getInstance().getCredentials().stream()
                        .filter(item -> item instanceof StringCredentialsImpl)
                        .findFirst()
                        .orElseThrow();
        assertEquals("s3cr3t-value", stored.getSecret().getPlainText());

        handle("update_credential", Json.obj(
                "id", "demo-token",
                "type", "username-password",
                "username", "deploy",
                "password", "new-password"));
        assertFalse(handle("list_credentials", Json.obj()).toString().contains("new-password"));

        handle("delete_credential", Json.obj("id", "demo-token", "confirm", true));
        assertTrue(handle("list_credentials", Json.obj()).getJSONArray("credentials").isEmpty());

        jenkins.jenkins.createProject(Folder.class, "cred-team");
        handle("create_credential", Json.obj(
                "id", "folder-token", "folder", "cred-team", "type", "string", "secret", "folder-secret"));
        assertTrue(handle("list_credentials", Json.obj("folder", "cred-team"))
                .toString().contains("folder-token"));
        handle("delete_credential", Json.obj("id", "folder-token", "folder", "cred-team", "confirm", true));
    }

    @Test
    public void permanentAgentsCanBeManaged() throws Exception {
        JSONObject created = handle("create_node", Json.obj(
                "name", "agent-1",
                "remoteFS", "/tmp/jenkins-agent",
                "labels", "linux docker",
                "executors", 2));
        assertTrue(created.getBoolean("created"));
        assertNotNull(Jenkins.get().getNode("agent-1"));

        JSONObject updated = handle("update_node", Json.obj(
                "node", "agent-1", "labels", "linux", "executors", 3));
        assertEquals(3, updated.getInt("executors"));
        assertEquals("linux", updated.getString("labels"));

        handle("delete_node", Json.obj("node", "agent-1", "confirm", true));
        assertNull(Jenkins.get().getNode("agent-1"));
    }

    @Test
    public void queuedBuildsCanBeCancelled() throws Exception {
        Jenkins.get().setNumExecutors(0);
        FreeStyleProject job = jenkins.createFreeStyleProject("queue-me");
        job.scheduleBuild2(0);
        var queued = Jenkins.get().getQueue().getItems();
        assertTrue(queued.length > 0);
        handle("cancel_queue_item", Json.obj("id", queued[0].getId()));
        assertEquals(0, Jenkins.get().getQueue().getItems().length);

        job.scheduleBuild2(0);
        handle("cancel_job_queue", Json.obj("job", "queue-me"));
        assertEquals(0, Jenkins.get().getQueue().getItems().length);
    }

    @Test
    public void controllerSettingsAndQuietModeCanBeChanged() throws Exception {
        handle("set_system_message", Json.obj("message", "Maintenance tonight"));
        assertEquals("Maintenance tonight", Jenkins.get().getSystemMessage());
        handle("set_num_executors", Json.obj("executors", 3));
        assertEquals(3, Jenkins.get().getNumExecutors());
        handle("set_controller_labels", Json.obj("labels", "linux controller"));
        assertTrue(Jenkins.get().getLabelString().contains("linux"));

        handle("quiet_down", Json.obj("reason", "test"));
        assertTrue(Jenkins.get().isQuietingDown());
        handle("cancel_quiet_down", Json.obj());
        assertFalse(Jenkins.get().isQuietingDown());
    }

    @Test
    public void privateRealmUsersCanBeManaged() throws Exception {
        jenkins.jenkins.setSecurityRealm(new HudsonPrivateSecurityRealm(false));
        handle("create_user", Json.obj("id", "bob", "password", "bob-password", "fullName", "Bob"));
        assertNotNull(User.getById("bob", false));
        assertTrue(handle("list_users", Json.obj()).toString().contains("bob"));
        handle("delete_user", Json.obj("id", "bob", "confirm", true));
        assertNull(User.getById("bob", false));
    }

    @Test
    public void viewCreationRequiresViewCreatePermission() throws Exception {
        jenkins.jenkins.setSecurityRealm(jenkins.createDummySecurityRealm());
        GlobalMatrixAuthorizationStrategy strategy = new GlobalMatrixAuthorizationStrategy();
        strategy.add(Jenkins.ADMINISTER, "admin");
        strategy.add(Jenkins.READ, "alice");
        strategy.add(hudson.model.Item.READ, "alice");
        jenkins.jenkins.setAuthorizationStrategy(strategy);
        User alice = User.getById("alice", true);
        try (ACLContext ignored = ACL.as2(alice.impersonate2())) {
            try {
                Operations.require("create_view")
                        .handler()
                        .handle(Json.obj("name", "alice-view", "type", "list"), alice);
                fail("alice should not be allowed to create a view");
            } catch (OperationException e) {
                assertEquals(403, e.getStatus());
            }
        }
    }

    @Test
    public void matrixPermissionsCanBeGrantedAndRevoked() throws Exception {
        jenkins.jenkins.setSecurityRealm(jenkins.createDummySecurityRealm());
        GlobalMatrixAuthorizationStrategy strategy = new GlobalMatrixAuthorizationStrategy();
        strategy.add(Jenkins.ADMINISTER, "admin");
        jenkins.jenkins.setAuthorizationStrategy(strategy);
        User.getById("alice", true);

        handle("grant_permission", Json.obj(
                "permission", "hudson.model.Item.Read",
                "sid", "alice",
                "type", "user"));
        assertTrue(handle("list_permissions", Json.obj()).toString().contains("alice"));

        handle("revoke_permission", Json.obj(
                "permission", "hudson.model.Item.Read",
                "sid", "alice",
                "type", "user"));
        assertFalse(handle("list_permissions", Json.obj()).toString().contains("alice"));
    }

    @Test
    public void everyToolOperationIsRegistered() throws Exception {
        try (InputStream in = getClass().getResourceAsStream(
                "/io/jenkins/plugins/copilot/tools/tools.json")) {
            JsonNode root = Jackson.MAPPER.readTree(in);
            int count = 0;
            for (JsonNode tool : root.path("tools")) {
                count++;
                String operation = tool.path("operation").asText("");
                if (!operation.isBlank()) {
                    assertNotNull(
                            "Missing operation handler for " + tool.path("name").asText(),
                            Operations.require(operation));
                }
            }
            assertTrue("expected a broad catalog", count >= 80);
        }
        ToolSpec deleteView = ToolCatalog.require("delete_view").spec();
        assertEquals(3, deleteView.getRisk());
        ToolSpec createView = ToolCatalog.require("create_view").spec();
        assertEquals(2, createView.getRisk());
    }

    private JSONObject handle(String name, JSONObject args) throws Exception {
        return Operations.require(name)
                .handler()
                .handle(args, User.getById("admin", true));
    }

    @SuppressWarnings("unused")
    private static String text(JSONObject value) {
        return new String(value.toString().getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }
}
