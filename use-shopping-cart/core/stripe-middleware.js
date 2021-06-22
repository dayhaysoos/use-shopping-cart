import { getCheckoutData } from '../utilities/old-utils'
import '@stripe/stripe-js'

export const handleStripe = (store) => (next) => async (action) => {
  const stripePublicKey = store.getState().stripe
  const cart = store.getState()
  let stripe

  if (action.type === 'cart/redirectToCheckout') {
    try {
      stripe = await Stripe(stripePublicKey)
      // new method provided to help Stripe keep track of usage.
      stripe.registerAppInfo({
        name: 'use-shopping-cart',
        version: '3.0.0-beta.15',
        url: 'https://useshoppingcart.com',
        partner_id: 'pp_partner_H8MLmI3e9Oc3IK'
      })
    } catch (error) {
      console.log('error', error)
    }
    if (cart.cartMode === 'checkout-session') {
      return stripe.redirectToCheckout({
        sessionId: action.payload.sessionId
      })
    }

    if (cart.cartMode === 'client-only') {
      const checkoutData = getCheckoutData(cart)
      stripe.redirectToCheckout(checkoutData)
    }

    throw new Error(`Invalid value for "cartMode" was found: ${cart.cartMode}`)
  }

  if (action.type === 'cart/checkoutSingleItem') {
    try {
      stripe = await Stripe(stripePublicKey)
    } catch (error) {
      console.log('error', error)
    }

    if (cart.cartMode !== 'client-only') {
      console.warn('checkoutSingleItem only works with client-only mode')
      return
    }

    if (cart.cartMode === 'client-only') {
      const productId = action.payload.productId
      const options = {
        mode: cart.mode,
        successUrl: cart.successUrl,
        cancelUrl: cart.cancelUrl,
        lineItems: [{ price: productId, quantity: 1 }]
      }
      stripe.redirectToCheckout(options)
    }
  }
  return next(action)
}
