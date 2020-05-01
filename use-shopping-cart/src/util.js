import { useStorageReducer } from 'react-storage-hooks'

export const isClient = typeof window === 'object'

export const formatCurrencyString = ({ value, currency, language }) => {
  value = parseInt(value)
  const numberFormat = new Intl.NumberFormat(
    language ?? 'en-US',
    {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol'
    }
  )
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

export const calculateTotalValue = (currency, cartItems) => {
  const value = cartItems.reduce((acc, { price }) => acc + price, 0)
  return formatCurrencyString({ value, currency })
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
