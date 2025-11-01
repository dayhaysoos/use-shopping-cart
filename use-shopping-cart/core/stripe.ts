import '@stripe/stripe-js'
import type { CartState } from './types'

export interface CheckoutData {
  mode: 'payment' | 'subscription' | 'setup'
  lineItems: Array<{ price: string; quantity: number }>
  successUrl: string
  cancelUrl: string
  billingAddressCollection?: 'auto' | 'required'
  shippingAddressCollection?: { allowedCountries: string[] }
  submitType?: 'auto' | 'pay' | 'book' | 'donate'
}

export function getCheckoutData(state: CartState): CheckoutData {
  const lineItems: Array<{ price: string; quantity: number }> = []

  for (const sku in state.cartDetails) {
    lineItems.push({
      price: sku,
      quantity: state.cartDetails[sku].quantity
    })
  }

  const options: CheckoutData = {
    mode: state.mode,
    lineItems,
    successUrl: state.successUrl!,
    cancelUrl: state.cancelUrl!,
    submitType: 'auto'
  }

  if (state.billingAddressCollection) {
    options.billingAddressCollection = 'required'
  } else {
    options.billingAddressCollection = 'auto'
  }

  if (state.allowedCountries?.length) {
    options.shippingAddressCollection = {
      allowedCountries: state.allowedCountries
    }
  }

  return options
}

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

export async function redirectToCheckout(
  state: CartState,
  sessionId?: string
): Promise<{ error: any } | undefined> {
  if (
    !state.stripe ||
    typeof state.stripe !== 'string' ||
    state.stripe.length === 0
  ) {
    throw new Error('Stripe public key not configured')
  }

  if (state.cartMode === 'checkout-session') {
    if (!sessionId) {
      throw new Error('sessionId required for checkout-session mode')
    }
  }

  if (
    state.cartMode !== 'checkout-session' &&
    state.cartMode !== 'client-only'
  ) {
    throw new Error(
      `Invalid cartMode: ${state.cartMode}. Expected 'client-only' or 'checkout-session'`
    )
  }

  const stripe = initializeStripe(state.stripe)

  if (state.cartMode === 'checkout-session') {
    return stripe.redirectToCheckout({ sessionId: sessionId! })
  } else {
    const checkoutData = getCheckoutData(state)
    return stripe.redirectToCheckout(checkoutData as any)
  }
}

export async function checkoutSingleItem(
  state: CartState,
  itemOrPriceId: string | { price?: string; sku?: string; quantity?: number }
): Promise<{ error: any } | undefined> {
  if (!state.stripe) {
    throw new Error('Stripe public key not configured')
  }

  if (state.cartMode !== 'client-only') {
    throw new Error('checkoutSingleItem only works in client-only mode')
  }

  const stripe = initializeStripe(state.stripe)
  const quantity =
    typeof itemOrPriceId === 'object' ? itemOrPriceId.quantity ?? 1 : 1

  const checkoutData: any = {
    mode: state.mode,
    successUrl: state.successUrl,
    cancelUrl: state.cancelUrl
  }

  if (typeof itemOrPriceId === 'string') {
    checkoutData.lineItems = [{ price: itemOrPriceId, quantity }]
  } else if (itemOrPriceId.price) {
    checkoutData.lineItems = [{ price: itemOrPriceId.price, quantity }]
  } else if (itemOrPriceId.sku) {
    checkoutData.items = [{ sku: itemOrPriceId.sku, quantity }]
  }

  return stripe.redirectToCheckout(checkoutData as any)
}
