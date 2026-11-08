import { describe, it, expect } from 'vitest'
import {
  withCartDetails,
  normalizeCartDetails,
  applyCartChange,
  type CartChange
} from './cartState'
import { initialState } from './ShoppingCart'
import type { CartDetails, CartState } from './types'

const usd: CartState = { ...initialState, currency: 'USD', language: 'en-US' }

describe('withCartDetails', () => {
  it('returns zero totals for an empty cart', () => {
    const state = withCartDetails({ ...usd, totalPrice: 999, cartCount: 9 }, {})

    expect(state.totalPrice).toBe(0)
    expect(state.cartCount).toBe(0)
    expect(state.formattedTotalPrice).toBe('$0.00')
  })

  it('derives totals from the entries, ignoring the previous totals', () => {
    const cartDetails: CartDetails = {
      'item-1': { id: 'item-1', quantity: 2, value: 200 } as any,
      'item-2': { id: 'item-2', quantity: 3, value: 300 } as any,
      'item-3': { id: 'item-3', quantity: 1, value: 50 } as any
    }

    const state = withCartDetails(
      { ...usd, totalPrice: 1, cartCount: 1 },
      cartDetails
    )

    expect(state.cartDetails).toBe(cartDetails)
    expect(state.totalPrice).toBe(550)
    expect(state.cartCount).toBe(6)
    expect(state.formattedTotalPrice).toBe('$5.50')
  })

  it('formats the total in the state currency and language', () => {
    const state = withCartDetails(
      { ...usd, currency: 'EUR', language: 'de-DE' },
      { a: { id: 'a', quantity: 1, value: 5000 } as any }
    )

    expect(state.formattedTotalPrice).toMatch(/50,00\s€/)
  })
})

describe('normalizeCartDetails', () => {
  it('rebuilds value and formatting from price and quantity', () => {
    const tampered: CartDetails = {
      a: {
        id: 'a',
        name: 'A',
        price: 100,
        quantity: 2,
        value: 999,
        currency: 'USD',
        formattedValue: 'wrong'
      } as any
    }

    const [entry] = Object.values(
      normalizeCartDetails(tampered, 'USD', 'en-US')
    )

    expect(entry.value).toBe(200)
    expect(entry.formattedValue).toBe('$2.00')
    expect(entry.formattedPrice).toBe('$1.00')
  })

  it('uses the cartDetails key as the entry id', () => {
    const result = normalizeCartDetails(
      {
        key: {
          id: 'other',
          name: 'A',
          price: 1,
          quantity: 1,
          currency: 'USD'
        } as any
      },
      'USD',
      'en-US'
    )

    expect(result.key.id).toBe('key')
  })

  it('keeps existing timestamps and adds one when missing', () => {
    const result = normalizeCartDetails(
      {
        old: {
          id: 'old',
          name: 'A',
          price: 1,
          quantity: 1,
          currency: 'USD',
          timestamp: '2020-01-01T00:00:00.000Z'
        } as any,
        fresh: {
          id: 'fresh',
          name: 'B',
          price: 1,
          quantity: 1,
          currency: 'USD'
        } as any
      },
      'USD',
      'en-US'
    )

    expect(result.old.timestamp).toBe('2020-01-01T00:00:00.000Z')
    expect(result.fresh.timestamp).toBeTruthy()
  })
})

describe('applyCartChange', () => {
  const format = { currency: 'USD', language: 'en-US' }
  const product = { id: 'a', name: 'A', price: 150, currency: 'USD' }

  it.each<[string, CartChange]>([
    [
      'adding it again',
      { type: 'add', id: 'a', product, count: 1, metadata: {} }
    ],
    ['adjusting its quantity', { type: 'adjust', id: 'a', by: 2 }],
    ['setting its quantity', { type: 'set', id: 'a', quantity: 5 }]
  ])('keeps when an item was added after %s', (_name, change) => {
    const added = applyCartChange(
      {},
      { type: 'add', id: 'a', product, count: 1, metadata: {} },
      format
    )
    const stamped = {
      a: { ...added.a, timestamp: '2020-01-01T00:00:00.000Z' }
    }

    const result = applyCartChange(stamped, change, format)

    expect(result.a.timestamp).toBe('2020-01-01T00:00:00.000Z')
  })
  const withA = applyCartChange(
    {},
    { type: 'add', id: 'a', product, count: 2, metadata: {} },
    format
  )

  it('adds a new entry with derived value and formatting', () => {
    expect(withA.a).toMatchObject({
      id: 'a',
      quantity: 2,
      value: 300,
      formattedValue: '$3.00',
      formattedPrice: '$1.50'
    })
  })

  it('adds to an existing entry and merges metadata', () => {
    const next = applyCartChange(
      withA,
      {
        type: 'add',
        id: 'a',
        product,
        count: 1,
        metadata: {
          price_metadata: { tax: 'incl' },
          product_metadata: { kind: 'x' }
        }
      },
      format
    )

    expect(next.a.quantity).toBe(3)
    expect(next.a.value).toBe(450)
    expect(next.a.price_data).toEqual({ metadata: { tax: 'incl' } })
    expect(next.a.product_data).toEqual({ metadata: { kind: 'x' } })
  })

  it('only takes price and product metadata from the add options', () => {
    const next = applyCartChange(
      {},
      {
        type: 'add',
        id: 'a',
        product,
        count: 1,
        metadata: { currency: 'EUR', language: 'de-DE' } as any
      },
      format
    )

    expect(next.a.formattedValue).toBe('$1.50')
  })

  it('adjusts quantity and removes the entry at zero or below', () => {
    expect(
      applyCartChange(withA, { type: 'adjust', id: 'a', by: 3 }, format).a.value
    ).toBe(750)
    expect(
      applyCartChange(withA, { type: 'adjust', id: 'a', by: -2 }, format)
    ).toEqual({})
  })

  it('sets quantity and removes the entry at zero', () => {
    expect(
      applyCartChange(withA, { type: 'set', id: 'a', quantity: 5 }, format).a
        .quantity
    ).toBe(5)
    expect(
      applyCartChange(withA, { type: 'set', id: 'a', quantity: 0 }, format)
    ).toEqual({})
  })

  it('removes and clears without mutating the input', () => {
    expect(applyCartChange(withA, { type: 'remove', id: 'a' }, format)).toEqual(
      {}
    )
    expect(applyCartChange(withA, { type: 'clear' }, format)).toEqual({})
    expect(withA.a).toBeDefined()
  })

  it('returns the same object for changes to ids not in the cart', () => {
    for (const change of [
      { type: 'adjust', id: 'missing', by: 1 },
      { type: 'set', id: 'missing', quantity: 2 },
      { type: 'remove', id: 'missing' }
    ] as const) {
      expect(applyCartChange(withA, change, format)).toBe(withA)
    }
  })
})
