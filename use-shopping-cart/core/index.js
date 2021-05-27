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
import { isClient } from '../utilities/SSR'

import { updateFormattedTotalPrice } from './Entry'
import { reducer, actions, initialState } from './slice'

import { filterCart, formatCurrencyString } from '../utilities/old-utils'

import { handleStripe } from './stripe-middleware'
import { handleWarnings } from './warning-middleware'

function noop() {}
function createNoopStorage() {
  return {
    getItem: noop,
    setItem: noop,
    removeItem: noop
  }
}

function createLocalStorage() {
  return {
    async getItem(key) {
      return window.localStorage.getItem(key)
    },
    async setItem(key, value) {
      return window.localStorage.setItem(key, value)
    },
    async removeItem(key) {
      return window.localStorage.removeItem(key)
    }
  }
}

export { reducer, actions, filterCart, formatCurrencyString }

export function createShoppingCartStore(options) {
  if (!isClient) {
    return configureStore({
      reducer,
      preloadedState: { ...initialState, ...options }
    })
  }
  let storage
  if (isClient) storage = options.storage || createLocalStorage()
  else storage = createNoopStorage()
  delete options.storage

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
