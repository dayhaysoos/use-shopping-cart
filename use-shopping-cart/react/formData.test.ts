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
    ]
  ])('rejects %j with "%s"', (fields, message) => {
    expect(() => decodeAddItem(form(fields))).toThrow(message)
  })

  it('leaves range checks on the count to the cart', () => {
    expect(
      decodeAddItem(form({ product: JSON.stringify(product), count: '1.5' }))
        .count
    ).toBe(1.5)
  })

  it('rejects a count that is a file as form data, not as a count', () => {
    const formData = form({ product: JSON.stringify(product) })
    formData.set('count', new Blob(['3']))
    expect(() => decodeAddItem(formData)).toThrow(
      expect.objectContaining({ code: 'INVALID_FORM_DATA' })
    )
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
      'Quantity is required'
    )
    expect(() => decodeQuantity(form({ quantity: '2' }))).toThrow(
      'Item ID is required'
    )
  })

  it('leaves range checks on the quantity to the cart', () => {
    expect(decodeQuantity(form({ itemId: 'a', quantity: '-1' })).quantity).toBe(
      -1
    )
  })
})
