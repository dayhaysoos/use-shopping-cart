import type { StorageAdapter } from './types'

function createWebStorage(
  name: 'localStorage' | 'sessionStorage'
): StorageAdapter {
  return {
    getItem: (key: string) => {
      try {
        return window[name].getItem(key)
      } catch (error) {
        console.warn(`Failed to get item from ${name}:`, error)
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window[name].setItem(key, value)
      } catch (error) {
        console.warn(`Failed to set item in ${name}:`, error)
      }
    },
    removeItem: (key: string) => {
      try {
        window[name].removeItem(key)
      } catch (error) {
        console.warn(`Failed to remove item from ${name}:`, error)
      }
    }
  }
}

export function createLocalStorage(): StorageAdapter {
  return createWebStorage('localStorage')
}

export function createSessionStorage(): StorageAdapter {
  return createWebStorage('sessionStorage')
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
