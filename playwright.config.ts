import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './client/tests/e2e',
  timeout: 30000,
  retries: 0,

  use: {
    baseURL: process.env.BASE_URL || 'https://samct-production.up.railway.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})