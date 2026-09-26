import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@playwright/test';

const port = 18_185;
const baseURL = `http://127.0.0.1:${port}`;
const dataRoot = resolve('.artifacts', `e2e-${randomUUID()}`);
// Recorded on the Playwright process so globalTeardown, which runs there rather than in
// the web server, can remove the disposable root this run created.
process.env.HYPOD_E2E_DATA_ROOT = dataRoot;

export default defineConfig({
  testDir: './tests/e2e',
  globalTeardown: fileURLToPath(new URL('./tests/e2e/teardown.mjs', import.meta.url)),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: '.artifacts/playwright',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node packages/hypod-server/build/cli.mjs serve',
    url: `${baseURL}/health/ready`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      ...process.env,
      HYPOD_MODE: 'public',
      HYPOD_HOST: '127.0.0.1',
      HYPOD_PORT: String(port),
      HYPOD_EXTERNAL_URL: baseURL,
      HYPOD_DATA_ROOT: dataRoot,
      HYPOD_LOG_LEVEL: 'silent',
      HYPOD_OWNER_IDENTONYM: 'e2e-owner',
      HYPOD_OWNER_KEY: 'e2e-owner-key',
      HYPOD_TOKEN_SECRET: 'e2e-token-secret-with-at-least-32-bytes',
    },
  },
});
