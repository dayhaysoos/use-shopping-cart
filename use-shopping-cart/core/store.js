import { configureStore } from '@reduxjs/toolkit'
import { reducer, actions, cartInitialState } from './slice'
import { isClient } from '../utilities/SSR'
import { handleStripe } from './stripe-middleware'

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
      break
    }
  }

  value = zeroDecimalCurrency ? value : value / 100
  return numberFormat.format(value.toFixed(2))
}

export { reducer, actions }
export function createShoppingCartStore(options) {
  return configureStore({
    reducer,
    preloadedState: { ...cartInitialState, ...options },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(handleStripe)
  })
}
