import { configureStore } from '@reduxjs/toolkit'
import { reducer, actions, initialState } from './slice'
import { filterCart, formatCurrencyString } from '../utilities/old-utils'
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
      }).concat(handleStripe)
  })
}

// for non react apps
export function createPersistedStore(store) {
  return persistStore(store)
}
