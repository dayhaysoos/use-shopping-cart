import { describe, it, expect } from 'vitest'
import {
  decodeAddItem,
  decodeCountChange,
  decodeItemId,
  decodeQuantity
} from './formData'

function form(fields: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

const product = { id: 'a', name: 'A', price: 100, currency: 'USD' }

describe('decodeAddItem', () => {
  it('decodes the product and defaults count to 1', () => {
    expect(decodeAddItem(form({ product: JSON.stringify(product) }))).toEqual({
      product,
      count: 1
    })
  })

  it('decodes an explicit count', () => {
    expect(
      decodeAddItem(form({ product: JSON.stringify(product), count: '3' }))
        .count
    ).toBe(3)
  })

  it.each([
    [{}, 'Product data is required'],
    [{ product: 'x'.repeat(50_001) }, 'Product data is too large'],
    [{ product: '{nope' }, 'Product data must be valid JSON'],
    [
      { product: JSON.stringify({ ...product, price: '1' }) },
      'Product.price must be a number'
    ],
    [
      { product: JSON.stringify(product), count: '0' },
      'count must be a positive integer'
    ],
    [
      { product: JSON.stringify(product), count: '1.5' },
      'count must be a positive integer'
    ]
  ])('rejects %j with "%s"', (fields, message) => {
    expect(() => decodeAddItem(form(fields))).toThrow(message)
  })

  it('checks the product before the count', () => {
    expect(() =>
      decodeAddItem(form({ product: JSON.stringify({}), count: '-1' }))
    ).toThrow('Product.price must be a number')
  })
})

describe('decodeItemId', () => {
  it('returns the item id', () => {
    expect(decodeItemId(form({ itemId: 'a' }))).toBe('a')
  })

  it('requires an item id', () => {
    expect(() => decodeItemId(form({}))).toThrow('Item ID is required')
    expect(() => decodeItemId(form({ itemId: '' }))).toThrow(
      'Item ID is required'
    )
  })
})

describe('decodeCountChange', () => {
  it('defaults count to 1', () => {
    expect(decodeCountChange(form({ itemId: 'a' }))).toEqual({
      itemId: 'a',
      count: 1
    })
  })

  it('checks the item id before the count', () => {
    expect(() => decodeCountChange(form({ count: 'x' }))).toThrow(
      'Item ID is required'
    )
    expect(() => decodeCountChange(form({ itemId: 'a', count: '-2' }))).toThrow(
      'count must be a positive integer'
    )
  })
})

describe('decodeQuantity', () => {
  it('accepts zero', () => {
    expect(decodeQuantity(form({ itemId: 'a', quantity: '0' }))).toEqual({
      itemId: 'a',
      quantity: 0
    })
  })

  it('requires both fields', () => {
    expect(() => decodeQuantity(form({ itemId: 'a' }))).toThrow(
      'Item ID and quantity are required'
    )
    expect(() => decodeQuantity(form({ quantity: '2' }))).toThrow(
      'Item ID and quantity are required'
    )
  })

  it('rejects negative and fractional quantities', () => {
    for (const quantity of ['-1', '2.5', 'abc', 'Infinity']) {
      expect(() => decodeQuantity(form({ itemId: 'a', quantity }))).toThrow(
        'quantity must be a non-negative integer'
      )
    }
  })
})
