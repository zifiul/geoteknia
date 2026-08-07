import { defineConfig, devices } from '@playwright/test';

import { loadTestEnv } from './tests/helpers/test-env';

const E2E_PORT = 3010;
const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

loadTestEnv({
  NEXTAUTH_URL: E2E_BASE_URL,
  NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
  MEDIA_STORAGE_BASE_URL: E2E_BASE_URL,
  NODE_ENV: 'production',
});

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: E2E_BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec next start -p ${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
      NEXTAUTH_URL: E2E_BASE_URL,
      MEDIA_STORAGE_BASE_URL: E2E_BASE_URL,
    },
  },
});
