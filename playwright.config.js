import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3456',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx serve . -l 3456',
    url: 'http://127.0.0.1:3456',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
