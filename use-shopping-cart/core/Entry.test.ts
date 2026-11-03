import { describe, it, expect } from 'vitest'
import { getProductId, createCartEntry } from './Entry'
import type { Product } from './types'

describe('getProductId', () => {
  it('returns id if present', () => {
    const product: Product = {
      id: 'test-123',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }
    expect(getProductId(product)).toBe('test-123')
  })

  it('returns price_id if id not present', () => {
    const product: Product = {
      price_id: 'price-456',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }
    expect(getProductId(product)).toBe('price-456')
  })

  it('returns sku_id if id and price_id not present', () => {
    const product: Product = {
      sku_id: 'sku-789',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }
    expect(getProductId(product)).toBe('sku-789')
  })

  it('returns sku if other IDs not present', () => {
    const product: Product = {
      sku: 'sku-old',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }
    expect(getProductId(product)).toBe('sku-old')
  })

  it('generates UUID if no ID present', () => {
    const product: Product = {
      name: 'Test',
      price: 100,
      currency: 'USD'
    }
    const id = getProductId(product)
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('does not mutate product when generating ID', () => {
    const product: Product = {
      name: 'Test',
      price: 100,
      currency: 'USD'
    }

    getProductId(product)

    expect(product).not.toHaveProperty('id')
  })

  it('falls back to custom UUID when crypto.randomUUID is unavailable', () => {
    const product: Product = {
      name: 'Test',
      price: 100,
      currency: 'USD'
    }

    const originalCrypto = globalThis.crypto
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true
    })

    const id = getProductId(product)

    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true
    })

    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
  })

  it('returns consistent generated IDs for the same product reference', () => {
    const product: Product = {
      name: 'Test',
      price: 100,
      currency: 'USD'
    }

    const firstId = getProductId(product)
    const secondId = getProductId(product)

    expect(firstId).toBe(secondId)
  })
})

describe('createCartEntry', () => {
  it('creates valid cart entry with required fields', () => {
    const product: Product = {
      id: 'test-123',
      name: 'Test Product',
      price: 100,
      currency: 'USD'
    }

    const entry = createCartEntry('test-123', product, 2, {
      currency: 'USD',
      language: 'en-US'
    })

    expect(entry.id).toBe('test-123')
    expect(entry.name).toBe('Test Product')
    expect(entry.quantity).toBe(2)
    expect(entry.price).toBe(100)
    expect(entry.value).toBe(200)
    expect(entry.formattedValue).toBe('$2.00')
    expect(entry.formattedPrice).toBe('$1.00')
    expect(entry.timestamp).toBeTruthy()
  })

  it('includes price_metadata', () => {
    const product: Product = {
      id: 'test',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }

    const entry = createCartEntry('test', product, 1, {
      currency: 'USD',
      language: 'en-US',
      price_metadata: { tax: 'included' }
    })

    expect(entry.price_data).toEqual({ tax: 'included' })
  })

  it('includes product_metadata', () => {
    const product: Product = {
      id: 'test',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }

    const entry = createCartEntry('test', product, 1, {
      currency: 'USD',
      language: 'en-US',
      product_metadata: { type: 'digital' }
    })

    expect(entry.product_data).toEqual({ type: 'digital' })
  })

  it('merges existing product metadata', () => {
    const product: Product = {
      id: 'test',
      name: 'Test',
      price: 100,
      currency: 'USD',
      product_data: { existing: 'data' }
    }

    const entry = createCartEntry('test', product, 1, {
      currency: 'USD',
      language: 'en-US',
      product_metadata: { new: 'data' }
    })

    expect(entry.product_data).toEqual({ existing: 'data', new: 'data' })
  })
})
