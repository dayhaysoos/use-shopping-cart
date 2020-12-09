import { formatCurrencyString } from './util'
import { v4 as uuidv4 } from 'uuid'

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
        lastClicked: action.id
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
  const getProductId = () => {
    if (productData.id) {
      return productData.id
    }
    if (productData.price_id) {
      return productData.price_id
    }
    if (productData.sku_id) {
      return productData.sku_id
    }
    if (productData.sku) {
      return productData.sku
    }
    return uuidv4()
  }

  return {
    ...productData,
    id: getProductId(),
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
        [entry.id]: entry
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
      if (action.product.id in state.cartDetails)
        return updateEntry(action.product.id, action.count)
      return createEntry(action.product, action.count)

    case 'increment-item':
      if (action.count <= 0) break
      if (action.id in state.cartDetails)
        return updateEntry(action.id, action.count)
      break

    case 'decrement-item':
      if (action.count <= 0) break
      if (action.id in state.cartDetails)
        return updateEntry(action.id, -action.count)
      break

    case 'set-item-quantity':
      if (action.count < 0) break
      if (action.id in state.cartDetails)
        return updateQuantity(action.id, action.quantity)
      break

    case 'remove-item-from-cart':
      if (action.id in state.cartDetails) return removeEntry(action.id)
      break

    case 'clear-cart':
      return cartValuesInitialState

    case 'load-cart':
      if (!action.shouldMerge) state = { ...cartValuesInitialState }

      for (const sku in action.cartDetails) {
        const entry = action.cartDetails[sku]
        if (action.filter && !action.filter(entry)) continue

        state = createEntry(entry, entry.quantity)
      }
      return state

    default:
      return state
  }

  console.warn('Invalid action arguments', action)
  return state
}
