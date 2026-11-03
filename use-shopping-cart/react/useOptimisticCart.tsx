'use client'

import { useOptimistic, startTransition } from 'react'
import { useShoppingCart } from './useShoppingCart'
import type {
  CartDetails,
  CartEntry,
  Product,
  AddItemOptions,
  IncrementOptions
} from '../core/types'
import { getProductId } from '../core/Entry'
import {
  applyCartChange,
  withCartDetails,
  type CartChange
} from '../core/cartState'

export interface OptimisticCartEntry extends CartEntry {
  _optimistic?: boolean
}

export type OptimisticCartDetails = {
  [id: string]: OptimisticCartEntry
}

/**
 * Optimistic version of useShoppingCart that provides instant UI feedback
 * while cart operations complete in the background.
 *
 * @example
 * ```tsx
 * function ProductCard({ product }: { product: Product }) {
 *   const { addItem, cartDetails, isOptimistic } = useOptimisticCart()
 *
 *   return (
 *     <div>
 *       <button onClick={() => addItem(product)}>
 *         Add to Cart
 *       </button>
 *       {isOptimistic && <span>Updating...</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useOptimisticCart() {
  // Get the real cart state and actions
  const cart = useShoppingCart()

  // Optimistic cartDetails: the same change ShoppingCart applies, with the
  // touched entry marked until the real state catches up
  const [optimisticCartDetails, updateOptimisticCart] = useOptimistic<
    OptimisticCartDetails,
    CartChange
  >(cart.cartDetails as OptimisticCartDetails, (state, change) => {
    const next: OptimisticCartDetails = applyCartChange(state, change, {
      currency: cart.currency,
      language: cart.language
    })
    const id =
      change.type === 'add'
        ? getProductId(change.product)
        : 'id' in change
          ? change.id
          : undefined

    return id && next !== state && next[id]
      ? { ...next, [id]: { ...next[id], _optimistic: true } }
      : next
  })

  const isOptimistic = Object.values(optimisticCartDetails).some(
    (item) => item._optimistic === true
  )

  // Totals derived exactly as ShoppingCart derives them
  const optimisticTotals = withCartDetails(cart, optimisticCartDetails)

  // Wrap addItem with optimistic update
  const addItem = (product: Product, options: AddItemOptions = {}) => {
    startTransition(() => {
      // Update optimistically and perform real update together
      updateOptimisticCart({
        type: 'add',
        product,
        count: options.count ?? 1,
        metadata: options
      })
      cart.addItem(product, options)
    })
  }

  // Wrap removeItem
  const removeItem = (id: string) => {
    startTransition(() => {
      updateOptimisticCart({ type: 'remove', id })
      cart.removeItem(id)
    })
  }

  // Wrap incrementItem
  const incrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    startTransition(() => {
      updateOptimisticCart({ type: 'adjust', id, by: count })
      cart.incrementItem(id, { ...options, count })
    })
  }

  // Wrap decrementItem
  const decrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    startTransition(() => {
      updateOptimisticCart({ type: 'adjust', id, by: -count })
      cart.decrementItem(id, { ...options, count })
    })
  }

  // Wrap setItemQuantity
  const setItemQuantity = (id: string, quantity: number) => {
    startTransition(() => {
      updateOptimisticCart({ type: 'set', id, quantity })
      cart.setItemQuantity(id, quantity)
    })
  }

  // Wrap clearCart
  const clearCart = () => {
    startTransition(() => {
      updateOptimisticCart({ type: 'clear' })
      cart.clearCart()
    })
  }

  // Return the same API as useShoppingCart, but with optimistic updates
  return {
    ...cart,
    cartDetails: optimisticCartDetails as CartDetails,
    cartCount: optimisticTotals.cartCount,
    totalPrice: optimisticTotals.totalPrice,
    formattedTotalPrice: optimisticTotals.formattedTotalPrice,
    isOptimistic, // New property - true when showing optimistic updates
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    setItemQuantity,
    clearCart
  }
}
