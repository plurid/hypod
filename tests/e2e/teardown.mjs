import { rm } from 'node:fs/promises';

/**
 * The end-to-end run mints a disposable data root per invocation. Removing it here keeps
 * `.artifacts/` from accumulating one abandoned registry per run.
 */
export default async function globalTeardown() {
  const dataRoot = process.env.HYPOD_E2E_DATA_ROOT;
  if (dataRoot) await rm(dataRoot, { recursive: true, force: true });
}
