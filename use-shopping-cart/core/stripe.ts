import type { Stripe as StripeType } from '@stripe/stripe-js'
import type { CartState, RedirectToCheckoutInput } from './types'

type RedirectToCheckoutOptions = {
  sessionId?: string
  sessionUrl?: string
}

type StripeLegacyRedirect = StripeType & {
  redirectToCheckout: (options: { sessionId: string }) => Promise<
    | {
        error: any
      }
    | undefined
  >
}

const checkoutUrlPattern = /^https?:\/\//i

function resolveCheckoutRedirectInput(
  input: RedirectToCheckoutInput
): RedirectToCheckoutOptions {
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) return {}
    if (checkoutUrlPattern.test(trimmed)) return { sessionUrl: trimmed }
    return { sessionId: trimmed }
  }

  if (!input) return {}

  const sessionUrl =
    typeof input.sessionUrl === 'string' && input.sessionUrl.trim().length > 0
      ? input.sessionUrl
      : undefined
  const sessionId =
    typeof input.sessionId === 'string' && input.sessionId.trim().length > 0
      ? input.sessionId
      : undefined

  return {
    sessionId,
    sessionUrl
  }
}

function hasLegacyRedirect(stripe: StripeType): stripe is StripeLegacyRedirect {
  return (
    typeof (stripe as StripeLegacyRedirect).redirectToCheckout === 'function'
  )
}

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Checkout redirects can only be initiated in the browser')
  }
}

function initializeStripe(publicKey: string): StripeType {
  if (typeof window === 'undefined') {
    throw new Error('Stripe can only be initialized on the client')
  }

  if (!window.Stripe) {
    throw new Error(
      'Stripe.js has not been loaded. Make sure to include the Stripe.js script tag.'
    )
  }

  try {
    const stripe = window.Stripe(publicKey)

    stripe.registerAppInfo({
      name: 'use-shopping-cart',
      version: process.env.__buildVersion__ as string | undefined,
      url: 'https://useshoppingcart.com',
      partner_id: 'pp_partner_H8MLmI3e9Oc3IK'
    })

    return stripe
  } catch (error) {
    console.error('Unable to initialize Stripe.')
    throw error
  }
}

/**
 * Redirects to Stripe checkout with a session URL (preferred) or legacy session ID.
 *
 * @param state - Cart state containing the Stripe publishable key (sessionId only)
 * @param input - Session URL (session.url) or a legacy session ID
 * @returns Promise that resolves when redirect starts, or an error object
 */
export async function redirectToCheckout(
  state: CartState,
  input: RedirectToCheckoutInput
): Promise<{ error: any } | undefined> {
  const { sessionId, sessionUrl } = resolveCheckoutRedirectInput(input)

  if (!sessionId && !sessionUrl) {
    throw new Error('sessionUrl or sessionId is required')
  }

  if (sessionUrl) {
    assertBrowser()
    window.location.assign(sessionUrl)
    return
  }

  if (!sessionId) {
    throw new Error('sessionUrl or sessionId is required')
  }

  if (
    !state.stripe ||
    typeof state.stripe !== 'string' ||
    state.stripe.length === 0
  ) {
    throw new Error('Stripe publishable key not configured')
  }

  if (
    !state.stripe.startsWith('pk_test_') &&
    !state.stripe.startsWith('pk_live_')
  ) {
    throw new Error(
      'Invalid Stripe publishable key format. Key must start with pk_test_ or pk_live_'
    )
  }

  const stripe = initializeStripe(state.stripe)
  if (!hasLegacyRedirect(stripe)) {
    throw new Error(
      'Stripe.js redirectToCheckout is not available. Pass sessionUrl instead.'
    )
  }

  return stripe.redirectToCheckout({ sessionId })
}
