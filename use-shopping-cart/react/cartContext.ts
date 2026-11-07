import { createContext, useContext } from 'react'
import type { ShoppingCart } from '../core/ShoppingCart'
import type { CartState } from '../core/types'
import { CartError } from '../core/errors'

export const CartContext = createContext<ShoppingCart | null>(null)

const serverStates = new WeakMap<ShoppingCart, CartState>()

export function setServerState(cart: ShoppingCart, state: CartState): void {
  serverStates.set(cart, state)
}

export function getServerState(cart: ShoppingCart): CartState {
  return serverStates.get(cart) ?? cart.getState()
}

export function useCartContext(): ShoppingCart {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new CartError(
      'NO_CART_PROVIDER',
      'useCartContext must be used within CartProvider'
    )
  }

  return cart
}
