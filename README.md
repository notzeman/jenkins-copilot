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
- Manage views and dashboards: create List/All views, add/remove jobs, set regex filters, rename, delete, and set the primary view.
- Manage folders, permanent agents, queue items, system-scope and folder-scope credentials, users in the private realm, the Global Matrix permission matrix, plugins, and controller settings.
- Stream tool activity, approvals, diffs, and results in a persistent right-hand sidebar.

## Requirements

- Jenkins **2.580.2 or newer** (Java 21).
- Maven 3.9+ (the repository includes `mvnw`).
- Node.js 22+ only when changing the React UI. The built UI bundle is committed, so the Jenkins build does
  not need Node.

## Build the HPI

```bash
./scripts/build.sh
```

The script rebuilds the React UI (`npm ci`, `npm run build`) and then packages the HPI:

```bash
cd jenkins-plugin
JAVA_HOME=/path/to/jdk21 ./mvnw -B -ntp -DskipTests -Dspotbugs.skip=true package
```

The artifact is `jenkins-plugin/target/jenkins-ai-copilot.hpi`.

If you do not change the UI, Jenkins can build the committed bundle directly with `./mvnw package`; it does
not need Node.

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
3. With no provider configured, the drawer opens **Settings → Providers**.
4. Click **Add provider** and choose **OpenAI**, **Claude**, **opencode go**, or a custom
   OpenAI-compatible endpoint.
5. Paste the API key (and the base URL for opencode go / custom endpoints).
6. Click **Load models**, choose a default model, then **Save provider**.
7. Add the GitHub token under **Settings → GitHub** if you want repository tools.

Add more provider accounts at any time; each one keeps its own encrypted key and default model. The model
picker in the composer groups models by account and searches across all of them.

Keys are stored as Jenkins `Secret` values. They are sent only to the configured provider endpoint
(use HTTPS in production), never to the browser, logs, conversation files, or model context. Settings are
available later through the gear icon. The same legacy fields also remain on
**Manage Jenkins → System → Jenkins AI Copilot** and are imported into the account store on first use.

For **opencode go**, enter `https://opencode.ai/inference/go` (the plugin appends `/v1`). The documented
`https://opencode.ai/zen/go/v1` endpoint also works. The same field works for OpenRouter or a self-hosted
OpenAI-compatible gateway.

## Chat features

- **Streaming** responses and tool execution events.
- **Model switching** in the composer through a searchable, provider-grouped picker; model lists are fetched
  per provider account.
- **Thinking control**: Auto / Off / Low / Medium / High.
  - OpenAI and OpenAI-compatible: `reasoning_effort`.
  - Claude: `thinking` with a token budget.
- **Images**: file picker, drag/drop, or paste. PNG, JPEG, WebP; up to 4 per message; downscaled client-side
  and validated server-side.
- **Copy response** on every assistant message, including a copied confirmation.
- **Tool cards** with arguments and results.
- **Approval cards** for privileged operations, with risk, diff, validation, comment, approve, and reject.
- **Always-visible approval dock** above the composer, plus an admin-only shield toggle that bypasses approvals
  entirely. The bypass state is shown in red and every mode change is audited.
- **Session manager** grouped by pipeline, with rename, delete, search, and new-session actions. Deleting a
  session opens a confirmation modal first. Multibranch
  branch jobs are grouped under the parent multibranch project.
- **Broken-build CTA**: a failing or unstable latest build pulses the floating icon and offers
  **Quickly analyse**, which starts an investigation session with the console log and recent changes.
- **Thinking panel**: provider reasoning is shown separately in a muted, collapsible analysis block. Tool
  narration is rendered as plain text so partially streamed Markdown tables or code fences never appear as
  broken blocks.
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

The root `Jenkinsfile` builds and tests the plugin and archives
`jenkins-plugin/target/*.hpi` as a Jenkins build artifact. Configure a Jenkins JDK 21 tool; Node.js is not
required because the compiled UI is committed.

GitHub Releases are published by `.github/workflows/release.yml` when a `v*` tag is pushed:

1. Bump `<version>` in `jenkins-plugin/pom.xml`.
2. Add `docs/release-notes/v<version>.md`.
3. Commit, tag, and push:

   ```bash
   git tag v1.0.2
   git push origin v1.0.2
   ```

The workflow builds and tests with JDK 21, verifies that the tag matches `pom.xml`, attaches
`jenkins-ai-copilot.hpi` and its SHA-256 checksum to the GitHub Release, and uses the matching release-notes
file when present.

Listing in the public Jenkins update center is a separate submission to the Jenkins project.

## Known limitations

Read [docs/limitations.md](docs/limitations.md). The main ones: restart-from-stage is not an open-source
Jenkins feature; scripted pipelines get structural validation only; tools run sequentially; storage is
per-controller files; GitHub is the only provider API for repository tools.
