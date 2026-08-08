import { defineConfig, devices } from '@playwright/test';

// Smoke and accessibility tests run against the production build, served by
// scripts/preview-server.mjs. That stands in for `astro preview`, which
// daemonises (Astro 7.2+) and so cannot be managed by `webServer`.
// CI builds beforehand (dist/ exists), so it only starts the server;
// locally the build is included so `npm run test:e2e` works standalone.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: process.env.CI
      ? 'node scripts/preview-server.mjs'
      : 'npm run build && node scripts/preview-server.mjs',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
