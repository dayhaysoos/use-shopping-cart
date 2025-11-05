import '@stripe/stripe-js'
import type { CartState } from './types'

function initializeStripe(publicKey: string) {
  if (typeof window === 'undefined') {
    throw new Error('Stripe can only be initialized on the client')
  }

  try {
    // @ts-ignore - Stripe is loaded via script tag
    const stripe = window.Stripe(publicKey)

    stripe.registerAppInfo({
      name: 'use-shopping-cart',
      version: process.env.__buildVersion__,
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

  if (!sessionId) {
    throw new Error('sessionId is required')
  }

  const stripe = initializeStripe(state.stripe)
  return stripe.redirectToCheckout({ sessionId })
}
