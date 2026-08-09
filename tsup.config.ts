import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // tsup's rollup-plugin-dts does not support TypeScript 7 yet;
  // declarations are emitted separately via `tsc -p tsconfig.build.json`.
  dts: false,
  clean: true,
  target: 'esnext',
  external: ['react', 'react-dom', '@worldware/msg', 'messageformat'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },
})
