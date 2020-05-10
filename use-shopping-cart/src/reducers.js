import { formatCurrencyString } from './util'

export const cartInitialState = {
  lastClicked: '',
  shouldDisplayCart: false,
  stripe: null
}
export function cartReducer(cart, action) {
  switch (action.type) {
    case 'store-last-clicked':
      return {
        ...cart,
        lastClicked: action.sku
      }

    case 'cart-click':
      return {
        ...cart,
        shouldDisplayCart: !cart.shouldDisplayCart
      }

    case 'cart-hover':
      return {
        ...cart,
        shouldDisplayCart: true
      }

    case 'close-cart':
      return {
        ...cart,
        shouldDisplayCart: false
      }

    case 'stripe-changed':
      return {
        ...cart,
        stripe: action.stripe
      }

    default:
      return cart
  }
}

export const cartValuesInitialState = {
  cartDetails: {},
  totalPrice: 0,
  cartCount: 0
}
function Entry(productData, quantity, currency, language) {
  return {
    ...productData,
    quantity,
    get value() {
      return this.price * this.quantity
    },
    get formattedValue() {
      return formatCurrencyString({
        value: this.value,
        currency,
        language
      })
    }
  }
}
export function cartValuesReducer(state, action) {
  function createEntry(product, count) {
    const entry = Entry(product, count, action.currency, action.language)

    return {
      cartDetails: {
        ...state.cartDetails,
        [product.sku]: entry
      },
      totalPrice: state.totalPrice + product.price * count,
      cartCount: state.cartCount + count
    }
  }
  function updateEntry(sku, count) {
    const cartDetails = { ...state.cartDetails }
    const entry = cartDetails[sku]
    if (entry.quantity + count <= 0) return removeEntry(sku)

    cartDetails[sku] = Entry(
      entry,
      entry.quantity + count,
      action.currency,
      action.language
    )

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
  function updateQuantity(sku, quantity) {
    const entry = state.cartDetails[sku]
    return updateEntry(sku, quantity - entry.quantity)
  }

  switch (action.type) {
    case 'add-item-to-cart':
      if (action.count <= 0) break
      if (action.product.sku in state.cartDetails)
        return updateEntry(action.product.sku, action.count)
      return createEntry(action.product, action.count)

    case 'increment-item':
      if (action.count <= 0) break
      if (action.sku in state.cartDetails)
        return updateEntry(action.sku, action.count)
      break

    case 'decrement-item':
      if (action.count <= 0) break
      if (action.sku in state.cartDetails)
        return updateEntry(action.sku, -action.count)
      break

    case 'set-item-quantity':
      if (action.count < 0) break
      if (action.sku in state.cartDetails)
        return updateQuantity(action.sku, action.quantity)
      break

    case 'remove-item-from-cart':
      if (action.sku in state.cartDetails) return removeEntry(action.sku)
      break

    case 'clear-cart':
      return cartValuesInitialState

    default:
      return state
  }

  console.warn('Invalid action arguments', action)
  return state
}
