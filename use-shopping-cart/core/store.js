import { configureStore } from '@reduxjs/toolkit'
import { reducer, actions, initialState } from './slice'
import { filterCart, formatCurrencyString } from '../utilities/old-utils'

export { reducer, actions, filterCart, formatCurrencyString }
export function createShoppingCartStore(options) {
  return configureStore({
    reducer,
    preloadedState: { ...initialState, ...options }
  })
}
