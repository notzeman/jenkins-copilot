import { expect, test } from '@playwright/test';

const user = process.env.JENKINS_USER ?? 'admin';
const password = process.env.JENKINS_PASSWORD ?? 'admin';

const session = {
  authenticated: true,
  user: 'admin',
  isAdmin: true,
  context: { jenkinsUrl: 'http://localhost:8080/' },
  config: {
    enabled: true,
    sidebarEnabled: true,
    setupRequired: false,
    defaultProvider: 'openai',
    defaultModel: 'gpt-test',
    maxSteps: 20,
    maxAttachmentMb: 5,
    autoApproveLevel2: false,
    githubConfigured: false,
    providers: [
      { id: 'openai', label: 'OpenAI', configured: true },
      { id: 'anthropic', label: 'Claude', configured: false },
      { id: 'opencode-go', label: 'opencode go', configured: false, baseUrl: '' },
    ],
  },
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  if (await page.locator('#j_username').count()) {
    await page.fill('#j_username', user);
    await page.fill('#j_password', password);
    await page.locator('input[type="submit"], button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
  }
});

test('setup card lists the supported providers', async ({ page }) => {
  await page.route('**/jenkins-ai-copilot/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...session,
        config: {
          ...session.config,
          setupRequired: true,
          defaultModel: '',
          providers: session.config.providers.map((item) => ({ ...item, configured: false })),
        },
      }),
    }),
  );
  await page.goto('/manage/');
  await page.locator('button[aria-label="Open Jenkins Copilot"]').click();
  await expect(page.locator('.cp-setup')).toBeVisible();
  await expect(page.locator('.cp-provider-name')).toHaveText(['OpenAI', 'Claude', 'opencode go']);
  await expect(page.locator('.cp-field input[type="password"]')).toBeVisible();
});

test('renders streamed tool activity, an image, and an approval card', async ({ page }) => {
  await page.route('**/jenkins-ai-copilot/session', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }),
  );
  await page.route('**/jenkins-ai-copilot/models', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ provider: 'openai', models: [{ id: 'gpt-test', label: 'gpt-test' }] }),
    }),
  );
  await page.route('**/jenkins-ai-copilot/conversations', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ conversations: [] }) }),
  );

  const sse = [
    ['conversation', { id: '11111111-1111-4111-8111-111111111111', title: 'Mocked run' }],
    [
      'tool.start',
      { toolCallId: 'call-1', toolName: 'list_jobs', args: {}, risk: 1, reason: 'Read-only job inventory' },
    ],
    [
      'tool.result',
      { toolCallId: 'call-1', toolName: 'list_jobs', summary: 'returned jobs', output: { jobs: [] } },
    ],
    ['message.delta', { text: 'I checked the **jobs**. ' }],
    ['message.delta', { text: 'Nothing is failing.' }],
    [
      'approval.required',
      {
        approvalId: '22222222-2222-4222-8222-222222222222',
        toolCallId: 'call-2',
        toolName: 'apply_pipeline_update',
        target: 'demo-fail',
        args: { planId: '44444444-4444-4444-8444-444444444444' },
        risk: 3,
        reason: 'Rewrites a pipeline definition',
        diff: '@@ -1 +1 @@\n-old\n+new',
        validation: { validated: true, kind: 'declarative' },
        expiresAt: Date.now() + 1_800_000,
      },
    ],
    ['message.completed', { text: 'I checked the **jobs**. Nothing is failing.', status: 'awaiting_approval' }],
    ['done', { status: 'awaiting_approval', approvals: 1 }],
  ] as const;

  const body = sse.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join('');

  let chatCalls = 0;
  await page.route('**/jenkins-ai-copilot/chat', async (route) => {
    chatCalls += 1;
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body,
    });
  });
  await page.route('**/jenkins-ai-copilot/decision', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body: 'event: done\ndata: {"status":"idle"}\n\n',
    }),
  );

  await page.goto('/manage/');
  await page.locator('button[aria-label="Open Jenkins Copilot"]').click();
  await expect(page.locator('.cp-textarea')).toBeVisible();

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: 'screenshot.png',
    mimeType: 'image/png',
    buffer: png,
  });
  await expect(page.locator('.cp-thumb img')).toBeVisible();

  await page.locator('.cp-textarea').fill('Check the jobs and propose a pipeline change.');
  await page.keyboard.press('Enter');

  expect(chatCalls).toBe(1);
  await expect(page.locator('.cp-tool-name').filter({ hasText: 'list_jobs' })).toBeVisible();
  await expect(page.locator('.cp-msg-body').filter({ hasText: 'jobs' }).last()).toContainText('jobs');
  await expect(page.locator('.cp-thumb img')).toBeVisible();

  const approval = page.locator('.cp-approval');
  await expect(approval).toBeVisible();
  await expect(approval.locator('.cp-risk')).toContainText('privileged');
  await expect(approval.locator('.cp-validation')).toContainText('validated');

  await approval.getByRole('button', { name: 'Review diff' }).click();
  await expect(approval.locator('.cp-diff')).toBeVisible();
  await expect(approval.locator('.cp-add')).toContainText('new');

  await approval.getByRole('button', { name: 'Reject' }).click();
  await expect(approval.locator('.cp-approval-title')).toContainText('Change rejected');
});
