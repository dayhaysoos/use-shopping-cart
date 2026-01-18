import { describe, it, expect } from 'vitest'
import {
  validateCount,
  validateQuantity,
  validateItemExists,
  validateProduct,
  ValidationError
} from './validation'

describe('validateCount', () => {
  it('throws on non-number', () => {
    expect(() => validateCount('5', 'addItem')).toThrow(ValidationError)
    expect(() => validateCount('5', 'addItem')).toThrow('finite number')
  })

  it('throws on non-integer', () => {
    expect(() => validateCount(1.5, 'addItem')).toThrow(ValidationError)
    expect(() => validateCount(1.5, 'addItem')).toThrow('integer')
  })

  it('throws on infinite', () => {
    expect(() => validateCount(Infinity, 'addItem')).toThrow(ValidationError)
    expect(() => validateCount(Infinity, 'addItem')).toThrow('finite number')
  })

  it('throws on zero', () => {
    expect(() => validateCount(0, 'addItem')).toThrow(ValidationError)
    expect(() => validateCount(0, 'addItem')).toThrow('greater than 0')
  })

  it('throws on negative', () => {
    expect(() => validateCount(-1, 'addItem')).toThrow(ValidationError)
    expect(() => validateCount(-1, 'addItem')).toThrow('greater than 0')
  })

  it('accepts valid count', () => {
    expect(() => validateCount(1, 'addItem')).not.toThrow()
    expect(() => validateCount(5, 'addItem')).not.toThrow()
    expect(() => validateCount(100, 'incrementItem')).not.toThrow()
  })

  it('includes action name in error message', () => {
    expect(() => validateCount('bad', 'incrementItem')).toThrow(/incrementItem/)
  })
})

describe('validateQuantity', () => {
  it('throws on non-number', () => {
    expect(() => validateQuantity('5', 'setItemQuantity')).toThrow(
      ValidationError
    )
    expect(() => validateQuantity('5', 'setItemQuantity')).toThrow(
      'finite number'
    )
  })

  it('throws on non-integer', () => {
    expect(() => validateQuantity(2.5, 'setItemQuantity')).toThrow(
      ValidationError
    )
    expect(() => validateQuantity(2.5, 'setItemQuantity')).toThrow('integer')
  })

  it('throws on infinite', () => {
    expect(() => validateQuantity(Infinity, 'setItemQuantity')).toThrow(
      ValidationError
    )
    expect(() => validateQuantity(Infinity, 'setItemQuantity')).toThrow(
      'finite number'
    )
  })

  it('throws on negative', () => {
    expect(() => validateQuantity(-1, 'setItemQuantity')).toThrow(
      ValidationError
    )
    expect(() => validateQuantity(-1, 'setItemQuantity')).toThrow(
      'greater than or equal to 0'
    )
  })

  it('accepts zero', () => {
    expect(() => validateQuantity(0, 'setItemQuantity')).not.toThrow()
  })

  it('accepts positive numbers', () => {
    expect(() => validateQuantity(1, 'setItemQuantity')).not.toThrow()
    expect(() => validateQuantity(10, 'setItemQuantity')).not.toThrow()
  })

  it('includes action name in error message', () => {
    expect(() => validateQuantity('bad', 'setItemQuantity')).toThrow(
      /setItemQuantity/
    )
  })
})

describe('validateItemExists', () => {
  const cartDetails = {
    item1: { id: 'item1' } as any,
    item2: { id: 'item2' } as any
  }

  it('throws when item does not exist', () => {
    expect(() =>
      validateItemExists('item3', cartDetails, 'removeItem')
    ).toThrow(ValidationError)
    expect(() =>
      validateItemExists('item3', cartDetails, 'removeItem')
    ).toThrow('must already be in the cart')
  })

  it('does not throw when item exists', () => {
    expect(() =>
      validateItemExists('item1', cartDetails, 'removeItem')
    ).not.toThrow()
    expect(() =>
      validateItemExists('item2', cartDetails, 'incrementItem')
    ).not.toThrow()
  })

  it('includes item ID and action name in error message', () => {
    expect(() =>
      validateItemExists('missing', cartDetails, 'decrementItem')
    ).toThrow(/missing/)
    expect(() =>
      validateItemExists('missing', cartDetails, 'decrementItem')
    ).toThrow(/decrementItem/)
  })
})

describe('validateProduct', () => {
  it('throws when product is not an object', () => {
    expect(() => validateProduct(null)).toThrow(ValidationError)
    expect(() => validateProduct(undefined)).toThrow('must be an object')
    expect(() => validateProduct('string')).toThrow('must be an object')
    expect(() => validateProduct(123)).toThrow('must be an object')
  })

  it('throws when price is missing or not a number', () => {
    expect(() => validateProduct({ name: 'Test', currency: 'USD' })).toThrow(
      'price must be a number'
    )
    expect(() =>
      validateProduct({ name: 'Test', currency: 'USD', price: '100' })
    ).toThrow('price must be a number')
  })

  it('throws when currency is missing or not a string', () => {
    expect(() => validateProduct({ name: 'Test', price: 100 })).toThrow(
      'currency must be a string'
    )
    expect(() =>
      validateProduct({ name: 'Test', price: 100, currency: 123 })
    ).toThrow('currency must be a string')
  })

  it('throws when name is missing or not a string', () => {
    expect(() => validateProduct({ price: 100, currency: 'USD' })).toThrow(
      'name must be a string'
    )
    expect(() =>
      validateProduct({ name: 123, price: 100, currency: 'USD' })
    ).toThrow('name must be a string')
  })

  it('accepts valid product', () => {
    expect(() =>
      validateProduct({
        name: 'Test Product',
        price: 100,
        currency: 'USD'
      })
    ).not.toThrow()

    expect(() =>
      validateProduct({
        id: '123',
        name: 'Test Product',
        price: 100,
        currency: 'USD',
        description: 'A test product'
      })
    ).not.toThrow()
  })
})
