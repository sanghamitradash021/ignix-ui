import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // ✅ IMPORTANT (MCP SDK requires ESM)
  dts: false, // no need for types in published package (can enable later if needed)
  clean: true,
  target: 'node18', // ✅ Node 18+
  tsconfig: './tsconfig.json',
  splitting: false,
  sourcemap: false,
  minify: false, // ❗ keep false for debugging MCP issues
  treeshake: true,
  banner: {
    js: '#!/usr/bin/env node', // ✅ required for CLI execution
  },
  outDir: 'dist',
  esbuildOptions(options) {
    options.platform = 'node';
  },
});
