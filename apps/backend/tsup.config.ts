import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/database/cli.ts', 'src/database/create-staff.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Bundle the shared workspace package (consumed as TypeScript source); keep npm deps external.
  noExternal: ['@dk/shared'],
});
