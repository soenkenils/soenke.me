import { execFileSync } from 'node:child_process';

// Astro 7.2 turned `astro preview` into a daemon: it starts the server, prints
// the pid and returns 0 immediately. Playwright's `webServer` reads that quick
// exit as "process exited early" and aborts the run, so the lifecycle is driven
// from globalSetup/globalTeardown instead.

export const BASE_URL = 'http://localhost:4321';

const astro = (...args: string[]) =>
  execFileSync('npx', ['astro', ...args], { stdio: 'ignore' });

const waitForServer = async (timeoutMs = 30_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not come up at ${BASE_URL}`);
};

export default async function globalSetup() {
  // CI builds in a separate step; locally `npm run test:e2e` should stand alone
  if (!process.env.CI) {
    execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
  }
  try {
    astro('preview', 'stop'); // clear a daemon left over from an earlier run
  } catch {
    /* nothing was running */
  }
  astro('preview');
  await waitForServer();

  // Playwright calls a returned function as the global teardown
  return () => {
    try {
      astro('preview', 'stop');
    } catch {
      /* already gone */
    }
  };
}
