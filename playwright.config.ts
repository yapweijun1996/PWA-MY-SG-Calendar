import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './app/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { channel: 'chrome', headless: true },
  projects: [
    { name: 'development', use: { baseURL: 'http://127.0.0.1:5173' } },
    { name: 'production-preview', use: { baseURL: 'http://127.0.0.1:4175' } },
  ],
  webServer: [
    { command: 'npm run dev:app', url: 'http://127.0.0.1:5173', reuseExistingServer: false },
    { command: 'npm run preview:app', url: 'http://127.0.0.1:4175', reuseExistingServer: false },
  ],
});
