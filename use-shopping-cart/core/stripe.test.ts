import { describe, it, expect } from 'vitest'
import { redirectToCheckout } from './stripe'
import type { CartState } from './types'

describe('redirectToCheckout', () => {
  it('throws when stripe key not configured', async () => {
    const state = {} as unknown as CartState

    await expect(redirectToCheckout(state, 'sess_123')).rejects.toThrow(
      'Stripe publishable key not configured'
    )
  })

  it('throws when stripe key is empty', async () => {
    const state = {
      stripe: ''
    } as unknown as CartState

    await expect(redirectToCheckout(state, 'sess_123')).rejects.toThrow(
      'Stripe publishable key not configured'
    )
  })

  it('throws when session input is missing', async () => {
    const state = {
      stripe: 'pk_test_123'
    } as unknown as CartState

    await expect(redirectToCheckout(state, '' as any)).rejects.toThrow(
      'sessionUrl or sessionId is required'
    )
  })

  it('throws when session input is undefined', async () => {
    const state = {
      stripe: 'pk_test_123'
    } as unknown as CartState

    await expect(redirectToCheckout(state, undefined as any)).rejects.toThrow(
      'sessionUrl or sessionId is required'
    )
  })
})
