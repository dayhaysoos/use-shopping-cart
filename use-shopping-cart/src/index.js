import React, {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect
} from 'react'

import {
  useLocalStorageReducer,
  isClient,
  getCheckoutData,
  formatCurrencyString
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
    mode,
    stripe,
    lastClicked,
    shouldDisplayCart,
    successUrl,
    cancelUrl,
    billingAddressCollection,
    allowedCountries,
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

  async function redirectToCheckout(sessionId) {
    if (stripe === null) throw new Error('Stripe is not defined')
    const resolvedStripe = await Promise.resolve(stripe)

    if (mode === 'client-only') {
      // client-only checkout mode
      const options = {
        items: getCheckoutData.stripe(cart),
        successUrl,
        cancelUrl,
        billingAddressCollection: billingAddressCollection
          ? 'required'
          : 'auto',
        submitType: 'auto'
      }

      if (allowedCountries?.length)
        options.shippingAddressCollection = { allowedCountries }

      const { error } = await resolvedStripe.redirectToCheckout(options)
      if (error) return error
    } else if (mode === 'checkout-session') {
      // checkout-session mode
      const { error } = await resolvedStripe.redirectToCheckout(sessionId)
      if (error) return error
    } else {
      throw new Error(
        `Invalid checkout mode '${mode}' was chosen. Valid options are 'client-only' and 'checkout-session'`
      )
    }
  }

  const checkoutSingleItem = async ({ item, sessionId }) => {
    const resolvedStripe = await Promise.resolve(stripe)

    if (mode === 'client-only') {
      const options = {
        items: [
          {
            sku,
            quantity: 1
          }
        ],
        successUrl,
        cancelUrl,
        billingAddressCollection: billingAddressCollection
          ? 'required'
          : 'auto',
        submitType: 'auto'
      }

      if (allowedCountries?.length)
        options.shippingAddressCollection = { allowedCountries }

      const { error } = await resolvedStripe.redirectToCheckout(options)
      if (error) return error
    } else if (mode === 'checkout-session') {
      // checkout-session mode
      const { error } = await resolvedStripe.redirectToCheckout({ sessionId })
      if (error) return error
    } else {
      throw new Error(
        `Invalid checkout mode '${mode}' was chosen. Valid options are 'client-only' and 'checkout-session'`
      )
    }
  }

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
    checkoutSingleItem,
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
    redirectToCheckout
  }
}
