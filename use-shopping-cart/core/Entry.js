import { formatCurrencyString } from '../utilities/old-utils'
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

  const productCopy = { ...product }

  if (!productCopy.price_data && price_metadata) {
    productCopy.price_data = {
      ...price_metadata
    }
  } else if (productCopy.price_data && price_metadata) {
    productCopy.price_data = {
      ...productCopy.price_data,
      ...price_metadata
    }
  }

  if (!productCopy.product_data && product_metadata) {
    productCopy.product_data = {
      ...product_metadata
    }
  } else if (productCopy.product_data && product_metadata) {
    productCopy.product_data = {
      ...productCopy.product_data,
      ...productCopy
    }
  }

  return {
    ...productCopy,
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
    quantity: count,
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
    cartCount: state.cartCount + count
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

  if (entry.quantity + count <= 0) {
    return removeEntry({ state, id })
  }

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
    ...state,
    cartDetails,
    totalPrice: state.totalPrice + entry.price * count,
    cartCount: state.cartCount + count
  }
}

export function removeEntry({ state, id }) {
  const cartDetails = state.cartDetails
  state.totalPrice = state.totalPrice - cartDetails[id].value
  state.cartCount = state.cartCount - cartDetails[id].quantity

  delete cartDetails[id]
}

export function updateQuantity({ state, id, quantity }) {
  return updateEntry({ ...state, state, id, count: quantity })
}
