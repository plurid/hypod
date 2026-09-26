import { createRequire } from 'node:module';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const packages = [
  { name: '@plurid/hypod', root: 'packages/hypod-server' },
  { name: '@plurid/hypod-client', root: 'packages/hypod-client/hypod-javascript' },
];
const destination = await mkdtemp(join(tmpdir(), 'hypod-pack-'));

const run = (arguments_) =>
  new Promise((resolve, reject) => {
    const child = spawn('pnpm', arguments_, { stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm ${arguments_.join(' ')} exited with ${code ?? 'no code'}`));
    });
  });

try {
  for (const package_ of packages) {
    const packageRoot = resolve(package_.root);
    const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
    if (manifest.version !== '0.2.0') {
      throw new Error(`${package_.name} has unexpected version ${manifest.version}.`);
    }
    const importPath = resolve(packageRoot, manifest.exports['.'].import.default);
    const requirePath = resolve(packageRoot, manifest.exports['.'].require.default);
    const importTypes = resolve(packageRoot, manifest.exports['.'].import.types);
    const requireTypes = resolve(packageRoot, manifest.exports['.'].require.types);
    await Promise.all(
      [importPath, requirePath, importTypes, requireTypes].map((path) => access(path)),
    );
    await import(pathToFileURL(importPath).href);
    createRequire(join(packageRoot, 'package.json'))(requirePath);
    await run(['--filter', package_.name, 'pack', '--pack-destination', destination]);
  }
} finally {
  await rm(destination, { recursive: true, force: true });
}
