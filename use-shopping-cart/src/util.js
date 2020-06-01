import { useStorageReducer } from 'react-storage-hooks'

export const isClient = typeof window === 'object'

export const formatCurrencyString = ({
  value,
  currency,
  language = isClient ? navigator.language : 'en-US'
}) => {
  value = parseInt(value)
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
    }
  }
  value = zeroDecimalCurrency ? value : value / 100
  return numberFormat.format(value.toFixed(2))
}

export function useLocalStorageReducer(key, reducer, initialState) {
  const dummyStorage = {
    getItem() {
      return null
    },
    setItem() {},
    removeItem() {}
  }
  return useStorageReducer(
    isClient ? window.localStorage : dummyStorage,
    key,
    reducer,
    initialState
  )
}

export const getCheckoutData = {
  stripe(cart) {
    const checkoutData = []
    for (const sku in cart.cartDetails) {
      checkoutData.push({
        price: sku,
        quantity: cart.cartDetails[sku].quantity
      })
    }
    return checkoutData
  }
}
