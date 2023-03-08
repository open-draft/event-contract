import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: ['./src/index.ts'],
  outDir: './lib',
  format: ['cjs', 'esm'],
  sourcemap: true,
  dts: true,
})
