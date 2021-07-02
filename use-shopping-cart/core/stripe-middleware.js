import { getCheckoutData } from '../utilities/old-utils'
import '@stripe/stripe-js'

export const handleStripe = (store) => (next) => async (action) => {
  const stripePublicKey = store.getState().stripe
  const cart = store.getState()

  if (action.type === 'cart/redirectToCheckout') {
    const stripe = initializeStripe(stripePublicKey)
    if (cart.cartMode === 'checkout-session') {
      return stripe.redirectToCheckout({
        sessionId: action.payload.sessionId
      })
    }

    if (cart.cartMode === 'client-only') {
      const checkoutData = getCheckoutData(cart)
      return stripe.redirectToCheckout(checkoutData)
    }

    throw new Error(`Invalid checkout mode '${cart.cartMode}' was chosen. Valid modes are: 'client-only' or 'checkout-session'.`)
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
      stripe.redirectToCheckout(options)
      return
    }

    throw new Error(`Invalid checkout mode '${cart.cartMode}' was chosen. Valid modes are: 'client-only'.`)
  }

  return next(action)
}

function initializeStripe(publicKey) {
  try {
    // eslint-disable-next-line no-undef
    const stripe = Stripe(publicKey)
    stripe.registerAppInfo({
      name: 'use-shopping-cart',
      version: '3.0.0-beta.15',
      url: 'https://useshoppingcart.com',
      // eslint-disable-next-line camelcase
      partner_id: 'pp_partner_H8MLmI3e9Oc3IK'
    })
    return stripe
  } catch (error) {
    console.log('error', error)
  }
}
