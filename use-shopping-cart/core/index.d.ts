// Type definitions for use-shopping-cart/core

import type { CartDetails, CartEntry } from './types'

export { ShoppingCart, initialState } from './ShoppingCart'
export { formatCurrencyString } from './formatters'
export {
  createLocalStorage,
  createNoopStorage,
  createMemoryStorage
} from './storage'

export type {
  ProductAttributes,
  Product,
  CartEntry,
  CartEntryAttributes,
  CartDetails,
  CartState,
  CartConfig,
  AddItemOptions,
  IncrementOptions,
  StorageAdapter,
  SubscribeCallback,
  UnsubscribeFunction,
  FormatCurrencyStringOptions
} from './types'

export function filterCart(
  cartDetails: CartDetails,
  filter: (entry: CartEntry) => Promise<boolean> | boolean
): Promise<CartDetails>
