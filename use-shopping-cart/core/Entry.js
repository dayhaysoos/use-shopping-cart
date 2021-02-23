import { formatCurrencyString } from '../src/util'
import { v4 as uuidv4 } from 'uuid'

function Entry({
  product,
  quantity,
  currency,
  language,
  price_metadata,
  product_metadata
}) {
  const id =
    product.id || product.price_id || product.sku_id || product.sku || uuidv4()

  if (!product.price_data && price_metadata) {
    product.price_data = {
      ...price_metadata
    }
  } else if (product.price_data && price_metadata) {
    product.price_data = {
      ...product.price_data,
      ...price_metadata
    }
  }

  if (!product.product_data && product_metadata) {
    product.product_data = {
      ...product_metadata
    }
  } else if (product.product_data && product_metadata) {
    product.product_data = {
      ...product.product_data,
      ...product_metadata
    }
  }

  return {
    ...product,
    id,
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

export function createEntry({
  product,
  count,
  price_metadata,
  product_metadata,
  language,
  currency,
  state
}) {
  const entry = Entry({
    product,
    count,
    language,
    price_metadata,
    product_metadata,
    state,
    currency
  })

  return {
    ...state,
    cartDetails: {
      ...state.cartDetails,
      [entry.id]: entry
    },
    totalPrice: state.totalPrice + product.price * count,
    cartCount: state.cartCount + count,
    wtf: 'wtf'
  }
}

export function updateEntry({
  id,
  count,
  price_metadata,
  product_metadata,
  currency,
  language,
  state
}) {
  const cartDetails = { ...state.cartDetails }
  const entry = cartDetails[id]
  if (entry.quantity + count <= 0) return removeEntry(id)

  if (!entry.price_data && price_metadata) {
    entry.price_data = {
      ...price_metadata
    }
  } else if (entry.price_data && price_metadata) {
    entry.price_data = {
      ...entry.price_data,
      ...price_metadata
    }
  }

  if (!entry.product_data && product_metadata) {
    entry.product_data = {
      ...product_metadata
    }
  } else if (entry.product_data && product_metadata) {
    entry.product_data = {
      ...entry.product_data,
      ...product_metadata
    }
  }

  cartDetails[id] = Entry({
    product: entry,
    quantity: entry.quantity + count,
    language,
    price_metadata,
    product_metadata,
    currency
  })

  return {
    cartDetails,
    totalPrice: state.totalPrice + entry.price * count,
    cartCount: state.cartCount + count
  }
}

export function removeEntry(id) {
  const cartDetails = { ...state.cartDetails }
  const totalPrice = state.totalPrice - cartDetails[id].value
  const cartCount = state.cartCount - cartDetails[id].quantity
  delete cartDetails[id]

  return { cartDetails, totalPrice, cartCount }
}

export function updateQuantity(id, quantity) {
  const entry = state.cartDetails[id]
  return updateEntry(id, quantity - entry.quantity)
}
