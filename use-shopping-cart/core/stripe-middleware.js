import '@stripe/stripe-js'
import pkg from '../package.json'

export function getCheckoutData(cart) {
  const lineItems = []
  for (const sku in cart.cartDetails)
    lineItems.push({ price: sku, quantity: cart.cartDetails[sku].quantity })

  const options = {
    mode: 'payment',
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
  if (typeof stripePublicKey !== 'string') {
    throw new TypeError(
      `The Stripe public key must be a string, a '${typeof stripePublicKey}' was passed instead.`
    )
  } else if (stripePublicKey.length === 0) {
    throw new TypeError('The Stripe public key cannot be empty.')
  }

  const cart = store.getState()

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
      throw new TypeError(
        `Invalid checkout mode '${cart.cartMode}' was chosen. Valid modes are: 'client-only' or 'checkout-session'.`
      )
    }
  }

  if (action.type === 'cart/checkoutSingleItem') {
    const stripe = initializeStripe(stripePublicKey)

    if (cart.cartMode === 'client-only') {
      const productId = action.payload.productId
      const options = {
        mode: cart.mode,
        successUrl: cart.successUrl,
        cancelUrl: cart.cancelUrl,
        lineItems: [{ price: productId, quantity: 1 }]
      }
      return stripe.redirectToCheckout(options)
    } else {
      throw new TypeError(
        `Invalid checkout mode '${cart.cartMode}' was chosen. Valid modes are: 'client-only'.`
      )
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
      version: pkg.version,
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
