import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Type-level tests (*.test-d.ts / *.test-d.tsx) are type-checked, not executed, on every
    // `npm test` run, so CI catches typed-API regressions.
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.{ts,tsx}'],
      // tsconfig.json excludes these files (to keep them out of the build),
      // so point the checker at a config that includes them.
      tsconfig: './tsconfig.typetest.json',
    },
  },
})
