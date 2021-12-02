export const isClient = typeof window === 'object'

export const initialState = {
  cartMode: 'checkout-session',
  mode: 'payment',
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  formattedTotalPrice: '',
  cartDetails: {},
  stripe: ''
}

export const formatCurrencyString = ({
  value,
  currency,
  language = isClient ? navigator.language : 'en-US'
}) => {
  const numberFormat = new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  })
  const parts = numberFormat.formatToParts(value)
  let zeroDecimalCurrency = true

  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
      break
    }
  }

  value = zeroDecimalCurrency ? value : value / 100
  return numberFormat.format(value.toFixed(2))
}

export function updateFormattedTotalPrice(state) {
  return formatCurrencyString({
    value: state.totalPrice,
    currency: state.currency,
    language: state.language
  })
}

export function updateFormattedValue(state, id) {
  return formatCurrencyString({
    value: state.cartDetails[id].value,
    currency: state.currency,
    language: state.language
  })
}

export class UseShoppingCart {
  constructor(state) {
    this.state = { ...initialState, ...state }
  }

  get cartState() {
    return this.state
  }

  entry(product, quantity) {
    const { id, price_metadata, product_metadata } = product
    return {
      ...product,
      id,
      quantity,
      value: product.price * quantity,
      price_data: {
        ...product.price_data,
        ...price_metadata
      },
      product_data: {
        ...product.product_data,
        ...product_metadata
      }
    }
  }

  createEntry(product, count = 1) {
    const { id } = product
    const entry = this.entry(product, count)

    this.state.cartDetails[id] = entry
    this.state.cartDetails[id].formattedTotalPrice = updateFormattedValue(
      this.state,
      id
    )
    this.state.formattedTotalPrice = updateFormattedTotalPrice(this.state)
    this.state.totalPrice += entry.value
    this.state.cartCount += count
  }

  updateEntry(product, count) {
    const { id, price_metadata, product_metadata } = product
    const entry = this.cartDetails[id]

    if (entry.quantity + count <= 0) return this.removeEntry(id)

    this.state.cartDetails[id] = this.entry({
      id,
      product: entry,
      quantity: entry.quantity + count,
      price_metadata,
      product_metadata
    })
  }

  removeEntry(id) {
    const cartDetails = this.state.cartDetails
    this.state.totalPrice -= cartDetails[id].value
    this.state.cartCount -= cartDetails[id].quantity
    delete cartDetails[id]
    this.state.formattedTotalPrice = updateFormattedTotalPrice(this.state)
  }
}
