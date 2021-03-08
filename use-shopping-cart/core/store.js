import { configureStore } from '@reduxjs/toolkit'
import { reducer, actions, cartInitialState } from './slice'
import { isClient } from '../utilities/SSR'
import { handleStripe } from './stripe-middleware'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

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
  const persistConfig = {
    key: 'root',
    version: 1,
    storage
  }

  const persistedReducer = persistReducer(persistConfig, reducer)

  return configureStore({
    reducer: persistedReducer,
    preloadedState: { ...cartInitialState, ...options },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      }).concat(handleStripe)
  })
}

// for non react apps
export function createPersistedStore(store) {
  return persistStore(store)
}
