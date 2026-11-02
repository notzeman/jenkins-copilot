package io.jenkins.plugins.copilot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jenkins.plugins.copilot.storage.UnifiedDiff;
import io.jenkins.plugins.copilot.tools.SchemaValidator;
import io.jenkins.plugins.copilot.tools.ToolCatalog;
import io.jenkins.plugins.copilot.tools.ToolSpec;
import io.jenkins.plugins.copilot.util.Jackson;
import io.jenkins.plugins.copilot.util.JenkinsfileValidator;
import io.jenkins.plugins.copilot.util.LogAnalyzer;
import io.jenkins.plugins.copilot.util.Redactor;
import java.util.List;
import net.sf.json.JSONObject;
import org.junit.Test;

public class CopilotUnitTest {

    @Test
    public void logAnalyzerFindsStageAndSignal() {
        String log = String.join("\n",
                "[Pipeline] stage",
                "[Pipeline] { (Checkout)",
                "Cloning repository",
                "[Pipeline] }",
                "[Pipeline] // stage",
                "[Pipeline] stage",
                "[Pipeline] { (Docker Build)",
                "docker build -t app .",
                "failed to solve: base image not found",
                "[Pipeline] }",
                "[Pipeline] // stage",
                "Finished: FAILURE");
        JSONObject analysis = LogAnalyzer.analyze(log);
        assertEquals("Docker Build", analysis.getString("failedStage"));
        assertTrue(analysis.getJSONArray("signals").toString().contains("docker"));
        assertTrue(analysis.getString("window").contains("failed to solve"));
    }

    @Test
    public void redactorRemovesSecretsButKeepsCredentialIds() {
        JSONObject input = new JSONObject()
                .element("credentialsId", "ghcr-creds")
                .element("password", "hunter2")
                .element("nested", new JSONObject().element("token", "abc"));
        JSONObject output = Redactor.redact(input);
        assertEquals("ghcr-creds", output.getString("credentialsId"));
        assertEquals("[redacted]", output.getString("password"));
        assertEquals("[redacted]", output.getJSONObject("nested").getString("token"));
    }

    @Test
    public void validatorDetectsUnbalancedJenkinsfile() {
        JSONObject result = JenkinsfileValidator.validate("pipeline { agent any stages { stage('x') { steps { echo 'x' } } }");
        assertNotEquals(true, result.optBoolean("validated", true));
        assertTrue(result.getJSONArray("errors").size() > 0);
    }

    @Test
    public void toolCatalogCoversReadAndPrivilegedOperations() throws Exception {
        List<ToolSpec> specs = ToolCatalog.specs();
        assertTrue("expected a substantial catalog", specs.size() >= 35);
        ToolSpec delete = ToolCatalog.require("delete_job").spec();
        assertEquals(3, delete.getRisk());
        ToolSpec list = ToolCatalog.require("list_jobs").spec();
        assertEquals(1, list.getRisk());
        assertTrue(delete.getDescription().toLowerCase().contains("delete"));
    }

    @Test
    public void schemaValidatorRejectsMissingAndWrongTypes() {
        ObjectNode properties = Jackson.obj();
        properties.set("job", Jackson.obj().put("type", "string"));
        properties.set("number", Jackson.obj().put("type", "integer"));
        ObjectNode schema = Jackson.obj();
        schema.put("type", "object");
        schema.set("properties", properties);
        schema.set("required", Jackson.arr().add("job"));
        List<String> missing = SchemaValidator.validate(schema, Jackson.obj());
        assertTrue(missing.toString().contains("job is required"));
        List<String> wrong = SchemaValidator.validate(
                schema, Jackson.obj().put("job", "x").put("number", "not-a-number"));
        assertTrue(wrong.toString().contains("number must be integer"));
    }

    @Test
    public void unifiedDiffShowsAdditionsAndRemovals() {
        String diff = UnifiedDiff.diff("Jenkinsfile", "a\nb\nc", "a\nB\nc");
        assertTrue(diff.contains("-b"));
        assertTrue(diff.contains("+B"));
        assertTrue(diff.contains("@@"));
    }
}
