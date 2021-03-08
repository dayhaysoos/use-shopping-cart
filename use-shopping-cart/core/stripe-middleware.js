import { loadStripe } from '@stripe/stripe-js'
import { getCheckoutData } from '../utilities/old-utils'

export const handleStripe = (store) => (next) => async (action) => {
  if (action.type === 'cart/redirectToCheckout') {
    try {
      const stripePublicKey = store.getState().stripe

      const result = await loadStripe(stripePublicKey)
      const cart = store.getState()

      if (action.payload?.sessionId) {
        return result.redirectToCheckout({
          sessionId: action.payload.sessionId
        })
      }

      if (store.getState().mode === 'client-only') {
        const checkoutData = getCheckoutData(cart)
        result.redirectToCheckout(checkoutData)
      }
    } catch (error) {
      console.log('error', error)
    }
  }
  try {
    return next(action)
  } catch (error) {
    console.error('Error:', error)
  }
}
