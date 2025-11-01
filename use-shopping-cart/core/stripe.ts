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
  phoneNumberCollection?: { enabled: boolean }
  allowPromotionCodes?: boolean
  automaticTax?: { enabled: boolean }
  customerEmail?: string
  consentCollection?: {
    termsOfService?: 'required'
    promotions?: 'auto'
  }
  customText?: Record<string, { message: string }>
  customFields?: Array<any>
  shippingOptions?: Array<any>
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

  // NEW - Phone number collection
  if (state.collectPhoneNumber) {
    options.phoneNumberCollection = { enabled: true }
  }

  // NEW - Promotion codes
  if (state.allowPromotionCodes) {
    options.allowPromotionCodes = true
  }

  // NEW - Automatic tax
  if (state.automaticTax) {
    options.automaticTax = { enabled: true }
  }

  // NEW - Customer email
  if (state.customerEmail) {
    options.customerEmail = state.customerEmail
  }

  // NEW - Terms of service
  if (state.requireTermsOfService) {
    options.consentCollection = {
      termsOfService: 'required'
    }
  }

  // NEW - Custom text
  if (state.customText) {
    const customText: Record<string, { message: string }> = {}
    if (state.customText.shippingAddress) {
      customText.shipping_address = {
        message: state.customText.shippingAddress
      }
    }
    if (state.customText.submit) {
      customText.submit = { message: state.customText.submit }
    }
    if (state.customText.termsOfService) {
      customText.terms_of_service_acceptance = {
        message: state.customText.termsOfService
      }
    }
    options.customText = customText
  }

  // NEW - Custom fields
  if (state.customFields?.length) {
    options.customFields = state.customFields.map((field) => ({
      key: field.key,
      label: { type: 'custom', custom: field.label },
      type: field.type,
      optional: field.optional ?? false,
      ...(field.dropdown && { dropdown: field.dropdown })
    }))
  }

  // NEW - Shipping options
  if (state.shippingOptions?.length) {
    options.shippingOptions = state.shippingOptions.map((opt) => {
      if (opt.shippingRateId) {
        return { shipping_rate: opt.shippingRateId }
      } else {
        return {
          shipping_rate_data: {
            display_name: opt.displayName!,
            type: 'fixed_amount',
            fixed_amount: {
              amount: opt.amount!,
              currency: state.currency
            },
            delivery_estimate: opt.deliveryEstimate
          }
        }
      }
    })
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

  // Deprecation warning for client-only mode
  if (state.cartMode === 'client-only') {
    console.warn(
      '⚠️ DEPRECATED: client-only mode is deprecated by Stripe. ' +
        'Use checkout-session mode instead. ' +
        'See: https://docs.stripe.com/payments/checkout/how-checkout-works'
    )
  }

  const stripe = initializeStripe(state.stripe)

  if (state.cartMode === 'checkout-session') {
    return stripe.redirectToCheckout({ sessionId: sessionId! })
  } else {
    const checkoutData = getCheckoutData(state)
    // @ts-expect-error - Our CheckoutData extends Stripe's types with additional modern fields
    return stripe.redirectToCheckout(checkoutData)
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

  const checkoutData: {
    mode: 'payment' | 'subscription' | 'setup'
    successUrl?: string
    cancelUrl?: string
    lineItems?: Array<{ price: string; quantity: number }>
    items?: Array<{ sku: string; quantity: number }>
  } = {
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

  // @ts-expect-error - Our checkout data is compatible with Stripe's RedirectToCheckoutOptions
  return stripe.redirectToCheckout(checkoutData)
}
