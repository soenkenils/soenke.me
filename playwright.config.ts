import { defineConfig, devices } from '@playwright/test';

// Smoke and accessibility tests run against the production build via
// `astro preview`. That command daemonises (Astro 7.2+), so the server is
// started and stopped from e2e/preview-server.ts rather than `webServer`.
export default defineConfig({
  globalSetup: './e2e/preview-server.ts',
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    ...devices['Desktop Chrome'],
  },
});
