// End-to-end browser tests (`npm run test:e2e`).
//
// By default this starts Vite with the store flag on and drives the in-browser
// fixture API. Set E2E_BASE_URL to run the same journey against a deployed
// site instead, e.g. the `store` branch deploy (live Supabase inventory +
// dev-simulated payment):
//
//   E2E_BASE_URL=https://store--destinationparadisezanzibar.netlify.app npm run test:e2e
//
// PLAYWRIGHT_CHROMIUM_PATH points at a preinstalled Chromium when the bundled
// browser revision isn't downloaded (sandboxes without `playwright install`).
import { defineConfig, devices } from '@playwright/test';

const PORT = 5179;
const remoteBaseUrl = process.env.E2E_BASE_URL;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: remoteBaseUrl || `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { executablePath },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
  ],
  webServer: remoteBaseUrl
    ? undefined
    : {
        command: `npx vite --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}/store`,
        env: { VITE_STORE_ENABLED: 'true' },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
