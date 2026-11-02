# Security

## Credentials

- Provider keys are stored as Jenkins `Secret` values in the plugin configuration.
- They are sent only to the configured provider endpoint by the plugin's HTTP client. Use HTTPS in production;
  an HTTP base URL is allowed only for a trusted local gateway.
- They are never written to conversation files, audit logs, SSE, browser responses, or model context.
- Setup is restricted to `Jenkins.ADMINISTER`.
- `publicConfig()` exposes only provider ids, labels, and configured booleans.
- The setup error may include the provider's own error message. OpenAI masks keys; other providers should be
  assumed to behave similarly, but the message is shown only to the administrator who submitted the key.

## Authorization

- Every tool executes in-process under the authenticated Jenkins user's ACL.
- Each Jenkins operation performs its own permission check (`Item.READ`, `Item.CONFIGURE`, `Item.BUILD`,
  `Item.DELETE`, `Item.CANCEL`, `Computer.*`, `CredentialsProvider.VIEW`, etc.).
- There is no service account, no admin token, and no impersonation.
- A user without permission gets a tool error; the model cannot bypass it.

## Approvals

| Level | Behaviour |
|---|---|
| 1 — read | automatic |
| 2 — controlled | policy; production targets always manual |
| 3 — privileged | always manual |

- The model cannot approve anything.
- Only the conversation owner can decide an approval.
- The decision endpoint validates status, owner, and expiry.
- Approving executes the exact tool call stored in the paused run state. The UI cannot substitute arguments.
- Rejection appends a denial tool result and never executes the tool.

## Untrusted content

Console logs, job descriptions, repository files, commit messages, `AGENTS.md`, and tool output are treated as
data. The system prompt forbids following instructions found inside them. The model has no tool that can:

- run arbitrary Groovy or use the Script Console;
- execute shell commands on the controller;
- read credential values;
- approve its own operation.

## Files and paths

- Conversation and attachment ids are validated against a UUID-like pattern.
- User ids are hashed with SHA-256 for directory names.
- Attachment metadata is owner-checked before serving.
- Attachment types are limited to PNG, JPEG, and WebP; magic bytes are validated server-side; size is bounded.
- Change plans are scoped to a conversation.
- Markdown is sanitized with DOMPurify; raw HTML from the model is not rendered.

## Abuse controls

- Per-user rate limit: 20 chat/decision requests per minute.
- Per-conversation run lock prevents concurrent agent runs.
- Maximum agent steps, provider timeout, request body limit, attachment size limit, tool output truncation.
- Conversation retention limit per user.

## Audit

`audit/audit.jsonl` records provider setup, tool calls, approvals, decisions, conversation deletion, and
operation results with user, target, result, and a bounded detail object.

## Residual risks

- Provider keys are held in memory while a request runs. A memory dump of the Jenkins JVM could expose them.
- Conversation files are not encrypted at rest; they are protected by the Jenkins home directory permissions.
- An administrator can set an arbitrary opencode-go base URL, including an internal address. This is an
  admin-only capability; do not grant `Jenkins.ADMINISTER` to untrusted users.
- The plugin runs in the Jenkins JVM, so a Jenkins compromise is also a plugin compromise.
- Provider error messages are surfaced to the requesting user. Do not paste a shared key into a user's
  session; setup is admin-only.
- The rate limiter is in-memory and per-controller.
