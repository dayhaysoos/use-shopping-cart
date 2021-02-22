import React, {
  createContext,
  useContext,
  useDebugValue,
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

export function CartProvider({
  children,
  mode,
  stripe,
  successUrl,
  cancelUrl,
  currency,
  language = isClient ? navigator.language : 'en-US',
  billingAddressCollection = false,
  allowedCountries = null
}) {
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

  const addItem = (product, count = 1, price_metadata, product_metadata) => {
    dispatch({
      type: 'add-item-to-cart',
      product,
      count,
      price_metadata,
      product_metadata
    })
  }

  const removeItem = (id) => dispatch({ type: 'remove-item-from-cart', id })
  const setItemQuantity = (id, quantity) =>
    dispatch({ type: 'set-item-quantity', id, quantity })
  const incrementItem = (id, count = 1) =>
    dispatch({ type: 'increment-item', id, count })
  const decrementItem = (id, count = 1) =>
    dispatch({ type: 'decrement-item', id, count })
  const clearCart = () => dispatch({ type: 'clear-cart' })

  const storeLastClicked = (id) => dispatch({ type: 'store-last-clicked', id })
  const handleCartClick = () => dispatch({ type: 'cart-click' })
  const handleCartHover = () => dispatch({ type: 'cart-hover' })
  const handleCloseCart = () => dispatch({ type: 'close-cart' })

  const loadCart = (cartDetails, shouldMerge = true) =>
    dispatch({ type: 'load-cart', cartDetails, shouldMerge })

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

  const shoppingCart = {
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
    checkoutSingleItem,
    loadCart
  }
  useDebugValue(shoppingCart)
  return shoppingCart
}

export function DebugCart(props) {
  const cart = useShoppingCart()
  const cartPropertyRows = Object.entries(cart)
    .filter(([, value]) => typeof value !== 'function')
    .map(([key, value]) => (
      <tr key={key}>
        <td>{key}</td>
        <td>
          {typeof value === 'object' ? (
            <button onClick={() => console.log(value)}>Log value</button>
          ) : (
            JSON.stringify(value)
          )}
        </td>
      </tr>
    ))

  return (
    <table
      style={{
        position: 'fixed',
        top: 50,
        right: 50,
        backgroundColor: '#eee',
        textAlign: 'left',
        maxWidth: 500,
        padding: 20,
        borderSpacing: '25px 5px'
      }}
      {...props}
    >
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>{cartPropertyRows}</tbody>
    </table>
  )
}
