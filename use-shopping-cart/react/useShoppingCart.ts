'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { useCartContext } from './CartProvider'
import type { CartState } from '../core/types'
import type { ShoppingCart } from '../core/ShoppingCart'

export interface UseShoppingCartReturn extends CartState {
  addItem: typeof ShoppingCart.prototype.addItem
  incrementItem: typeof ShoppingCart.prototype.incrementItem
  decrementItem: typeof ShoppingCart.prototype.decrementItem
  setItemQuantity: typeof ShoppingCart.prototype.setItemQuantity
  removeItem: typeof ShoppingCart.prototype.removeItem
  clearCart: typeof ShoppingCart.prototype.clearCart
  loadCart: typeof ShoppingCart.prototype.loadCart
  handleCartHover: typeof ShoppingCart.prototype.handleCartHover
  handleCartClick: typeof ShoppingCart.prototype.handleCartClick
  handleCloseCart: typeof ShoppingCart.prototype.handleCloseCart
  storeLastClicked: typeof ShoppingCart.prototype.storeLastClicked
  changeStripeKey: typeof ShoppingCart.prototype.changeStripeKey
  changeLanguage: typeof ShoppingCart.prototype.changeLanguage
  changeCurrency: typeof ShoppingCart.prototype.changeCurrency
  redirectToCheckout: typeof ShoppingCart.prototype.redirectToCheckout
}

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
    () => ({
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
    }),
    [cart]
  )

  return { ...state, ...methods } as UseShoppingCartReturn
}
