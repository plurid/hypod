#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createHypod } from './application';
import { runDoctor } from './operations/doctor';
import { runGarbageCollection } from './operations/garbage-collection';
import { runMigration } from './operations/migrate';

const argumentValue = (arguments_: string[], name: string): string | undefined => {
  const index = arguments_.indexOf(name);
  return index >= 0 ? arguments_[index + 1] : undefined;
};

const print = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};

export const runCli = async (arguments_ = process.argv.slice(2)): Promise<void> => {
  const command = arguments_[0] ?? 'serve';
  const configuredRoot = argumentValue(arguments_, '--data-root');
  const dataRoot = resolve(
    configuredRoot ??
      process.env.HYPOD_DATA_ROOT ??
      (process.env.HYPOD_STORAGE_ROOT_PATH
        ? resolve(process.env.HYPOD_STORAGE_ROOT_PATH, 'data')
        : 'data'),
  );
  if (command === 'serve') {
    const application = await createHypod({
      ...(configuredRoot ? { dataRoot } : {}),
      manageSignals: true,
    });
    print(await application.start());
    return;
  }
  if (command === 'migrate') {
    print(await runMigration({ dataRoot, dryRun: arguments_.includes('--dry-run') }));
    return;
  }
  if (command === 'doctor') {
    const report = await runDoctor({ dataRoot });
    print(report);
    if (!report.ok) process.exitCode = 1;
    return;
  }
  if (command === 'gc') {
    print(await runGarbageCollection({ dataRoot, dryRun: arguments_.includes('--dry-run') }));
    return;
  }
  throw new Error(`Unknown command "${command}". Expected serve, migrate, doctor, or gc.`);
};

/**
 * This module is both the `hypod` bin and an importable entry in the built package.
 * Importing it must not start a server or take the data-root lock.
 */
const executedDirectly = (): boolean => {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  try {
    return pathToFileURL(realpathSync(entry)).href === import.meta.url;
  } catch {
    return false;
  }
};

if (executedDirectly()) {
  void runCli().catch((error: unknown) => {
    process.stderr.write(`hypod: ${(error as Error).message}\n`);
    process.exitCode = 1;
  });
}
