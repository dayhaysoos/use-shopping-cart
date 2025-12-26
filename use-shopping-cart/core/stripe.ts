import type { Stripe as StripeType } from '@stripe/stripe-js'
import type { CartState } from './types'

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
 * Redirects to Stripe checkout with a server-created session ID.
 *
 * @param state - Cart state containing the Stripe publishable key
 * @param sessionId - The session ID returned from your server endpoint
 * @returns Promise that resolves when redirect starts, or an error object
 */
export async function redirectToCheckout(
  state: CartState,
  sessionId: string
): Promise<{ error: any } | undefined> {
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

  if (!sessionId) {
    throw new Error('sessionId is required')
  }

  const stripe = initializeStripe(state.stripe)
  return stripe.redirectToCheckout({ sessionId })
}
