import PropTypes from 'prop-types'
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
    cartDispatch({ type: 'stripe changed', stripe })
  }, [stripe])

  const [cartValues, cartValuesDispatch] = useLocalStorageReducer(
    'cart-items',
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

CartProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]).isRequired,
  stripe: PropTypes.any,
  successUrl: PropTypes.string.isRequired,
  cancelUrl: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  language: PropTypes.string,
  billingAddressCollection: PropTypes.bool,
  allowedCountries: PropTypes.arrayOf(PropTypes.string)
}

export const useShoppingCart = () => {
  const [cart, dispatch] = useContext(CartContext)

  const {
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

  const redirectToCheckout = async (sessionId) => {
    const options = {
      items: getCheckoutData.stripe(cart),
      successUrl,
      cancelUrl,
      billingAddressCollection: billingAddressCollection ? 'required' : 'auto',
      submitType: 'auto'
    }

    if (Array.isArray(allowedCountries) && allowedCountries.length) {
      options.shippingAddressCollection = {
        allowedCountries
      }
    }

    if (stripe === null) {
      throw new Error('Stripe is not defined')
    }

    const resolvedStripe = await Promise.resolve(stripe)

    const { error } = await resolvedStripe.redirectToCheckout(
      sessionId || options
    )
    if (error) {
      return error
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
