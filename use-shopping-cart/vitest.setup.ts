// Setup file for Vitest
import '@testing-library/jest-dom/vitest'

// Extend Vitest matchers with testing-library matchers
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}

  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    any,
    void
  > {}
}
