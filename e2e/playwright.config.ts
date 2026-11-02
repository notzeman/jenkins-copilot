import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.JENKINS_URL ?? 'http://localhost:8080',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
