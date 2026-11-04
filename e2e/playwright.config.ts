import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  retries: 0,
  reporter: [['list']],
  use: {
    // Trailing slash so relative paths in the tests stay under the /jenkins prefix used by dev.sh.
    baseURL: `${(process.env.JENKINS_URL ?? 'http://localhost:8080/jenkins').replace(/\/$/, '')}/`,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
