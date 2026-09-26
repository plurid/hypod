import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['source/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'distribution',
  target: 'es2022',
  outputOptions: {
    exports: 'named',
  },
});
