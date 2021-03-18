import { configureStore } from '@reduxjs/toolkit'
import { reducer, actions, initialState } from './slice'
import { filterCart, formatCurrencyString } from '../utilities/old-utils'
import { handleStripe } from './stripe-middleware'
import { handleWarnings } from './warning-middleware'
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
import { isClient } from '../utilities/SSR'

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

const storage = !isClient ? createNoopStorage() : persistStorage

export { reducer, actions, filterCart, formatCurrencyString }
export function createShoppingCartStore(options) {
  const persistConfig = {
    key: 'root',
    version: 1,
    storage
  }

  const persistedReducer = persistReducer(persistConfig, reducer)

  return configureStore({
    reducer: persistedReducer,
    preloadedState: { ...initialState, ...options },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      }).concat(handleStripe, handleWarnings)
  })
}

// for non react apps
export function createPersistedStore(store) {
  return persistStore(store)
}
