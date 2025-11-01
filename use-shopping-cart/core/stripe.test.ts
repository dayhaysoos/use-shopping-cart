import { describe, it, expect } from 'vitest'
import {
  getCheckoutData,
  redirectToCheckout,
  checkoutSingleItem
} from './stripe'
import type { CartState } from './types'

describe('getCheckoutData', () => {
  it('generates checkout data from cart state', () => {
    const state = {
      mode: 'payment',
      cartDetails: {
        price_123: {
          id: 'price_123',
          quantity: 2
        } as any,
        price_456: {
          id: 'price_456',
          quantity: 1
        } as any
      },
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      billingAddressCollection: false
    } as unknown as CartState

    const result = getCheckoutData(state)

    expect(result.mode).toBe('payment')
    expect(result.lineItems).toHaveLength(2)
    expect(result.lineItems).toContainEqual({ price: 'price_123', quantity: 2 })
    expect(result.lineItems).toContainEqual({ price: 'price_456', quantity: 1 })
    expect(result.successUrl).toBe('https://example.com/success')
    expect(result.cancelUrl).toBe('https://example.com/cancel')
    expect(result.billingAddressCollection).toBe('auto')
    expect(result.submitType).toBe('auto')
  })

  it('sets billing address collection to required when enabled', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      billingAddressCollection: true
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.billingAddressCollection).toBe('required')
  })

  it('includes shipping address collection when allowed countries specified', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      allowedCountries: ['US', 'CA']
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.shippingAddressCollection).toEqual({
      allowedCountries: ['US', 'CA']
    })
  })
})

describe('redirectToCheckout', () => {
  it('throws when stripe key not configured', async () => {
    const state = {
      cartMode: 'checkout-session'
    } as unknown as CartState

    await expect(redirectToCheckout(state)).rejects.toThrow(
      'Stripe public key not configured'
    )
  })

  it('throws when stripe key is empty', async () => {
    const state = {
      stripe: '',
      cartMode: 'checkout-session'
    } as unknown as CartState

    await expect(redirectToCheckout(state)).rejects.toThrow(
      'Stripe public key not configured'
    )
  })

  it('throws when sessionId missing in checkout-session mode', async () => {
    const state = {
      stripe: 'pk_test_123',
      cartMode: 'checkout-session'
    } as unknown as CartState

    await expect(redirectToCheckout(state)).rejects.toThrow(
      'sessionId required'
    )
  })

  it('throws for invalid cartMode', async () => {
    const state = {
      stripe: 'pk_test_123',
      cartMode: 'invalid' as any
    } as unknown as CartState

    await expect(redirectToCheckout(state)).rejects.toThrow('Invalid cartMode')
  })
})

describe('checkoutSingleItem', () => {
  it('throws when stripe key not configured', async () => {
    const state = {
      cartMode: 'client-only'
    } as unknown as CartState

    await expect(checkoutSingleItem(state, 'price_123')).rejects.toThrow(
      'Stripe public key not configured'
    )
  })

  it('throws when not in client-only mode', async () => {
    const state = {
      stripe: 'pk_test_123',
      cartMode: 'checkout-session'
    } as unknown as CartState

    await expect(checkoutSingleItem(state, 'price_123')).rejects.toThrow(
      'only works in client-only mode'
    )
  })
})
