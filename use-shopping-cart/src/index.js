import React, {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect
} from 'react'
import {
  formatCurrencyString,
  calculateTotalValue,
  useLocalStorageReducer,
  isClient
} from './util'
import PropTypes from 'prop-types'

export { formatCurrencyString, isClient } from './util'

/**
 * @function checkoutCart
 * @param skus {object}
 * @param sku {string}
 * @param quantity {number}
 * @description Adds skuID to skus object, if no quantity argument is passed, it increments by 1
 * @returns {object} skus
 */
const checkoutCart = (skus, { sku }, quantity = 1) => {
  if (sku in skus) {
    return {
      ...skus,
      [sku]: skus[sku] + quantity
    }
  } else {
    return {
      ...skus,
      [sku]: quantity
    }
  }
}

const formatDetailedCart = (currency, cartItems, language) => {
  return cartItems.reduce((acc, current) => {
    const quantity = (acc[current.sku]?.quantity ?? 0) + 1
    const value = (acc[current.sku]?.value ?? 0) + current.price
    const formattedValue = formatCurrencyString({ value, currency, language })

    return {
      ...acc,
      [current.sku]: {
        ...current,
        quantity,
        formattedValue,
        value
      }
    }
  }, {})
}

const reduceItemByOne = (skuID, cartItems) => {
  const newCartItems = []
  let removedItem = false

  for (const item of cartItems) {
    if (!removedItem && item.sku === skuID) {
      removedItem = true
      continue
    }

    newCartItems.push(item)
  }

  return newCartItems
}

function cartReducer(cart, action) {
  switch (action.type) {
    case 'addToCart':
      return {
        ...cart,
        skus: checkoutCart(cart.skus, action.product.sku)
      }

    case 'storeLastClicked':
      return {
        ...cart,
        lastClicked: action.skuID
      }

    case 'cartClick':
      return {
        ...cart,
        shouldDisplayCart: !cart.shouldDisplayCart
      }

    case 'cartHover':
      return {
        ...cart,
        shouldDisplayCart: true
      }

    case 'closeCart':
      return {
        ...cart,
        shouldDisplayCart: false
      }

    case 'stripe changed':
      return {
        ...cart,
        stripe: action.stripe
      }

    default:
      return cart
  }
}

function cartValuesReducer(state, action) {
  function createEntry(product) {
    const entry = {
      ...product,
      quantity: 1,
      get value() {
        return this.price * this.quantity
      },
      get formattedValue() {
        return formatCurrencyString({
          value: this.value,
          currency: action.currency,
          language: action.language
        })
      }
    }

    return {
      cartDetails: {
        ...state.cartDetails,
        [product.sku]: entry
      },
      totalPrice: state.totalPrice + product.price,
      cartCount: state.cartCount + 1
    }
  }
  function updateEntry(sku, count) {
    const cartDetails = { ...state.cartDetails }
    const entry = cartDetails[sku]
    entry.quantity += count

    return {
      cartDetails,
      totalPrice: state.totalPrice + entry.price * count,
      cartCount: state.cartCount + count
    }
  }
  function removeEntry(sku) {
    const cartDetails = { ...state.cartDetails }
    const totalPrice = state.totalPrice - cartDetails[sku].value
    const cartCount = state.cartCount - cartDetails[sku].quantity
    delete cartDetails[sku]

    return { cartDetails, totalPrice, cartCount }
  }

  switch (action.type) {
    case 'add-item-to-cart':
      if (action.product.sku in state.cartDetails) {
        return updateEntry(action.product.sku, 1)
      }

      return createEntry(action.product)
    case 'increment-item':
      if (action.sku in state.cartDetails) {
        return updateEntry(action.sku, action.count)
      }
      break

    case 'decrement-item':
      if (action.sku in state.cartDetails) {
        return updateEntry(action.sku, -action.count)
      }
      break

    case 'remove-item-from-cart':
      if (action.sku in state.cartDetails) {
        return removeEntry(action.sku)
      }
      break

    default:
      return state
  }

  return state
}

export const CartContext = createContext([
  {
    lastClicked: '',
    shouldDisplayCart: false,
    skus: {},
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
    allowedCountries,
    skus: {}
  })

  useEffect(() => {
    cartDispatch({ type: 'stripe changed', stripe })
  }, [stripe])

  // keep cartItems in LocalStorage
  const [cartItems, cartItemsDispatch] = useLocalStorageReducer(
    'cart-items',
    cartItemsReducer,
    []
  )

  // combine dispatches and
  // memoize context value to avoid causing re-renders
  const contextValue = useMemo(
    () => [
      { ...cart, cartItems },
      (action) => {
        cartDispatch(action)
        cartItemsDispatch(action)
      }
    ],
    [cart, cartItems, cartDispatch, cartItemsDispatch]
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
    cartItems,
    successUrl,
    cancelUrl,
    currency,
    language,
    billingAddressCollection,
    allowedCountries,
    cartCount,
    cartDetails,
    totalPrice
  } = cart

  const addItem = (product) => dispatch({ type: 'add-item-to-cart', product })
  const removeCartItem = (sku) =>
    dispatch({ type: 'remove-item-from-cart', sku })
  const decrementItem = (sku, count = 1) =>
    dispatch({ type: 'decrement-item', sku, count })
  const incrementItem = (sku, count = 1) =>
    dispatch({ type: 'increment-item', sku, count })

  const storeLastClicked = (skuID) =>
    dispatch({ type: 'storeLastClicked', skuID })

  const handleCartClick = () => dispatch({ type: 'cartClick' })

  const handleCartHover = () => dispatch({ type: 'cartHover' })

  const handleCloseCart = () => dispatch({ type: 'closeCart' })

  const clearCart = () => dispatch({ type: 'clearCart' })

  const redirectToCheckout = async (sessionId) => {
    console.log('firing redirectToCheckout')
    const options = {
      items: checkoutData,
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

    console.log('stripe:', stripe)
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
    addItem,
    cartCount,
    redirectToCheckout,
    lastClicked,
    storeLastClicked,
    shouldDisplayCart,
    handleCartClick,
    cartDetails,
    handleCartHover,
    handleCloseCart,
    totalPrice,
    removeCartItem,
    reduceItemByOne,
    clearCart
  }
}
