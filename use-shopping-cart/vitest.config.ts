import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx,jsx}'],
    exclude: ['node_modules', 'dist', '**/*.test.js']
  },
  esbuild: {
    jsx: 'automatic'
  }
})
