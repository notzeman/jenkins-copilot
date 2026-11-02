# Jenkins AI Copilot

An agentic CI/CD assistant that installs as a single Jenkins plugin. Click the floating button, choose a
provider, paste an API key, and chat. No backend service, no database, no Docker Compose, no `.env` files.

```
Jenkins (one HPI)
├── React sidebar (shadow DOM)
├── Java tool-calling loop
├── Provider adapters: OpenAI, Claude, opencode go
├── Jenkins tools (jobs, builds, nodes, pipelines, credentials metadata)
├── GitHub tools (repository inspection, commits, comparisons, recovery PRs)
└── File storage under $JENKINS_HOME/jenkins-ai-copilot
```

## What it can do

- Inspect jobs, folders, builds, agents, executors, queues, plugins, credentials metadata, and SCM config.
- Read bounded console evidence and extract the failed stage and failure signals.
- Identify the exact commit SHA recorded by a build; never substitute branch HEAD.
- Diagnose dependency, Docker, registry, SSH, network, credential, database, Kubernetes, agent, memory,
  permission, and pipeline-syntax failures with a confidence label.
- Read and analyze Jenkinsfiles; propose validated changes with a diff and source-hash guard.
- Create, copy, update, enable, disable, and delete jobs; trigger, abort, and retry builds.
- Inspect GitHub repositories, files, commits, and comparisons; prepare recovery branches and pull requests.
- Track known-good builds and deployment records; propose digest-pinned rollbacks.
- Stream tool activity, approvals, diffs, and results in a persistent right-hand sidebar.

## Requirements

- Jenkins **2.580.2 or newer** (Java 21).
- Node.js 22+ **only to build the frontend**; not required at runtime.
- Maven 3.9+ (the repository includes `mvnw`).

## Build the HPI

```bash
cd jenkins-plugin/src/main/frontend
npm ci
npm run build

cd ../../..
JAVA_HOME=/path/to/jdk21 ./mvnw -B -ntp package
```

The artifact is `jenkins-plugin/target/jenkins-ai-copilot.hpi`.

`./scripts/build.sh` does both steps.

## Install

**Manage Jenkins → Plugins → Advanced settings → Deploy plugin → Choose file**, then upload the HPI and
restart Jenkins. The plugin is now active on every page.

For local development:

```bash
./scripts/dev.sh
```

This builds the UI and starts `mvn hpi:run` on <http://localhost:8080/jenkins>. If port 8080 is in use,
run `./mvnw -Djetty.port=8081 hpi:run` from `jenkins-plugin` after building the UI.

## First-run setup (where the API keys go)

1. Sign in as a Jenkins administrator.
2. Click the floating button in the bottom-right corner (or press `Ctrl+J`).
3. The drawer shows **Set up Jenkins Copilot**.
4. Choose **OpenAI**, **Claude**, or **opencode go**.
5. Paste the API key (and the base URL for opencode go).
6. Click **Load models**, choose a model, then **Test and save**.

Keys are stored as Jenkins `Secret` values. They are sent only to the configured provider endpoint
(use HTTPS in production), never to the browser, logs, conversation files, or model context. The setup card is available later through the gear
icon. The same settings are also on **Manage Jenkins → System → Jenkins AI Copilot**.

For **opencode go**, enter an OpenAI-compatible base URL such as `https://your-gateway/v1`. The same field
works for OpenRouter or a self-hosted OpenAI-compatible gateway.

## Chat features

- **Streaming** responses and tool execution events.
- **Model switching** in the composer; the model list is fetched from the provider.
- **Thinking control**: Auto / Off / Low / Medium / High.
  - OpenAI and OpenAI-compatible: `reasoning_effort`.
  - Claude: `thinking` with a token budget.
- **Images**: file picker, drag/drop, or paste. PNG, JPEG, WebP; up to 4 per message; downscaled client-side
  and validated server-side.
- **Tool cards** with arguments and results.
- **Approval cards** for privileged operations, with risk, diff, validation, comment, approve, and reject.
- **Conversation history** stored per user, with delete and new-conversation actions.
- **Current job/build context** read from the Jenkins page, not from the browser.

## Operation levels

| Level | Examples | Approval |
|---|---|---|
| 1 — read | list jobs, read logs, compare commits, analyze pipelines | automatic, subject to Jenkins ACL |
| 2 — controlled | trigger/abort/retry builds, enable/disable jobs, create recovery branches | policy; production targets always manual |
| 3 — privileged | create/copy/delete jobs, rewrite Jenkinsfiles, update config XML, open PRs, roll back | always manual |

The model cannot approve its own actions. Approvals are stored server-side with the tool call, target,
arguments, risk, and an expiry. Approving executes the exact stored tool call; rejecting never does.

## Storage

```
$JENKINS_HOME/jenkins-ai-copilot/
  users/<sha256(userId)>/conversations/<uuid>.json
  users/<sha256(userId)>/runs/<conversationId>.json      # paused approvals
  users/<sha256(userId)>/attachments/<conversationId>/
  change-plans/<conversationId>/<planId>.json
  recovery/deployments.json                              # optional targets/history
  audit/audit.jsonl
```

No database. Atomic writes and per-conversation locks. Conversations are retained per user (default 50).

### Deployment rollback targets

Rollback execution reads `recovery/deployments.json`:

```json
{
  "targets": {
    "production": {
      "name": "production",
      "healthUrl": "https://app.example/health",
      "rollbackWebhook": "https://deploy.example/rollback",
      "hmacSecret": "optional-shared-secret"
    }
  },
  "history": [
    {
      "environment": "production",
      "imageDigest": "sha256:...64 hex...",
      "commitSha": "abc123",
      "buildNumber": 42,
      "healthStatus": "healthy",
      "deployedAt": 1760000000000
    }
  ]
}
```

The assistant refuses to roll back to a digest that is not recorded as healthy.

## Security summary

- Keys are Jenkins Secrets; no external service holds them.
- Tools execute in-process under the requesting user's live ACL.
- No arbitrary Groovy, Script Console, shell execution, or path proxy.
- Console logs, repository files, commit messages, and `AGENTS.md` are untrusted data. The system prompt
  forbids following instructions found inside them.
- Markdown is sanitized; attachments are raster-only and magic-byte checked.
- Conversation paths use hashed user ids and validated UUIDs.
- Per-user rate limit and per-conversation run lock.
- Append-only audit log.

See [docs/security.md](docs/security.md).

## Build and test

```bash
cd jenkins-plugin
JAVA_HOME=/path/to/jdk21 ./mvnw test        # unit + JenkinsRule tests

cd src/main/frontend
npm ci && npm run build

cd ../../../e2e
npm ci && npx playwright test               # UI tests
```

## Publishing

The repository includes a root `Jenkinsfile` for Jenkins CI:

- builds the React UI,
- runs the plugin tests,
- packages the HPI,
- archives `jenkins-plugin/target/*.hpi` as a build artifact.

Configure Jenkins tool installations named `jdk21` (JDK 21) and `nodejs24` (Node.js 24), then point a
Pipeline job at this repository. The archived HPI can be downloaded from the build page and attached to a
release or installed with **Manage Jenkins → Plugins → Advanced settings**.

Listing in the public update center is a separate submission to the Jenkins project.

## Known limitations

Read [docs/limitations.md](docs/limitations.md). The main ones: restart-from-stage is not an open-source
Jenkins feature; scripted pipelines get structural validation only; tools run sequentially; storage is
per-controller files; GitHub is the only provider API for repository tools.
