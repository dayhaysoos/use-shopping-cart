import { describe, it, expect } from 'vitest'
import { createCartEntry, updateCartEntry } from './Entry'
import type { Product } from './types'

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

    expect(entry.price_data).toEqual({ metadata: { tax: 'included' } })
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

    expect(entry.product_data).toEqual({ metadata: { type: 'digital' } })
  })

  it('merges existing product metadata', () => {
    const product: Product = {
      id: 'test',
      name: 'Test',
      price: 100,
      currency: 'USD',
      product_data: { name: 'Shown', metadata: { existing: 'data' } }
    }

    const entry = createCartEntry('test', product, 1, {
      currency: 'USD',
      language: 'en-US',
      product_metadata: { new: 'data' }
    })

    expect(entry.product_data).toEqual({
      name: 'Shown',
      metadata: { existing: 'data', new: 'data' }
    })
  })
})

describe('updateCartEntry', () => {
  const entry = createCartEntry(
    'test',
    { id: 'test', name: 'Test', price: 100, currency: 'USD' },
    1,
    { currency: 'USD', language: 'en-US', product_metadata: { size: 'M' } }
  )
  const stamped = { ...entry, timestamp: '2020-01-01T00:00:00.000Z' }

  it('recomputes value and formatting and keeps the timestamp', () => {
    const updated = updateCartEntry('test', stamped, {
      quantity: 3,
      currency: 'EUR',
      language: 'de-DE'
    })

    expect(updated.quantity).toBe(3)
    expect(updated.value).toBe(300)
    expect(updated.formattedValue).toMatch(/3,00\s€/)
    expect(updated.timestamp).toBe('2020-01-01T00:00:00.000Z')
    expect(updated.product_data).toEqual({ metadata: { size: 'M' } })
  })

  it('keeps the quantity when none is given', () => {
    const updated = updateCartEntry('test', stamped, {
      currency: 'USD',
      language: 'en-US'
    })

    expect(updated.quantity).toBe(1)
  })

  it('adds a timestamp when the entry has none', () => {
    const { timestamp: _timestamp, ...unstamped } = stamped
    const updated = updateCartEntry('test', unstamped as typeof stamped, {
      currency: 'USD',
      language: 'en-US'
    })

    expect(updated.timestamp).toBeTruthy()
  })

  it('merges new metadata into the existing metadata', () => {
    const updated = updateCartEntry('test', stamped, {
      currency: 'USD',
      language: 'en-US',
      product_metadata: { color: 'red' }
    })

    expect(updated.product_data).toEqual({
      metadata: { size: 'M', color: 'red' }
    })
  })
})
