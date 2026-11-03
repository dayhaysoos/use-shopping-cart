'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { useCartContext } from './CartProvider'
import type { ShoppingCart } from '../core/ShoppingCart'
import type { CartState } from '../core/types'

type CartActionName =
  | 'addItem'
  | 'incrementItem'
  | 'decrementItem'
  | 'setItemQuantity'
  | 'removeItem'
  | 'clearCart'
  | 'loadCart'
  | 'handleCartHover'
  | 'handleCartClick'
  | 'handleCloseCart'
  | 'storeLastClicked'
  | 'changeStripeKey'
  | 'changeLanguage'
  | 'changeCurrency'
  | 'redirectToCheckout'

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
      ({
        addItem: cart.addItem.bind(cart),
        incrementItem: cart.incrementItem.bind(cart),
        decrementItem: cart.decrementItem.bind(cart),
        setItemQuantity: cart.setItemQuantity.bind(cart),
        removeItem: cart.removeItem.bind(cart),
        clearCart: cart.clearCart.bind(cart),
        loadCart: cart.loadCart.bind(cart),
        handleCartHover: cart.handleCartHover.bind(cart),
        handleCartClick: cart.handleCartClick.bind(cart),
        handleCloseCart: cart.handleCloseCart.bind(cart),
        storeLastClicked: cart.storeLastClicked.bind(cart),
        changeStripeKey: cart.changeStripeKey.bind(cart),
        changeLanguage: cart.changeLanguage.bind(cart),
        changeCurrency: cart.changeCurrency.bind(cart),
        redirectToCheckout: cart.redirectToCheckout.bind(cart)
      }) satisfies CartActions,
    [cart]
  )

  return { ...state, ...methods }
}
