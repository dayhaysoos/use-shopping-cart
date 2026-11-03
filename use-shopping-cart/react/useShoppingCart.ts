'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { useCartContext } from './CartProvider'
import type { ShoppingCart } from '../core/ShoppingCart'
import type { CartState } from '../core/types'

// The ShoppingCart methods useShoppingCart exposes, bound to the cart
const cartActionNames = [
  'addItem',
  'incrementItem',
  'decrementItem',
  'setItemQuantity',
  'removeItem',
  'clearCart',
  'loadCart',
  'handleCartHover',
  'handleCartClick',
  'handleCloseCart',
  'storeLastClicked',
  'changeStripeKey',
  'changeLanguage',
  'changeCurrency',
  'redirectToCheckout'
] as const

type CartActionName = (typeof cartActionNames)[number]

/**
 * The cart methods returned by `useShoppingCart`, documented on `ShoppingCart`.
 * Typed as function properties (not methods) because they are bound and safe to destructure.
 */
export type CartActions = {
  [K in keyof Pick<ShoppingCart, CartActionName>]: (
    ...args: Parameters<ShoppingCart[K]>
  ) => ReturnType<ShoppingCart[K]>
}

export interface UseShoppingCartReturn extends CartState, CartActions {}

/**
 * Provides cart state and actions. Must be used inside `<CartProvider>`.
 */
export function useShoppingCart(): UseShoppingCartReturn {
  const cart = useCartContext()

  // Subscribe to cart state with useSyncExternalStore
  const state = useSyncExternalStore(
    (callback) => cart.subscribe(callback), // Subscribe to cart state
    () => cart.getState(), // Client snapshot
    () => cart.getState() // SSR snapshot
  )

  // Memoize methods to prevent re-creating on every render
  const methods = useMemo(
    () =>
      Object.fromEntries(
        cartActionNames.map((name) => [name, cart[name].bind(cart)])
      ) as CartActions,
    [cart]
  )

  return { ...state, ...methods }
}
