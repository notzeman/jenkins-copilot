# Skills

Skills are reusable procedures the assistant loads on demand. They are global, admin-managed, and stored under
`$JENKINS_HOME/jenkins-ai-copilot/skills/skills.json`. Each skill body is Markdown.

## Why

Pipeline work is repetitive: the same agents, stages, checkout steps, test commands, deployment patterns, and
failure handling show up in every repository. Reading every Jenkinsfile on every request is expensive.

A skill distils that pattern once. The model sees only a short catalogue entry during normal chats and calls
`get_skill` when the skill is relevant.

## Create a skill from existing pipelines

1. Open **Settings → Skills**.
2. Under **Draft a skill from pipelines**, choose a name, optional folder scope, and pipeline limit.
3. Click **Analyse pipelines with Copilot**.
4. Copilot calls `scan_pipelines`, identifies the repeated structure, and calls `create_skill`.
5. Review and approve the skill in the chat approval card.

`scan_pipelines` returns compact evidence only: stage names, agent labels, environment keys, credential IDs,
and feature flags. Full Jenkinsfiles are not included.

## Manual skills

The Skills tab also has an **Add skill** form:

- name, kind, description, and when-to-use
- comma-separated tags and source job names
- Markdown body, including a fenced Jenkinsfile template

## Agent tools

| Tool | Risk | Purpose |
|---|---|---|
| `list_skills` | 1 | Search skill summaries |
| `get_skill` | 1 | Load a full Markdown body |
| `scan_pipelines` | 1 | Compact pipeline pattern evidence |
| `create_skill` | 3 | Persist a new skill; always approved |
| `update_skill` | 3 | Edit and increment the version |
| `delete_skill` | 3 | Delete with confirmation |
| `set_skill_enabled` | 2 | Toggle catalogue visibility |

## Security and context

- Skills are global and admin-managed; only administrators can create or change them.
- The system prompt gets only enabled catalogue entries, capped at 20.
- A skill body is fetched only when the agent calls `get_skill`.
- Skill content cannot override the system prompt, approval rules, or secret redaction.
- Changes are audited.
- Do not put secrets in a skill. Use Jenkins credential IDs.

## Use cases

Skills are not limited to pipeline creation. Because `kind` and `tags` are free-form, they can cover:

- pipeline creation and migration
- build failure triage and recovery
- release, deployment, and rollback
- security and credential handling
- agent provisioning
- views and dashboards
- plugin upgrades
- onboarding and repository conventions
- incident and postmortem procedures
