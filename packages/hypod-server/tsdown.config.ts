import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'build',
  platform: 'node',
  target: 'node24',
  nodeProtocol: true,
  shims: true,
  outputOptions: {
    exports: 'named',
  },
});
