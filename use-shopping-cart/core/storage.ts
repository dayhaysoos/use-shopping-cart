import type { StorageAdapter } from './types'

/**
 * Creates a localStorage-based storage adapter
 */
export function createLocalStorage(): StorageAdapter {
  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.warn('Failed to get item from localStorage:', error)
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value)
      } catch (error) {
        console.warn('Failed to set item in localStorage:', error)
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn('Failed to remove item from localStorage:', error)
      }
    }
  }
}

/**
 * Creates a no-op storage adapter (for server-side rendering)
 */
export function createNoopStorage(): StorageAdapter {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
}

/**
 * Creates an in-memory storage adapter (useful for testing)
 */
export function createMemoryStorage(): StorageAdapter {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    }
  }
}
