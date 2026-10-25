import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e-production',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4174' },
  projects: ['chromium', 'firefox', 'webkit'].map(browser => ({ name: browser, use: { browserName: browser as 'chromium' | 'firefox' | 'webkit' } })),
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI
  }
});
