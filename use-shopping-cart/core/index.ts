// Core exports for use-shopping-cart
import type { CartDetails, CartEntry } from './types'

export { ShoppingCart, initialState } from './ShoppingCart'
export { formatCurrencyString } from './formatters'
export { CartError, isCartError } from './errors'
export { redirectToCheckout } from './checkout'
export type { CartErrorCode } from './errors'
export {
  createLocalStorage,
  createSessionStorage,
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

// Helper function for filtering cart
export async function filterCart(
  cartDetails: CartDetails,
  filter: (entry: CartEntry) => Promise<boolean> | boolean
): Promise<CartDetails> {
  const filteredCart: CartDetails = {}

  for (const sku in cartDetails) {
    const entry = cartDetails[sku]
    if (await filter(entry)) filteredCart[sku] = entry
  }

  return filteredCart
}
