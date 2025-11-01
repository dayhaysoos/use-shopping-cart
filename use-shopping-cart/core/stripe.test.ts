import { describe, it, expect, vi } from 'vitest'
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

  it('includes phone number collection when enabled', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      collectPhoneNumber: true
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.phoneNumberCollection).toEqual({ enabled: true })
  })

  it('does not include phone number collection when not enabled', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      collectPhoneNumber: false
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.phoneNumberCollection).toBeUndefined()
  })

  it('includes allow promotion codes when enabled', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      allowPromotionCodes: true
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.allowPromotionCodes).toBe(true)
  })

  it('includes automatic tax when enabled', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      automaticTax: true
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.automaticTax).toEqual({ enabled: true })
  })

  it('includes customer email when provided', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      customerEmail: 'test@example.com'
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.customerEmail).toBe('test@example.com')
  })

  it('includes consent collection for terms of service when required', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      requireTermsOfService: true
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.consentCollection).toEqual({
      termsOfService: 'required'
    })
  })

  it('includes custom text when provided', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      customText: {
        shippingAddress: 'Please provide accurate shipping address',
        submit: 'Complete your purchase',
        termsOfService: 'I agree to the terms'
      }
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.customText).toEqual({
      shipping_address: { message: 'Please provide accurate shipping address' },
      submit: { message: 'Complete your purchase' },
      terms_of_service_acceptance: { message: 'I agree to the terms' }
    })
  })

  it('includes partial custom text', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      customText: {
        submit: 'Buy now'
      }
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.customText).toEqual({
      submit: { message: 'Buy now' }
    })
  })

  it('includes custom fields when provided', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      customFields: [
        {
          key: 'gift_message',
          label: 'Gift Message',
          type: 'text',
          optional: true
        },
        {
          key: 'size',
          label: 'Size',
          type: 'dropdown',
          optional: false,
          dropdown: {
            options: [
              { label: 'Small', value: 's' },
              { label: 'Medium', value: 'm' },
              { label: 'Large', value: 'l' }
            ]
          }
        }
      ]
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.customFields).toHaveLength(2)
    expect(result.customFields![0]).toEqual({
      key: 'gift_message',
      label: { type: 'custom', custom: 'Gift Message' },
      type: 'text',
      optional: true
    })
    expect(result.customFields![1]).toEqual({
      key: 'size',
      label: { type: 'custom', custom: 'Size' },
      type: 'dropdown',
      optional: false,
      dropdown: {
        options: [
          { label: 'Small', value: 's' },
          { label: 'Medium', value: 'm' },
          { label: 'Large', value: 'l' }
        ]
      }
    })
  })

  it('includes shipping options with existing rate ID', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      shippingOptions: [
        {
          shippingRateId: 'shr_123456'
        }
      ]
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.shippingOptions).toHaveLength(1)
    expect(result.shippingOptions![0]).toEqual({
      shipping_rate: 'shr_123456'
    })
  })

  it('includes shipping options with inline rate data', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      currency: 'USD',
      shippingOptions: [
        {
          displayName: 'Standard Shipping',
          amount: 500,
          deliveryEstimate: {
            minimum: { unit: 'day', value: 5 },
            maximum: { unit: 'day', value: 7 }
          }
        },
        {
          displayName: 'Express Shipping',
          amount: 1500,
          deliveryEstimate: {
            minimum: { unit: 'day', value: 1 },
            maximum: { unit: 'day', value: 2 }
          }
        }
      ]
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.shippingOptions).toHaveLength(2)
    expect(result.shippingOptions![0]).toEqual({
      shipping_rate_data: {
        display_name: 'Standard Shipping',
        type: 'fixed_amount',
        fixed_amount: {
          amount: 500,
          currency: 'USD'
        },
        delivery_estimate: {
          minimum: { unit: 'day', value: 5 },
          maximum: { unit: 'day', value: 7 }
        }
      }
    })
    expect(result.shippingOptions![1]).toEqual({
      shipping_rate_data: {
        display_name: 'Express Shipping',
        type: 'fixed_amount',
        fixed_amount: {
          amount: 1500,
          currency: 'USD'
        },
        delivery_estimate: {
          minimum: { unit: 'day', value: 1 },
          maximum: { unit: 'day', value: 2 }
        }
      }
    })
  })

  it('handles mixed shipping options (rate ID and inline)', () => {
    const state = {
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      currency: 'USD',
      shippingOptions: [
        {
          shippingRateId: 'shr_existing'
        },
        {
          displayName: 'Custom Rate',
          amount: 1000
        }
      ]
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.shippingOptions).toHaveLength(2)
    expect(result.shippingOptions![0]).toEqual({
      shipping_rate: 'shr_existing'
    })
    expect(result.shippingOptions![1]).toEqual({
      shipping_rate_data: {
        display_name: 'Custom Rate',
        type: 'fixed_amount',
        fixed_amount: {
          amount: 1000,
          currency: 'USD'
        },
        delivery_estimate: undefined
      }
    })
  })

  it('handles all new features combined', () => {
    const state = {
      mode: 'payment',
      cartDetails: {
        price_123: {
          id: 'price_123',
          quantity: 1
        } as any
      },
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      currency: 'USD',
      billingAddressCollection: true,
      allowedCountries: ['US', 'CA'],
      collectPhoneNumber: true,
      allowPromotionCodes: true,
      automaticTax: true,
      customerEmail: 'customer@example.com',
      requireTermsOfService: true,
      customText: {
        submit: 'Complete purchase'
      },
      customFields: [
        {
          key: 'note',
          label: 'Order Note',
          type: 'text',
          optional: true
        }
      ],
      shippingOptions: [
        {
          displayName: 'Standard',
          amount: 500
        }
      ]
    } as unknown as CartState

    const result = getCheckoutData(state)
    expect(result.billingAddressCollection).toBe('required')
    expect(result.shippingAddressCollection).toEqual({
      allowedCountries: ['US', 'CA']
    })
    expect(result.phoneNumberCollection).toEqual({ enabled: true })
    expect(result.allowPromotionCodes).toBe(true)
    expect(result.automaticTax).toEqual({ enabled: true })
    expect(result.customerEmail).toBe('customer@example.com')
    expect(result.consentCollection).toEqual({ termsOfService: 'required' })
    expect(result.customText).toBeDefined()
    expect(result.customFields).toHaveLength(1)
    expect(result.shippingOptions).toHaveLength(1)
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

  it('shows deprecation warning for client-only mode', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {})

    const state = {
      stripe: 'pk_test_123',
      cartMode: 'client-only',
      mode: 'payment',
      cartDetails: {},
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    } as unknown as CartState

    // We expect this to throw because Stripe is not actually loaded
    // But the warning should still be called before the error
    try {
      await redirectToCheckout(state)
    } catch (error) {
      // Expected to fail in test environment
    }

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('DEPRECATED: client-only mode')
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('checkout-session mode instead')
    )

    consoleWarnSpy.mockRestore()
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
