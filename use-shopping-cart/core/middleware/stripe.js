import '@stripe/stripe-js'
import {
  typeOf,
  PropertyTypeError,
  PropertyValueError,
  PropertyRangeError
} from './helpers'

export function getCheckoutData(cart) {
  const lineItems = []
  for (const sku in cart.cartDetails)
    lineItems.push({ price: sku, quantity: cart.cartDetails[sku].quantity })

  const options = {
    mode: cart.mode,
    lineItems,
    successUrl: cart.successUrl,
    cancelUrl: cart.cancelUrl,
    billingAddressCollection: cart.billingAddressCollection
      ? 'required'
      : 'auto',
    submitType: 'auto'
  }

  if (cart.allowedCountries?.length) {
    options.shippingAddressCollection = {
      allowedCountries: cart.allowedCountries
    }
  }

  return options
}

export const handleStripe = (store) => (next) => async (action) => {
  const stripePublicKey = store.getState().stripe
  const cart = store.getState()

  const checkout = ['cart/redirectToCheckout', 'cart/checkoutSingleItem']
  if (checkout.includes(action.type)) {
    if (typeof stripePublicKey !== 'string') {
      throw new PropertyTypeError({
        property: 'stripe',
        expected: 'string',
        received: typeOf(stripePublicKey)
      })
    } else if (stripePublicKey.length === 0) {
      throw new PropertyRangeError({
        property: 'stripe.length',
        above: 0,
        received: stripePublicKey.length
      })
    }
  }

  if (action.type === 'cart/redirectToCheckout') {
    const stripe = initializeStripe(stripePublicKey)
    if (cart.cartMode === 'checkout-session') {
      return stripe.redirectToCheckout({
        sessionId: action.payload.sessionId
      })
    } else if (cart.cartMode === 'client-only') {
      const checkoutData = getCheckoutData(cart)
      return stripe.redirectToCheckout(checkoutData)
    } else {
      throw new PropertyValueError({
        property: 'cartMode',
        method: 'redirectToCheckout',
        expected: ['client-only', 'checkout-session'],
        received: cart.cartMode
      })
    }
  } else if (action.type === 'cart/checkoutSingleItem') {
    const stripe = initializeStripe(stripePublicKey)

    if (cart.cartMode === 'client-only') {
      const options = {
        mode: cart.mode,
        successUrl: cart.successUrl,
        cancelUrl: cart.cancelUrl,
        ...action.payload.cartItems
      }
      return stripe.redirectToCheckout(options)
    } else {
      throw new PropertyValueError({
        property: 'cartMode',
        method: 'checkoutSingleItem',
        expected: 'client-only',
        received: cart.cartMode
      })
    }
  }

  return next(action)
}

function initializeStripe(publicKey) {
  try {
    // eslint-disable-next-line no-undef
    const stripe = Stripe(publicKey)
    stripe.registerAppInfo({
      name: 'use-shopping-cart',
      version: process.env.__buildVersion__,
      url: 'https://useshoppingcart.com',
      // eslint-disable-next-line camelcase
      partner_id: 'pp_partner_H8MLmI3e9Oc3IK'
    })
    return stripe
  } catch (error) {
    console.error('Unable to initialize Stripe.')
    throw error
  }
}
