// Setup file for Vitest
import '@testing-library/jest-dom/vitest'

// Extend Vitest matchers with testing-library matchers
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<any, void> {}
}
