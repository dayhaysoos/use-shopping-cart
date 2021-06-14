import { getCheckoutData } from '../utilities/old-utils'
import '@stripe/stripe-js'

export const handleStripe = (store) => (next) => async (action) => {
  const stripePublicKey = store.getState().stripe
  const cart = store.getState()

  if (action.type === 'cart/redirectToCheckout') {
    const stripe = await initializeStripe(stripePublicKey)
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
    const stripe = await initializeStripe(stripePublicKey)

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

async function initializeStripe(publicKey) {
  try {
    // eslint-disable-next-line no-undef
    return await Stripe(publicKey)
  } catch (error) {
    console.log('error', error)
  }
}
