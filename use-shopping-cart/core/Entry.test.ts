import { describe, it, expect } from 'vitest'
import {
  getProductId,
  createCartEntry,
  addEntryToCart,
  removeEntryFromCart,
  calculateTotals
} from './Entry'
import type { Product, CartDetails } from './types'

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
})

describe('createCartEntry', () => {
  it('creates valid cart entry with required fields', () => {
    const product: Product = {
      id: 'test-123',
      name: 'Test Product',
      price: 100,
      currency: 'USD'
    }

    const entry = createCartEntry(
      'test-123',
      product,
      2,
      {},
      {},
      'USD',
      'en-US'
    )

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

    const entry = createCartEntry(
      'test',
      product,
      1,
      { tax: 'included' },
      {},
      'USD',
      'en-US'
    )

    expect(entry.price_data).toEqual({ tax: 'included' })
  })

  it('includes product_metadata', () => {
    const product: Product = {
      id: 'test',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }

    const entry = createCartEntry(
      'test',
      product,
      1,
      {},
      { type: 'digital' },
      'USD',
      'en-US'
    )

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

    const entry = createCartEntry(
      'test',
      product,
      1,
      {},
      { new: 'data' },
      'USD',
      'en-US'
    )

    expect(entry.product_data).toEqual({ existing: 'data', new: 'data' })
  })
})

describe('addEntryToCart', () => {
  it('adds entry to empty cart', () => {
    const entry: any = {
      id: 'test-1',
      name: 'Test',
      quantity: 1,
      value: 100
    }

    const result = addEntryToCart({}, entry)

    expect(result['test-1']).toBe(entry)
    expect(Object.keys(result)).toHaveLength(1)
  })

  it('adds entry to existing cart without modifying original', () => {
    const original: CartDetails = {
      'item-1': { id: 'item-1', quantity: 1 } as any
    }

    const newEntry: any = {
      id: 'item-2',
      quantity: 2
    }

    const result = addEntryToCart(original, newEntry)

    expect(result['item-1']).toBe(original['item-1'])
    expect(result['item-2']).toBe(newEntry)
    expect(Object.keys(result)).toHaveLength(2)
    expect(Object.keys(original)).toHaveLength(1) // Original unchanged
  })

  it('overwrites existing entry with same ID', () => {
    const original: CartDetails = {
      'item-1': { id: 'item-1', quantity: 1 } as any
    }

    const updated: any = {
      id: 'item-1',
      quantity: 5
    }

    const result = addEntryToCart(original, updated)

    expect(result['item-1']).toBe(updated)
    expect(result['item-1'].quantity).toBe(5)
  })
})

describe('removeEntryFromCart', () => {
  it('removes entry from cart', () => {
    const cartDetails: CartDetails = {
      'item-1': { id: 'item-1', quantity: 1 } as any,
      'item-2': { id: 'item-2', quantity: 2 } as any
    }

    const result = removeEntryFromCart(cartDetails, 'item-1')

    expect(result['item-1']).toBeUndefined()
    expect(result['item-2']).toBeDefined()
    expect(Object.keys(result)).toHaveLength(1)
  })

  it('does not modify original cart', () => {
    const cartDetails: CartDetails = {
      'item-1': { id: 'item-1', quantity: 1 } as any,
      'item-2': { id: 'item-2', quantity: 2 } as any
    }

    const result = removeEntryFromCart(cartDetails, 'item-1')

    expect(Object.keys(cartDetails)).toHaveLength(2) // Original unchanged
    expect(Object.keys(result)).toHaveLength(1)
  })

  it('handles removing non-existent entry', () => {
    const cartDetails: CartDetails = {
      'item-1': { id: 'item-1', quantity: 1 } as any
    }

    const result = removeEntryFromCart(cartDetails, 'non-existent')

    expect(Object.keys(result)).toHaveLength(1)
    expect(result['item-1']).toBeDefined()
  })
})

describe('calculateTotals', () => {
  it('returns zero for empty cart', () => {
    const result = calculateTotals({})

    expect(result.totalPrice).toBe(0)
    expect(result.cartCount).toBe(0)
  })

  it('calculates totals for single item', () => {
    const cartDetails: CartDetails = {
      'item-1': {
        id: 'item-1',
        quantity: 2,
        value: 200
      } as any
    }

    const result = calculateTotals(cartDetails)

    expect(result.totalPrice).toBe(200)
    expect(result.cartCount).toBe(2)
  })

  it('calculates totals for multiple items', () => {
    const cartDetails: CartDetails = {
      'item-1': { id: 'item-1', quantity: 2, value: 200 } as any,
      'item-2': { id: 'item-2', quantity: 3, value: 300 } as any,
      'item-3': { id: 'item-3', quantity: 1, value: 50 } as any
    }

    const result = calculateTotals(cartDetails)

    expect(result.totalPrice).toBe(550)
    expect(result.cartCount).toBe(6)
  })
})
