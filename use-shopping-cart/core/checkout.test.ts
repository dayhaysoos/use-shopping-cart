import { describe, it, expect, vi, afterEach } from 'vitest'
import { redirectToCheckout } from './checkout'
import { isCartError } from './errors'
import * as core from './index'
import * as react from '../react/index'

function codeOf(fn: () => unknown) {
  try {
    fn()
  } catch (error) {
    expect(isCartError(error)).toBe(true)
    return (error as { code: string }).code
  }
  throw new Error('expected a throw')
}

describe('redirectToCheckout', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('sends the browser to the session URL', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })

    redirectToCheckout(' https://checkout.stripe.com/c/pay/cs_test_123 ')

    expect(assign).toHaveBeenCalledWith(
      'https://checkout.stripe.com/c/pay/cs_test_123'
    )
  })

  it.each([
    ['a session ID', 'cs_test_123'],
    ['an empty string', ''],
    ['a non-string', undefined],
    ['a javascript: URL', 'javascript:alert(1)']
  ])('rejects %s with INVALID_CHECKOUT_URL', (_name, input) => {
    expect(codeOf(() => redirectToCheckout(input as string))).toBe(
      'INVALID_CHECKOUT_URL'
    )
  })

  it('tells callers passing a session ID to pass session.url', () => {
    expect(() => redirectToCheckout('cs_test_123')).toThrow('session.url')
  })

  it('throws NOT_IN_BROWSER on the server', () => {
    vi.stubGlobal('window', undefined)
    expect(
      codeOf(() => redirectToCheckout('https://checkout.stripe.com/c/pay/x'))
    ).toBe('NOT_IN_BROWSER')
  })

  it('is exported from use-shopping-cart and /core', () => {
    expect(core.redirectToCheckout).toBe(redirectToCheckout)
    expect(react.redirectToCheckout).toBe(redirectToCheckout)
  })
})

describe('ShoppingCart has no Stripe surface', () => {
  it('has no redirectToCheckout, changeStripeKey or stripe state', () => {
    const cart = new core.ShoppingCart({ shouldPersist: false })
    expect('redirectToCheckout' in cart).toBe(false)
    expect('changeStripeKey' in cart).toBe(false)
    expect(cart.getState()).not.toHaveProperty('stripe')
  })
})
