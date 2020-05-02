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
import { cartReducer, cartValuesReducer } from './reducers'

export { formatCurrencyString, isClient } from './util'

export const CartContext = createContext([
  {
    lastClicked: '',
    shouldDisplayCart: false,
    cartItems: []
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
  const [cart, cartDispatch] = useReducer(cartReducer, {
    lastClicked: '',
    shouldDisplayCart: false,
    stripe,
    successUrl,
    cancelUrl,
    currency,
    language,
    billingAddressCollection,
    allowedCountries
  })

  useEffect(() => {
    cartDispatch({ type: 'stripe changed', stripe })
  }, [stripe])

  const [cartValues, cartValuesDispatch] = useLocalStorageReducer(
    'cart-items',
    cartValuesReducer,
    { cartDetails: {}, totalPrice: 0, cartCount: 0 }
  )

  // combine dispatches and
  // memoize context value to avoid causing re-renders
  const contextValue = useMemo(
    () => [
      { ...cart, ...cartValues },
      (action) => {
        cartDispatch(action)
        cartValuesDispatch({ ...action, currency, language })
      }
    ],
    [cart, cartDispatch, cartValues, cartValuesDispatch]
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

  const addItem = (product) => dispatch({ type: 'add-item-to-cart', product })
  const removeItem = (sku) => dispatch({ type: 'remove-item-from-cart', sku })
  const incrementItem = (sku, count = 1) =>
    dispatch({ type: 'increment-item', sku, count })
  const decrementItem = (sku, count = 1) =>
    dispatch({ type: 'decrement-item', sku, count })
  const clearCart = () => dispatch({ type: 'clearCart' })

  const storeLastClicked = (sku) => dispatch({ type: 'storeLastClicked', sku })
  const handleCartClick = () => dispatch({ type: 'cartClick' })
  const handleCartHover = () => dispatch({ type: 'cartHover' })
  const handleCloseCart = () => dispatch({ type: 'closeCart' })

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
    totalPrice: formatCurrencyString({ value: totalPrice, currency, language }),

    addItem,
    removeItem,
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
