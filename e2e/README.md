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

The tests mock `/session`, `/models`, `/chat`, and `/decision` where needed, so they do not require a provider
API key. They verify:

1. The setup card lists OpenAI, Claude, and opencode go.
2. Streamed tool activity, Markdown, an uploaded image, an approval card with a diff, and a rejected decision.

For a live provider check, configure a provider in the drawer and chat manually.
