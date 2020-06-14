import * as useShoppingCart from 'use-shopping-cart'
import Stripe from 'stripe'

declare module 'use-shopping-cart/src/serverUtil' {
  export function validateCartItems(
    inventory: useShoppingCart.Product[],
    cartItems: useShoppingCart.CartDetails
  ): Stripe.Checkout.SessionCreateParams.LineItem[]
}
