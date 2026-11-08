import { describe, it, expect, beforeEach } from 'vitest'
import {
  createLocalStorage,
  createSessionStorage,
  createMemoryStorage
} from './storage'
import { ShoppingCart } from './ShoppingCart'
import type { StorageAdapter } from './types'

function createAsyncStorage(delay = 50): StorageAdapter {
  const store = new Map<string, string>()
  return {
    getItem: (key) =>
      new Promise((resolve) =>
        setTimeout(() => resolve(store.get(key) ?? null), delay)
      ),
    setItem: (key, value) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          store.set(key, value)
          resolve()
        }, delay)
      ),
    removeItem: (key) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          store.delete(key)
          resolve()
        }, delay)
      )
  }
}

describe('createLocalStorage', () => {
  let storage: ReturnType<typeof createLocalStorage>

  beforeEach(() => {
    localStorage.clear()
    storage = createLocalStorage()
  })

  it('stores and retrieves items', () => {
    storage.setItem('test-key', 'test-value')
    expect(storage.getItem('test-key')).toBe('test-value')
  })

  it('returns null for non-existent items', () => {
    expect(storage.getItem('non-existent')).toBeNull()
  })

  it('removes items', () => {
    storage.setItem('test-key', 'test-value')
    storage.removeItem('test-key')
    expect(storage.getItem('test-key')).toBeNull()
  })

  it('overwrites existing items', () => {
    storage.setItem('test-key', 'value1')
    storage.setItem('test-key', 'value2')
    expect(storage.getItem('test-key')).toBe('value2')
  })
})

describe('createSessionStorage', () => {
  beforeEach(() => sessionStorage.clear())

  it('stores items in sessionStorage, not localStorage', () => {
    localStorage.clear()
    createSessionStorage().setItem('test-key', 'test-value')

    expect(sessionStorage.getItem('test-key')).toBe('test-value')
    expect(localStorage.getItem('test-key')).toBeNull()
    expect(createSessionStorage().getItem('test-key')).toBe('test-value')
  })
})

describe('createMemoryStorage', () => {
  let storage: ReturnType<typeof createMemoryStorage>

  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('stores and retrieves items', () => {
    storage.setItem('test-key', 'test-value')
    expect(storage.getItem('test-key')).toBe('test-value')
  })

  it('returns null for non-existent items', () => {
    expect(storage.getItem('non-existent')).toBeNull()
  })

  it('removes items', () => {
    storage.setItem('test-key', 'test-value')
    storage.removeItem('test-key')
    expect(storage.getItem('test-key')).toBeNull()
  })

  it('overwrites existing items', () => {
    storage.setItem('test-key', 'value1')
    storage.setItem('test-key', 'value2')
    expect(storage.getItem('test-key')).toBe('value2')
  })

  it('stores multiple items independently', () => {
    storage.setItem('key1', 'value1')
    storage.setItem('key2', 'value2')
    storage.setItem('key3', 'value3')

    expect(storage.getItem('key1')).toBe('value1')
    expect(storage.getItem('key2')).toBe('value2')
    expect(storage.getItem('key3')).toBe('value3')
  })

  it('each instance has independent storage', () => {
    const storage1 = createMemoryStorage()
    const storage2 = createMemoryStorage()

    storage1.setItem('test', 'value1')
    storage2.setItem('test', 'value2')

    expect(storage1.getItem('test')).toBe('value1')
    expect(storage2.getItem('test')).toBe('value2')
  })
})

describe('async storage', () => {
  it('creates async storage adapter', async () => {
    const storage = createAsyncStorage(10)

    await storage.setItem('test', 'value')
    const result = await storage.getItem('test')

    expect(result).toBe('value')
  })

  it('removes items asynchronously', async () => {
    const storage = createAsyncStorage(10)

    await storage.setItem('test', 'value')
    await storage.removeItem('test')
    const result = await storage.getItem('test')

    expect(result).toBeNull()
  })
})

describe('ShoppingCart with async storage', () => {
  it('does not overwrite cart entries added before async storage loads', async () => {
    const storage = createAsyncStorage(100)

    await storage.setItem(
      'cart',
      JSON.stringify({
        cartDetails: {
          'old-item': {
            id: 'old-item',
            name: 'Old Item',
            price: 100,
            currency: 'USD',
            quantity: 1,
            value: 100
          }
        },
        cartCount: 1,
        totalPrice: 100
      })
    )

    const cart = new ShoppingCart({ storage, persistKey: 'cart' })

    cart.addItem({
      id: 'new-item',
      name: 'New',
      price: 200,
      currency: 'USD'
    })

    await new Promise((r) => setTimeout(r, 150))

    const state = cart.getState()

    expect(state.cartDetails['new-item']).toBeDefined()
    expect(state.cartDetails['new-item'].quantity).toBe(1)
  })

  it('loads from async storage when no modifications made', async () => {
    const storage = createAsyncStorage(50)

    await storage.setItem(
      'cart',
      JSON.stringify({
        cartDetails: {
          'stored-item': {
            id: 'stored-item',
            name: 'Stored',
            price: 500,
            currency: 'USD',
            quantity: 3,
            value: 1500
          }
        },
        cartCount: 3,
        totalPrice: 1500,
        currency: 'EUR',
        language: 'fr-FR'
      })
    )

    const cart = new ShoppingCart({ storage, persistKey: 'cart' })

    await new Promise((r) => setTimeout(r, 100))

    const state = cart.getState()

    expect(state.cartDetails['stored-item']).toBeDefined()
    expect(state.cartCount).toBe(3)
    expect(state.currency).toBe('EUR')
    expect(state.language).toBe('fr-FR')
  })
})
