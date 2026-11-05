package io.jenkins.plugins.copilot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import hudson.model.User;
import io.jenkins.plugins.copilot.ops.OperationException;
import io.jenkins.plugins.copilot.ops.Operations;
import io.jenkins.plugins.copilot.storage.SkillStore;
import io.jenkins.plugins.copilot.tools.ToolCatalog;
import io.jenkins.plugins.copilot.util.Json;
import java.util.List;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition;
import org.jenkinsci.plugins.workflow.job.WorkflowJob;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.jvnet.hudson.test.JenkinsRule;

public class SkillsOperationsTest {

    @Rule
    public JenkinsRule jenkins = new JenkinsRule();

    @Before
    public void configure() {
        User.getById("admin", true);
    }

    @Test
    public void skillsCanBeCreatedLoadedUpdatedEnabledAndDeleted() throws Exception {
        JSONObject created = handle("create_skill", Json.obj(
                "name", "Create a declarative pipeline",
                "kind", "pipeline-create",
                "description", "Reusable Jenkinsfile skeleton",
                "whenToUse", "When a user asks for a new pipeline",
                "body", "## Procedure\\n1. Inspect the repository.\\n2. Validate the Jenkinsfile.",
                "tags", Json.arr(List.of("pipeline", "declarative")),
                "sourceJobs", Json.arr(List.of("team/app/main"))));
        assertTrue(created.getBoolean("created"));
        String slug = created.getJSONObject("skill").getString("slug");
        assertNotNull(slug);

        JSONObject found = handle("get_skill", Json.obj("skill", slug));
        assertTrue(found.getJSONObject("skill").getString("body").contains("Inspect"));

        JSONObject updated = handle("update_skill", Json.obj(
                "skill", slug,
                "description", "Updated description",
                "body", "## Updated\\nUse the reusable template."));
        assertEquals(2, updated.getJSONObject("skill").getInt("version"));

        JSONObject disabled = handle("set_skill_enabled", Json.obj("skill", slug, "enabled", false));
        assertFalse(disabled.getJSONObject("skill").getBoolean("enabled"));
        assertFalse(new SkillStore().catalogText(20).contains(slug));

        handle("delete_skill", Json.obj("skill", slug, "confirm", true));
        assertEquals(0, handle("list_skills", Json.obj()).getJSONArray("skills").size());
    }

    @Test
    public void skillWritesValidateInput() throws Exception {
        try {
            handle("create_skill", Json.obj("name", "No body"));
            fail("body should be required");
        } catch (OperationException e) {
            assertEquals(400, e.getStatus());
        }
        handle("create_skill", Json.obj("name", "One", "body", "Body"));
        try {
            handle("create_skill", Json.obj("name", "One", "body", "Another"));
            fail("duplicate name should fail");
        } catch (OperationException e) {
            assertEquals(400, e.getStatus());
        }
        try {
            handle("delete_skill", Json.obj("skill", "one"));
            fail("confirm should be required");
        } catch (OperationException e) {
            assertEquals(400, e.getStatus());
        }
    }

    @Test
    public void scanPipelinesReturnsCompactStructuralEvidence() throws Exception {
        WorkflowJob job = jenkins.jenkins.createProject(WorkflowJob.class, "demo");
        job.setDefinition(new CpsFlowDefinition(
                "pipeline {\n"
                        + "  agent { label 'linux' }\n"
                        + "  environment { REGISTRY = 'registry.example' }\n"
                        + "  stages {\n"
                        + "    stage('Build') { steps { sh 'make' } }\n"
                        + "    stage('Docker') { steps { docker.build('app') } }\n"
                        + "    stage('Deploy') { steps { sh 'deploy.sh' } }\n"
                        + "  }\n"
                        + "  post { always { archiveArtifacts artifacts: '**/*' } }\n"
                        + "}",
                true));
        job.save();

        JSONObject result = handle("scan_pipelines", Json.obj("jobs", Json.arr(List.of("demo"))));
        assertEquals(1, result.getInt("scanned"));
        JSONObject pipeline = result.getJSONArray("pipelines").getJSONObject(0);
        assertEquals("inline", pipeline.getString("kind"));
        assertTrue(pipeline.getJSONArray("stages").toString().contains("Docker"));
        assertTrue(pipeline.getJSONObject("uses").getBoolean("docker"));
        assertTrue(pipeline.getJSONArray("agentLabels").toString().contains("linux"));
        assertFalse(pipeline.has("script"));
        assertTrue(result.getJSONObject("patterns").toString().contains("Docker"));
    }

    @Test
    public void skillOperationsAreInTheAgentCatalog() throws Exception {
        assertNotNull(ToolCatalog.require("create_skill"));
        assertNotNull(ToolCatalog.require("get_skill"));
        assertNotNull(ToolCatalog.require("scan_pipelines"));
        assertTrue(ToolCatalog.require("create_skill").spec().getRisk() >= 3);
        assertTrue(ToolCatalog.require("scan_pipelines").spec().getRisk() == 1);
    }

    @Test
    public void nonAdminsCannotWriteSkills() throws Exception {
        jenkins.jenkins.setSecurityRealm(jenkins.createDummySecurityRealm());
        hudson.security.GlobalMatrixAuthorizationStrategy strategy =
                new hudson.security.GlobalMatrixAuthorizationStrategy();
        strategy.add(Jenkins.ADMINISTER, "admin");
        strategy.add(Jenkins.READ, "alice");
        strategy.add(hudson.model.Item.READ, "alice");
        jenkins.jenkins.setAuthorizationStrategy(strategy);
        User alice = User.getById("alice", true);
        try (hudson.security.ACLContext ignored = hudson.security.ACL.as2(alice.impersonate2())) {
            try {
                Operations.require("create_skill")
                        .handler()
                        .handle(Json.obj("name", "Alice skill", "body", "Body"), alice);
                fail("alice should not create skills");
            } catch (OperationException e) {
                assertEquals(403, e.getStatus());
            }
        }
    }

    private JSONObject handle(String name, JSONObject args) throws Exception {
        return Operations.require(name)
                .handler()
                .handle(args, User.getById("admin", true));
    }
}
