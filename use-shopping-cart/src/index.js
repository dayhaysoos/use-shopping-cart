import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react'

import {
  checkoutHandler,
  formatCurrencyString,
  isClient,
  useLocalStorageReducer
} from './util'
import {
  cartInitialState,
  cartReducer,
  cartValuesInitialState,
  cartValuesReducer
} from './reducers'

export { formatCurrencyString, isClient } from './util'

export const CartContext = createContext([
  {
    lastClicked: '',
    shouldDisplayCart: false,
    ...cartValuesInitialState
  },
  () => {}
])

export const CartProvider = ({
  children,
  mode,
  stripe,
  successUrl,
  cancelUrl,
  currency,
  language = isClient ? navigator.language : 'en-US',
  billingAddressCollection = false,
  allowedCountries = null
}) => {
  const [cart, cartDispatch] = useReducer(cartReducer, cartInitialState)

  useEffect(() => {
    cartDispatch({ type: 'stripe-changed', stripe })
  }, [stripe])

  const [cartValues, cartValuesDispatch] = useLocalStorageReducer(
    'cart-values',
    cartValuesReducer,
    cartValuesInitialState
  )

  // combine dispatches and
  // memoize context value to avoid causing re-renders
  const contextValue = useMemo(
    () => [
      {
        ...cart,
        ...cartValues,
        mode,
        successUrl,
        cancelUrl,
        currency,
        language,
        billingAddressCollection,
        allowedCountries
      },
      (action) => {
        cartDispatch(action)
        cartValuesDispatch({ ...action, currency, language })
      }
    ],
    [
      cart,
      cartDispatch,
      cartValues,
      cartValuesDispatch,
      mode,
      successUrl,
      cancelUrl,
      currency,
      language,
      billingAddressCollection,
      allowedCountries
    ]
  )

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}

export const useShoppingCart = () => {
  const [cart, dispatch] = useContext(CartContext)

  const {
    lastClicked,
    shouldDisplayCart,
    cartCount,
    cartDetails,
    totalPrice,
    currency,
    language
  } = cart

  const addItem = (product, count = 1) =>
    dispatch({ type: 'add-item-to-cart', product, count })
  const removeItem = (sku) => dispatch({ type: 'remove-item-from-cart', sku })
  const setItemQuantity = (sku, quantity) =>
    dispatch({ type: 'set-item-quantity', sku, quantity })
  const incrementItem = (sku, count = 1) =>
    dispatch({ type: 'increment-item', sku, count })
  const decrementItem = (sku, count = 1) =>
    dispatch({ type: 'decrement-item', sku, count })
  const clearCart = () => dispatch({ type: 'clear-cart' })

  const storeLastClicked = (sku) =>
    dispatch({ type: 'store-last-clicked', sku })
  const handleCartClick = () => dispatch({ type: 'cart-click' })
  const handleCartHover = () => dispatch({ type: 'cart-hover' })
  const handleCloseCart = () => dispatch({ type: 'close-cart' })

  const redirectToCheckout = checkoutHandler(cart, {
    modes: ['client-only', 'checkout-session'],
    stripe(stripe, options) {
      return stripe.redirectToCheckout(options)
    }
  })

  const checkoutSingleItem = checkoutHandler(cart, {
    modes: ['client-only'],
    stripe(stripe, options, { sku, quantity = 1 }) {
      options.lineItems = [{ price: sku, quantity }]
      return stripe.redirectToCheckout(options)
    }
  })

  return {
    cartDetails,
    cartCount,
    totalPrice,
    get formattedTotalPrice() {
      return formatCurrencyString({
        value: totalPrice,
        currency,
        language
      })
    },

    addItem,
    removeItem,
    setItemQuantity,
    incrementItem,
    decrementItem,
    clearCart,

    lastClicked,
    storeLastClicked,
    shouldDisplayCart,
    handleCartClick,
    handleCartHover,
    handleCloseCart,

    redirectToCheckout,
    checkoutSingleItem
  }
}
