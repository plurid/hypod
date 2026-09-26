import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'ui/**/*.test.{ts,tsx}'],
    exclude: ['src/**/*.integration.test.ts', 'src/**/*.oci.test.ts'],
    environment: 'node',
    coverage: { reporter: ['text', 'html'] },
  },
});
