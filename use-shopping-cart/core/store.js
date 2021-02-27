import { configureStore } from '@reduxjs/toolkit'
import { reducer, actions, initialState } from './slice'

export { reducer, actions }
export function createShoppingCartStore(options) {
  return configureStore({
    reducer,
    preloadedState: { ...initialState, ...options }
  })
}
