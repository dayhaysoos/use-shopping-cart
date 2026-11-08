import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CartError, isCartError, type CartErrorCode } from './errors'
import { ShoppingCart } from './ShoppingCart'
import { validateCartItems } from '../utilities/serverless'
import { decodeAddItem, decodeItemId, decodeQuantity } from '../react/formData'
import * as core from './index'
import * as react from '../react/index'
import * as utilities from '../utilities/serverless'
import { createElement } from 'react'
import { render } from '@testing-library/react'
import { useCartContext } from '../react/cartContext'

function codeOf(fn: () => unknown): CartErrorCode | undefined {
  try {
    fn()
  } catch (error) {
    expect(isCartError(error)).toBe(true)
    return (error as CartError).code
  }
  throw new Error('expected a throw')
}

function form(fields: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

const product = { id: 'a', name: 'A', price: 100, currency: 'USD' }

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('CartError', () => {
  it('is an Error with a name, message and code', () => {
    const error = new CartError('INVALID_COUNT', 'bad count')
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('CartError')
    expect(error.message).toBe('bad count')
    expect(error.code).toBe('INVALID_COUNT')
  })

  it('isCartError recognises CartErrors from another copy of the package', () => {
    const foreign = Object.assign(new Error('x'), {
      name: 'CartError',
      code: 'INVALID_COUNT'
    })
    expect(isCartError(foreign)).toBe(true)
    expect(isCartError(new Error('x'))).toBe(false)
    expect(isCartError('INVALID_COUNT')).toBe(false)
    expect(isCartError(null)).toBe(false)
  })

  it('is exported from every entry point', () => {
    expect(core.CartError).toBe(CartError)
    expect(core.isCartError).toBe(isCartError)
    expect(react.CartError).toBe(CartError)
    expect(react.isCartError).toBe(isCartError)
    expect(utilities.CartError).toBe(CartError)
    expect(utilities.isCartError).toBe(isCartError)
  })
})

describe('useCartContext outside a provider', () => {
  it('throws NO_CART_PROVIDER', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Orphan() {
      useCartContext()
      return null
    }
    expect(codeOf(() => render(createElement(Orphan)))).toBe('NO_CART_PROVIDER')
  })
})

describe('ShoppingCart error codes', () => {
  const cart = () => {
    const c = new ShoppingCart({ shouldPersist: false })
    c.addItem(product)
    return c
  }

  it.each<[string, (c: ShoppingCart) => void, CartErrorCode]>([
    [
      'addItem without a price',
      (c) => c.addItem({ ...product, price: 'x' as any }),
      'INVALID_PRODUCT'
    ],
    [
      'addItem with a non-object',
      (c) => c.addItem(null as any),
      'INVALID_PRODUCT'
    ],
    [
      'addItem with count 0',
      (c) => c.addItem(product, { count: 0 }),
      'INVALID_COUNT'
    ],
    [
      'incrementItem with count 1.5',
      (c) => c.incrementItem('a', { count: 1.5 }),
      'INVALID_COUNT'
    ],
    [
      'decrementItem with a string count',
      (c) => c.decrementItem('a', { count: '1' as any }),
      'INVALID_COUNT'
    ],
    [
      'setItemQuantity with -1',
      (c) => c.setItemQuantity('a', -1),
      'INVALID_QUANTITY'
    ],
    [
      'incrementItem on a missing item',
      (c) => c.incrementItem('missing'),
      'ITEM_NOT_IN_CART'
    ],
    [
      'removeItem on a missing item',
      (c) => c.removeItem('missing'),
      'ITEM_NOT_IN_CART'
    ],
    [
      'loadCart with an entry it cannot rebuild',
      (c) => c.loadCart({ b: { id: 'b' } } as any),
      'INVALID_CART'
    ]
  ])('%s → %s', (_name, act, code) => {
    expect(codeOf(() => act(cart()))).toBe(code)
  })
})

describe('form decoding error codes', () => {
  it.each<[string, () => unknown, CartErrorCode]>([
    ['missing product', () => decodeAddItem(form({})), 'INVALID_FORM_DATA'],
    [
      'oversized product',
      () => decodeAddItem(form({ product: 'x'.repeat(60_000) })),
      'INVALID_FORM_DATA'
    ],
    [
      'invalid JSON',
      () => decodeAddItem(form({ product: '{' })),
      'INVALID_FORM_DATA'
    ],
    [
      'invalid product',
      () => decodeAddItem(form({ product: '{"name":"A"}' })),
      'INVALID_PRODUCT'
    ],
    ['missing itemId', () => decodeItemId(form({})), 'INVALID_FORM_DATA'],
    [
      'missing quantity',
      () => decodeQuantity(form({ itemId: 'a' })),
      'INVALID_FORM_DATA'
    ]
  ])('%s → %s', (_name, act, code) => {
    expect(codeOf(act)).toBe(code)
  })
})

describe('validateCartItems error codes', () => {
  const entry = { ...product, quantity: 1, value: 100, formattedValue: '$1.00' }

  it.each<[string, () => unknown, CartErrorCode]>([
    [
      'non-iterable inventory',
      () => validateCartItems(5 as any, {}),
      'INVALID_INVENTORY'
    ],
    [
      'non-object inventory item',
      () => validateCartItems([null as any], {}),
      'INVALID_INVENTORY'
    ],
    [
      'non-object cartDetails',
      () => validateCartItems([product], null as any),
      'INVALID_CART'
    ],
    [
      'non-object cart entry',
      () => validateCartItems([product], { a: null as any }),
      'INVALID_CART'
    ],
    [
      'unknown product',
      () => validateCartItems([product], { b: entry }),
      'NOT_IN_INVENTORY'
    ],
    [
      'bad quantity',
      () => validateCartItems([product], { a: { ...entry, quantity: 0 } }),
      'INVALID_QUANTITY'
    ]
  ])('%s → %s', (_name, act, code) => {
    expect(codeOf(act)).toBe(code)
  })
})
