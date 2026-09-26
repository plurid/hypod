#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const usage = `Run the official OCI Distribution conformance suite against a running Hypod.

Required environment:
  OCI_CONFORMANCE_ROOT  Path to an opencontainers/distribution-spec checkout
  OCI_REGISTRY          Registry authority, for example 127.0.0.1:56565
  OCI_REPO1             First disposable repository name
  OCI_REPO2             Second disposable repository name

For an authenticated registry, also set OCI_USERNAME and OCI_PASSWORD.
OCI_VERSION defaults to 1.1 and OCI_TLS defaults to disabled.
`;

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(usage);
  process.exit(0);
}

const fail = (message) => {
  process.stderr.write(`hypod OCI conformance: ${message}\n\n${usage}`);
  process.exit(1);
};

const checkout = process.env.OCI_CONFORMANCE_ROOT;
if (!checkout) fail('OCI_CONFORMANCE_ROOT is required.');

for (const name of ['OCI_REGISTRY', 'OCI_REPO1', 'OCI_REPO2']) {
  if (!process.env[name]) fail(`${name} is required.`);
}

const candidates = [resolve(checkout, 'conformance'), resolve(checkout)];
let conformanceRoot;
for (const candidate of candidates) {
  try {
    await access(resolve(candidate, 'go.mod'));
    conformanceRoot = candidate;
    break;
  } catch {
    // Try the next supported checkout shape.
  }
}
if (!conformanceRoot) {
  fail('Could not find conformance/go.mod beneath OCI_CONFORMANCE_ROOT.');
}

const resultsRoot = resolve(
  process.env.OCI_RESULTS_DIR ?? resolve(process.cwd(), '.artifacts', 'oci-conformance'),
);
await mkdir(resultsRoot, { recursive: true });

const environment = {
  ...process.env,
  OCI_VERSION: process.env.OCI_VERSION ?? '1.1',
  OCI_TLS: process.env.OCI_TLS ?? 'disabled',
  // Referrer discovery and SHA-512 content are outside the documented 0.2 scope.
  OCI_API_REFERRER: process.env.OCI_API_REFERRER ?? 'false',
  OCI_DATA_SHA512: process.env.OCI_DATA_SHA512 ?? 'false',
  // Everything Hypod does implement is exercised, so a regression in one of these
  // capabilities fails the run instead of being silently skipped.
  OCI_API_BLOBS_DIGEST_HEADER: process.env.OCI_API_BLOBS_DIGEST_HEADER ?? 'true',
  OCI_API_BLOBS_UPLOAD_CANCEL: process.env.OCI_API_BLOBS_UPLOAD_CANCEL ?? 'true',
  OCI_API_MANIFESTS_DIGEST_HEADER: process.env.OCI_API_MANIFESTS_DIGEST_HEADER ?? 'true',
  OCI_API_MANIFESTS_TAG_PARAM: process.env.OCI_API_MANIFESTS_TAG_PARAM ?? 'true',
  OCI_RESULTS_DIR: resultsRoot,
};

const exitCode = await new Promise((resolveExit, reject) => {
  const child = spawn('go', ['run', '-buildvcs=true', '.'], {
    cwd: conformanceRoot,
    env: environment,
    stdio: 'inherit',
  });
  child.once('error', reject);
  child.once('exit', (code, signal) => {
    if (signal) {
      process.stderr.write(`hypod OCI conformance: runner exited after ${signal}.\n`);
      resolveExit(1);
      return;
    }
    resolveExit(code ?? 1);
  });
});

process.exitCode = exitCode;
