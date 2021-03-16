import { loadStripe } from '@stripe/stripe-js'
import { getCheckoutData } from '../utilities/old-utils'

export const handleStripe = (store) => (next) => async (action) => {
  const stripePublicKey = store.getState().stripe
  const cart = store.getState()
  let stripe

  if (action.type === 'cart/redirectToCheckout') {
    try {
      stripe = await loadStripe(stripePublicKey)
    } catch (error) {
      console.log('error', error)
    }
    if (action.payload?.sessionId) {
      return stripe.redirectToCheckout({
        sessionId: action.payload.sessionId
      })
    }

    if (cart.cartMode === 'client-only') {
      const checkoutData = getCheckoutData(cart)
      stripe.redirectToCheckout(checkoutData)
    }
  }

  if (action.type === 'cart/checkoutSingleItem') {
    try {
      stripe = await loadStripe(stripePublicKey)
    } catch (error) {
      console.log('error', error)
    }

    if (action.payload?.sessionId) {
      return stripe.redirectToCheckout({
        sessionId: action.payload.sessionId
      })
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
  try {
    return next(action)
  } catch (error) {
    console.error('Error:', error)
  }
}
