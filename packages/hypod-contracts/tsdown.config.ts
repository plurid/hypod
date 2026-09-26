import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['source/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'build',
  platform: 'node',
  target: 'node24',
  nodeProtocol: true,
});
