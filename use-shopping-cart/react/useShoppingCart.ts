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
  checkoutSingleItem: typeof ShoppingCart.prototype.checkoutSingleItem
  // New methods from Stripe API modernization
  setCustomerEmail: typeof ShoppingCart.prototype.setCustomerEmail
  toggleAutomaticTax: typeof ShoppingCart.prototype.toggleAutomaticTax
  setCustomText: typeof ShoppingCart.prototype.setCustomText
  setCustomFields: typeof ShoppingCart.prototype.setCustomFields
  setShippingOptions: typeof ShoppingCart.prototype.setShippingOptions
  setUIMode: typeof ShoppingCart.prototype.setUIMode
  togglePhoneCollection: typeof ShoppingCart.prototype.togglePhoneCollection
  togglePromotionCodes: typeof ShoppingCart.prototype.togglePromotionCodes
  toggleTermsOfService: typeof ShoppingCart.prototype.toggleTermsOfService
  setCreateSessionEndpoint: typeof ShoppingCart.prototype.setCreateSessionEndpoint
  initEmbeddedCheckout: typeof ShoppingCart.prototype.initEmbeddedCheckout
}

export function useShoppingCart(): UseShoppingCartReturn {
  const cart = useCartContext()

  // Subscribe to cart state with useSyncExternalStore
  const state = useSyncExternalStore(
    (callback) => cart.subscribe(callback),
    () => cart.getState()
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
      redirectToCheckout: cart.redirectToCheckout.bind(cart),
      checkoutSingleItem: cart.checkoutSingleItem.bind(cart),
      // New methods from Stripe API modernization
      setCustomerEmail: cart.setCustomerEmail.bind(cart),
      toggleAutomaticTax: cart.toggleAutomaticTax.bind(cart),
      setCustomText: cart.setCustomText.bind(cart),
      setCustomFields: cart.setCustomFields.bind(cart),
      setShippingOptions: cart.setShippingOptions.bind(cart),
      setUIMode: cart.setUIMode.bind(cart),
      togglePhoneCollection: cart.togglePhoneCollection.bind(cart),
      togglePromotionCodes: cart.togglePromotionCodes.bind(cart),
      toggleTermsOfService: cart.toggleTermsOfService.bind(cart),
      setCreateSessionEndpoint: cart.setCreateSessionEndpoint.bind(cart),
      initEmbeddedCheckout: cart.initEmbeddedCheckout.bind(cart)
    }),
    [cart]
  )

  return { ...state, ...methods } as UseShoppingCartReturn
}
