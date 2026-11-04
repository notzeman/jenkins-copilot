# End-to-end UI tests

These tests use Playwright against a Jenkins instance with the plugin installed.

```bash
# start Jenkins with the plugin (builds the UI first)
./scripts/dev.sh

# in another terminal
cd e2e
npm ci
npx playwright install chromium
npx playwright test
```

The tests expect Jenkins at `http://localhost:8080/jenkins`; set `JENKINS_URL` to use another address. On a
secured controller they sign in with `JENKINS_USER` and `JENKINS_PASSWORD` (default `admin` / `admin`).

The tests mock the plugin's API, including `/session`, `/settingsAccounts`, `/chat`, and `/decision`, so they do
not require a provider API key. They verify:

1. First run opens provider settings, which list OpenAI, Claude, opencode go, and custom endpoints.
2. Streamed tool activity, Markdown, an uploaded image, an approval card with a diff, and a rejected decision.
3. Status icon tooltips, and choosing a primary colour that persists across a reload.

For a live provider check, configure a provider in the drawer and chat manually.
