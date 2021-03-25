import { configureStore } from '@reduxjs/toolkit'

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
import persistStorage from 'redux-persist/lib/storage'

import { updateFormattedTotalPrice } from './Entry'
import { reducer, actions, initialState } from './slice'

import { filterCart, formatCurrencyString } from '../utilities/old-utils'
import { isClient } from '../utilities/SSR'

import { handleStripe } from './stripe-middleware'
import { handleWarnings } from './warning-middleware'

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null)
    },
    setItem(_key, value) {
      return Promise.resolve(value)
    },
    removeItem(_key) {
      return Promise.resolve()
    }
  }
}

const storage = isClient ? persistStorage : createNoopStorage()

export { reducer, actions, filterCart, formatCurrencyString }

export function createShoppingCartStore(options) {
  const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['cartCount', 'totalPrice', 'formattedTotalPrice', 'cartDetails']
  }
  const persistedReducer = persistReducer(persistConfig, reducer)

  const newInitialState = { ...initialState, ...options }
  updateFormattedTotalPrice(newInitialState)

  return configureStore({
    reducer: persistedReducer,
    preloadedState: newInitialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      }).concat(handleStripe, handleWarnings)
  })
}

// For non-React apps
export function createPersistedStore(store) {
  return persistStore(store)
}
