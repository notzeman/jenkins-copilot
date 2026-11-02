# Architecture

## Single HPI

Everything runs inside Jenkins:

- **`CopilotPageDecorator`** injects a mount element and the React module into every page.
- **`CopilotRootAction`** serves the same-origin API: setup, model listing, chat SSE, approvals,
  conversations, and attachments.
- **`AgentLoop`** is a small tool-calling loop. No LangGraph, CrewAI, Mastra, or workflow engine.
- **Provider adapters** speak OpenAI Chat Completions and Anthropic Messages directly over HTTPS.
- **`ToolCatalog`** maps JSON tool schemas to the existing typed Jenkins operations and a few Java services.

There is no backend service, database, queue, or worker container.

## Request flow

```
browser (Jenkins page)
   │  POST /jenkins-ai-copilot/chat  (session + CSRF crumb)
   ▼
CopilotRootAction
   │  load conversation, resolve provider/model/thinking
   ▼
AgentLoop
   │  messages + tool schemas
   ▼
Provider (OpenAI / Claude / opencode go)
   │  streaming text, tool calls
   ▼
ToolCatalog ──► Operations (jobs, builds, nodes, pipelines, credentials)
   │        └─► GitHubService, RecoveryService, ChangePlanStore
   ▼
SSE: message.delta, tool.start, tool.result, approval.required, done
```

## Agent loop

For each step:

1. Send the full message list plus tool schemas to the provider.
2. Stream text deltas to the browser.
3. Collect complete tool calls.
4. Validate arguments against the JSON schema.
5. Classify risk:
   - level 1 executes immediately;
   - level 2 executes only if `autoApproveLevel2` is on and the target is not production;
   - level 3 always pauses.
6. Execute approved tools in-process under the current user's ACL.
7. Append tool results and repeat.

Stops at: no tool calls, maximum steps, abort, or an approval pause.

### Approvals

A paused run is stored in `runs/<conversationId>.json` with the message list and approval records. A decision
updates the record and resumes the exact stored tool calls. Rejected calls receive a denial tool result and
are never executed. Approvals expire after 30 minutes.

### Conversation persistence

Messages are stored as provider-neutral `ChatMessage` objects:

- user text plus image references;
- assistant text plus tool calls;
- tool results keyed by tool call id.

On reload, the UI reconstructs tool cards from assistant tool calls and matching tool results.

## Providers

| Provider | API | Thinking |
|---|---|---|
| OpenAI | Chat Completions (`/v1/chat/completions`) | `reasoning_effort` |
| Claude | Messages (`/v1/messages`) | `thinking.budget_tokens` |
| opencode go | OpenAI-compatible base URL | `reasoning_effort` (best effort) |

Tool calls are always executed sequentially. The model never receives tool results from a later step before
earlier calls are resolved.

## Tool catalog

The catalog is a resource file (`tools.json`) with JSON Schema, description, and risk level for every tool.
Jenkins tools map to `Operations`; custom executors cover:

- pipeline proposal, apply, and analysis;
- failure diagnosis and last-known-good lookup;
- rollback proposal, execution, and health;
- GitHub repository, file, commit, comparison, branch, patch, and pull request operations.

## Storage

```
$JENKINS_HOME/jenkins-ai-copilot/
  users/<sha256(userId)>/conversations/
  users/<sha256(userId)>/runs/
  users/<sha256(userId)>/attachments/
  change-plans/
  recovery/
  audit/
```

JSON files with atomic temp-file moves. Per-conversation locks prevent concurrent runs. User ids are hashed
for directory names; conversation and attachment ids are validated UUIDs.

## SSE events

`conversation`, `message.delta`, `message.reasoning`, `message.completed`, `tool.start`, `tool.result`,
`tool.error`, `approval.required`, `error`, `done`.

The browser communicates only with the Jenkins origin. Provider keys never appear in SSE or JSON responses.
