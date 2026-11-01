'use client'

// React exports for use-shopping-cart
export { CartProvider } from './CartProvider'
export { useShoppingCart } from './useShoppingCart'
export { useOptimisticCart } from './useOptimisticCart'
export { useCartActions } from './useCartActions'
export { DebugCart } from './DebugCart'
export { formatCurrencyString, filterCart } from '../core/index'

export type { CartProviderProps } from './CartProvider'
export type { CartActions, UseShoppingCartReturn } from './useShoppingCart'
export type {
  ActionState,
  AddItemState,
  ItemState,
  QuantityState,
  ClearState,
  RemoveItemState,
  UpdateQuantityState
} from './useCartActions'
export type { DebugCartProps } from './DebugCart'
export type {
  OptimisticCartEntry,
  OptimisticCartDetails
} from './useOptimisticCart'
export type {
  ProductAttributes,
  Product,
  CartEntry,
  CartEntryAttributes,
  CartDetails,
  CartState,
  RedirectToCheckoutInput,
  CartConfig,
  AddItemOptions,
  IncrementOptions,
  StorageAdapter,
  FormatCurrencyStringOptions
} from '../core/types'
