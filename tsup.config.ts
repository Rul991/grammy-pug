import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/app/index.ts'],
    format: ['cjs', 'esm'],
    target: 'node18',
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: false,
    bundle: true,
    outDir: 'dist',
    minify: true,
    noExternal: []
})