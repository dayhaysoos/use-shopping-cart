import { isClient } from '../utilities/SSR'
// This is giving an error if I run any dev: script using pnpm
// import { formatISO } from 'date-fns'

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

  value = zeroDecimalCurrency ? value : parseFloat((value / 100).toFixed(2))
  return numberFormat.format(value)
}

export function updateFormattedTotalPrice(state) {
  state.formattedTotalPrice = formatCurrencyString({
    value: state.totalPrice,
    currency: state.currency,
    language: state.language
  })
}

export function updateFormattedValue(state, id) {
  state.cartDetails[id].formattedValue = formatCurrencyString({
    value: state.cartDetails[id].value,
    currency: state.currency,
    language: state.language
  })
}

export function updateFormattedPrice(state, id) {
  state.cartDetails[id].formattedPrice = formatCurrencyString({
    value: state.cartDetails[id].price,
    currency: state.currency,
    language: state.language
  })
}

function Entry({ id, product, quantity, price_metadata, product_metadata }) {
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

export function createEntry({
  state,
  id,
  product,
  count,
  price_metadata,
  product_metadata
}) {
  const entry = Entry({
    id,
    product,
    quantity: count,
    price_metadata,
    product_metadata
    // timeStamp: formatISO(new Date())
  })

  state.cartDetails[id] = entry
  updateFormattedValue(state, id)
  updateFormattedPrice(state, id)

  state.totalPrice += entry.value
  state.cartCount += count
  updateFormattedTotalPrice(state)
}

export function updateEntry({
  state,
  id,
  count,
  price_metadata,
  product_metadata
}) {
  const entry = state.cartDetails[id]
  if (entry.quantity + count <= 0) return removeEntry({ state, id })

  state.cartDetails[id] = Entry({
    id,
    state,
    product: entry,
    quantity: entry.quantity + count,
    price_metadata,
    product_metadata
  })
  updateFormattedValue(state, id)

  state.totalPrice += entry.price * count
  state.cartCount += count
  updateFormattedTotalPrice(state)
}

export function removeEntry({ state, id }) {
  const cartDetails = state.cartDetails
  state.totalPrice -= cartDetails[id].value
  state.cartCount -= cartDetails[id].quantity
  delete cartDetails[id]
  updateFormattedTotalPrice(state)
}

export function updateQuantity({ state, id, quantity }) {
  const entry = state.cartDetails[id]
  updateEntry({
    state,
    id,
    count: quantity - entry.quantity
  })
}
