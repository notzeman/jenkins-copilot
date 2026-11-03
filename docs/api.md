# HTTP API

All routes are served by the plugin under `/jenkins-ai-copilot/`. Browser POSTs require the Jenkins CSRF
crumb, which the sidebar reads from the page's `<head data-crumb-header data-crumb-value>`.

## Session

`GET /jenkins-ai-copilot/session`

```json
{
  "authenticated": true,
  "user": "admin",
  "isAdmin": true,
  "context": {"jenkinsUrl": "http://jenkins/"},
  "config": {
    "enabled": true,
    "setupRequired": false,
    "defaultProvider": "openai",
    "defaultModel": "gpt-5.1",
    "maxSteps": 20,
    "maxAttachmentMb": 5,
    "autoApproveLevel2": false,
    "githubConfigured": true,
    "providers": [
      {"id": "openai", "label": "OpenAI", "configured": true},
      {"id": "anthropic", "label": "Claude", "configured": false},
      {"id": "opencode-go", "label": "opencode go", "configured": false, "baseUrl": ""}
    ]
  }
}
```

## Provider setup (administrator)

`POST /jenkins-ai-copilot/setup`

```json
{
  "provider": "opencode-go",
  "apiKey": "...",
  "baseUrl": "https://opencode.ai/inference/go",
  "model": "your-model"
}
```

The plugin calls the provider's model list with the supplied key before saving. The key is stored as a
Jenkins Secret and is never returned.

Response: `{ "ok": true, "provider": "...", "defaultModel": "...", "models": [...] }`

## Models

`POST /jenkins-ai-copilot/models`

```json
{"provider": "openai"}
```

Any authenticated user may list models for a configured provider. Passing `apiKey` (and optional `baseUrl`)
is administrator-only and is used by the setup card before saving.

Response: `{ "provider": "openai", "models": [{"id": "gpt-5.1", "label": "gpt-5.1"}] }`

## Chat

`POST /jenkins-ai-copilot/chat` returns `text/event-stream`.

```json
{
  "conversationId": "uuid (optional)",
  "message": "Why did build #152 fail?",
  "provider": "openai",
  "model": "gpt-5.1",
  "thinking": "MEDIUM",
  "context": {"jobFullName": "team/app", "buildNumber": 42},
  "attachments": [
    {"mediaType": "image/png", "fileName": "shot.png", "dataBase64": "..."}
  ]
}
```

`thinking`: `AUTO`, `OFF`, `LOW`, `MEDIUM`, `HIGH`. `context` is the server-rendered page context
(job/build) supplied by the drawer; the model treats it as a hint and verifies live state with tools.

### SSE events

| Event | Data |
|---|---|
| `conversation` | `{id, title}` |
| `message.delta` | `{text}` |
| `message.reasoning` | `{text}` |
| `message.completed` | `{text, status}` |
| `tool.start` | `{toolCallId, toolName, args, risk, reason}` |
| `tool.result` | `{toolCallId, toolName, summary, output}` |
| `tool.error` | `{toolCallId, toolName, error}` |
| `approval.required` | `{approvalId, toolCallId, toolName, target, args, risk, reason, diff, validation, expiresAt}` |
| `error` | `{message, retryable}` |
| `done` | `{status, approvals}` |

Status values: `done`, `awaiting_approval`, `max_steps`, `error`.

## Approval decision

`POST /jenkins-ai-copilot/decision` returns `text/event-stream`.

```json
{
  "conversationId": "uuid",
  "approvalId": "uuid",
  "approved": true,
  "comment": "ship it"
}
```

The decision is validated against the owner, pending status, and expiry. Approving executes the exact stored
tool call; rejecting never executes it. The stream continues with the agent's response.

## Conversations

- `GET /jenkins-ai-copilot/conversations` — list for the current user.
- `GET /jenkins-ai-copilot/conversation?id=<uuid>` — conversation, messages, pending approvals.
- `POST /jenkins-ai-copilot/deleteConversation` — `{"id":"<uuid>"}`.

## Attachments

`GET /jenkins-ai-copilot/attachment?conversationId=<uuid>&id=<uuid>`

Owner-checked. Serves the stored raster image inline.

## Errors

```json
{"error":{"code":"forbidden","message":"..."}}
```

`401 unauthenticated`, `403 forbidden`, `404 not_found`, `409 setup_required`, `409 approval_pending`,
`409 expired`, `400 invalid_*`, `429 rate_limited`, `503 disabled`.
