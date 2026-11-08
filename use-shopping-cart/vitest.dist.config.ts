import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['dist-tests/**/*.test.tsx']
  }
})
