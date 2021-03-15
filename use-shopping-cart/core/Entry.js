import { formatCurrencyString } from '../utilities/old-utils'
import { v4 as uuidv4 } from 'uuid/dist/esm-browser/index.js'

function Entry({
  product,
  quantity,
  currency,
  language,
  price_metadata,
  product_metadata
}) {
  quantity = parseInt(quantity)
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
      ...product_metadata
    }
  }

  return {
    ...productCopy,
    id,
    quantity,
    value: product.price * quantity,
    formattedValue: formatCurrencyString({
      value: product.price * quantity,
      currency,
      language
    })
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

  const totalPrice = state.totalPrice + product.price * count

  return {
    ...state,
    cartDetails: {
      ...state.cartDetails,
      [entry.id]: entry
    },
    totalPrice,
    cartCount: state.cartCount + count,
    formattedTotalPrice: formatCurrencyString({
      value: totalPrice,
      currency,
      language
    })
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
  count = parseInt(count)
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

  state.cartDetails = cartDetails
  state.totalPrice = state.totalPrice + entry.price * count
  state.cartCount = state.cartCount + count
  state.formattedTotalPrice = formatCurrencyString({
    value: state.totalPrice,
    currency,
    language
  })
}

export function removeEntry({ state, id }) {
  const cartDetails = state.cartDetails
  state.totalPrice = state.totalPrice - cartDetails[id].value
  state.cartCount = state.cartCount - cartDetails[id].quantity
  state.formattedTotalPrice = formatCurrencyString({
    value: state.totalPrice,
    currency: state.currency,
    language: state.language
  })

  delete cartDetails[id]
}

export function updateQuantity({ state, id, quantity, language, currency }) {
  function getNewCartCount(entryQuantity) {
    const currentCartCount = state.cartCount
    const currentItemQuantity = state.cartDetails[id].quantity

    return currentCartCount + currentItemQuantity - entryQuantity
  }

  function getNewTotalPrice(entryValue) {
    const currentCartTotalPrice = state.totalPrice
    const currentItemValue = state.cartDetails[id].value

    return currentCartTotalPrice + currentItemValue - entryValue
  }

  quantity = parseInt(quantity)
  const cartDetails = {
    ...state.cartDetails
  }

  const entry = cartDetails[id]

  state.cartDetails[id] = Entry({
    product: entry,
    quantity: entry.quantity + quantity - entry.quantity,
    language,
    currency,
    state
  })

  state.cartCount = getNewCartCount(entry.quantity)
  state.totalPrice = getNewTotalPrice(entry.value)
  state.formattedTotalPrice = formatCurrencyString({
    value: state.totalPrice,
    currency,
    language
  })
}
