import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './client/tests/e2e',
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: '.playwright/results.json' }]],
  globalSetup: './client/tests/e2e/setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: process.env.SAMCT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.SAMCT_CHROMIUM_EXECUTABLE } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: `${process.env.SAMCT_DOTNET || 'dotnet'} run --project server --no-build --no-launch-profile`, url: 'http://127.0.0.1:5072/api/health', reuseExistingServer: false, timeout: 90000 },
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 30000 },
  ],
})
