# Verification

## Automated tests

```
jenkins-plugin:
  CopilotUnitTest       6 tests   log analysis, redaction, Jenkinsfile validation, tool catalog,
                                  JSON-schema validation, unified diff
  CopilotPluginTest     7 tests   sidebar mount, session/setup state, secret non-leakage, admin-only setup,
                                  chat setup guard, conversation ownership, approval pause/rejection,
                                  read-only tool execution
  injected test         6 tests   1 skipped by the harness
```

Commands:

```bash
cd jenkins-plugin
JAVA_HOME=/path/to/jdk21 ./mvnw test

cd src/main/frontend
npm ci && npm run build && npx tsc --noEmit

cd ../../../e2e
npm ci && npx playwright test
```

Result: **19 plugin tests pass**, frontend typecheck passes, **2 Playwright tests pass**.

## Live verification performed

The plugin was installed into a real Jenkins 2.580.2 container and exercised in Chromium.

- The floating button mounts on every page inside a shadow root.
- The setup card lists **OpenAI**, **Claude**, and **opencode go**.
- Setup with an invalid OpenAI key returns the provider's validation error (HTTP 400) and does not save.
- Setup with a local OpenAI-compatible mock server (`opencode go` base URL) succeeds, loads `mock-model`, and
  makes `setupRequired=false`.
- A real chat request streamed:
  - `conversation`
  - `tool.start` / `tool.result` for `list_jobs` (executed against real Jenkins)
  - `message.delta` / `message.completed`
  - `done`
- A `delete_job` tool call paused with `approval.required`, risk 3, target `demo`.
- Rejecting the approval left the job in place and continued the conversation with a denial result.
- Approving a different approval executed `delete_job`; the job returned 404 afterwards.
- Conversation history persisted; reloading the drawer restored the user message, assistant response, tool
  cards, and attachment thumbnail.
- Image upload (1×1 PNG) was accepted, stored, and served back to the owner; the thumbnail survived a
  conversation reload.
- The audit log recorded setup, approval decisions, and tool execution results.

## Not verified

- **A paid provider key.** The wire protocol and tool loop were verified with a local OpenAI-compatible mock
  server, not with a live OpenAI/Anthropic account.
- **A live Anthropic request.** The adapter is implemented and typechecked; only OpenAI-compatible streaming
  was exercised end to end.
- **GitHub write operations.** No token or disposable repository was available. Read-only parsing and error
  handling exist; branch/PR creation was not exercised.
- **Rollback execution.** No deployment target/webhook was configured.

## Reproduce the live check

```bash
# 1. build and run Jenkins with the plugin
./scripts/dev.sh

# 2. or install the HPI into an existing Jenkins
#    Manage Jenkins -> Plugins -> Advanced settings -> Deploy plugin

# 3. click the floating button, configure a provider, chat
```

For a no-key functional check, run any OpenAI-compatible mock server and configure it as **opencode go**
with its base URL. The mock must implement:

- `GET /v1/models`
- `POST /v1/chat/completions` with SSE `data: {...}` chunks and `data: [DONE]`
