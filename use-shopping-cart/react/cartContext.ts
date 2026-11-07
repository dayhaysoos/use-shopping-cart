import { createContext, useContext } from 'react'
import type { ShoppingCart } from '../core/ShoppingCart'
import { CartError } from '../core/errors'

export const CartContext = createContext<ShoppingCart | null>(null)

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
