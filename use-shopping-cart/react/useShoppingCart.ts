'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { useCartContext } from './CartProvider'
import type {
  AddItemOptions,
  CartDetails,
  CartState,
  IncrementOptions,
  Product,
  RedirectToCheckoutInput
} from '../core/types'

export interface CartActions {
  /**
   * Add `count` amount of a product to the cart
   * @param product The product to add to the cart
   * @param options.count The quantity of the product to add, defaults to 1
   */
  addItem: (product: Product, options?: AddItemOptions) => void

  /**
   * Increase the quantity of an item in the cart by `count`
   * @param id The product ID of the item to increase in quantity
   * @param options.count The quantity to increase by, defaults to 1
   */
  incrementItem: (id: string, options?: IncrementOptions) => void

  /**
   * Reduce the quantity of an item in the cart by `count`
   * @param id The product ID of the item to reduce in quantity
   * @param options.count The quantity to decrease by, defaults to 1
   */
  decrementItem: (id: string, options?: IncrementOptions) => void

  /**
   * Set the quantity of an item in the cart to a specific value
   * @param id The product ID of the item whose quantity you wish to change
   * @param quantity The quantity to set the item to
   */
  setItemQuantity: (id: string, quantity: number) => void

  /**
   * Remove an item from the cart by its product ID
   * @param id The product ID of the item in the cart to remove
   */
  removeItem: (id: string) => void

  /**
   * Totally clears the cart of all items
   */
  clearCart: () => void

  /**
   * @param cartDetails The cart cartDetails stored somewhere (e.g. on the server).
   * @param shouldMerge Defaults to true. When false, it replaces cartDetails entirely.
   * @see CartDetails
   */
  loadCart: (cartDetails: CartDetails, shouldMerge?: boolean) => void

  /**
   * Sets `shouldDisplayCart` to `true`.
   */
  handleCartHover: () => void

  /**
   * Toggles `shouldDisplayCart` between `true` and `false`.
   */
  handleCartClick: () => void

  /**
   * Sets `shouldDisplayCart` to `false`.
   */
  handleCloseCart: () => void

  /**
   * Given a product ID, it sets `lastClicked` to that value.
   */
  storeLastClicked: (id: string) => void

  /**
   * Given a public Stripe key string, it sets `stripe` to that value.
   */
  changeStripeKey: (key: string) => void

  /**
   * Given an ISO language code (e.g. en-US), it sets `language` to that value.
   */
  changeLanguage: (language: string) => void

  /**
   * Given an ISO currency code (e.g. USD), it sets `currency` to that value.
   */
  changeCurrency: (currency: string) => void

  /**
   * Redirects customers to Stripe checkout with a session URL (preferred) or legacy session ID.
   * @param input Session URL (session.url) or a checkout session ID.
   * @returns Promise that resolves when redirect starts, or an error object
   */
  redirectToCheckout: (
    input: RedirectToCheckoutInput
  ) => Promise<{ error: any } | undefined>
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

  return { ...state, ...methods }
}
