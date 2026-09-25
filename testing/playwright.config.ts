import { defineConfig } from '@playwright/test';

const API = 'http://localhost:8081/api';

/**
 * Browser end-to-end tests. Starts (or reuses) the backend on :8081 against the
 * disposable dms_test database and the Vite frontend on :5174 pointed at it.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './reports/playwright/artifacts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: './reports/playwright/html', open: 'never' }],
    ['junit', { outputFile: './reports/playwright/playwright-junit.xml' }],
    ['json', { outputFile: './reports/playwright/playwright-results.json' }],
  ],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5174',
    channel: 'msedge',
    viewport: { width: 1366, height: 800 },
    screenshot: 'on',
    video: 'off',
    trace: 'retain-on-failure',
  },
  metadata: { apiBaseUrl: API },
  webServer: [
    {
      command: 'java -jar ../backend/target/dms-backend-1.0.0.jar',
      url: `${API}/tournaments`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        DB_NAME: 'dms_test',
        SERVER_PORT: '8081',
        CORS_ORIGINS: 'http://localhost:5174,http://localhost:5173',
      },
    },
    {
      command: 'npx vite --port 5174 --strictPort',
      cwd: '../frontend',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      timeout: 120_000,
      env: { VITE_API_BASE_URL: API },
    },
  ],
});
