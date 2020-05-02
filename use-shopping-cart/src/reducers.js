import { formatCurrencyString } from './util'

export function cartReducer(cart, action) {
  switch (action.type) {
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

export function cartValuesReducer(state, action) {
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
