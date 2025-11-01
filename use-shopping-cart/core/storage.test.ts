import { describe, it, expect, beforeEach } from 'vitest'
import {
  createLocalStorage,
  createNoopStorage,
  createMemoryStorage
} from './storage'

describe('createLocalStorage', () => {
  let storage: ReturnType<typeof createLocalStorage>

  beforeEach(() => {
    // Clear localStorage before each test
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

describe('createNoopStorage', () => {
  let storage: ReturnType<typeof createNoopStorage>

  beforeEach(() => {
    storage = createNoopStorage()
  })

  it('always returns null for getItem', () => {
    expect(storage.getItem('any-key')).toBeNull()
  })

  it('setItem does nothing', () => {
    expect(() => storage.setItem('test-key', 'test-value')).not.toThrow()
    expect(storage.getItem('test-key')).toBeNull()
  })

  it('removeItem does nothing', () => {
    expect(() => storage.removeItem('test-key')).not.toThrow()
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
