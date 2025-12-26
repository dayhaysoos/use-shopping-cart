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

interface OptimisticCartEntry extends CartEntry {
  _optimistic?: boolean
}

type OptimisticCartDetails = {
  [id: string]: OptimisticCartEntry
}

type OptimisticAction =
  | { type: 'ADD_ITEM'; product: Product; options?: AddItemOptions }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'INCREMENT_ITEM'; id: string; count?: number }
  | { type: 'DECREMENT_ITEM'; id: string; count?: number }
  | { type: 'SET_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }

/**
 * Helper to format price
 */
function formatPrice(
  value: number,
  currency: string,
  language: string
): string {
  try {
    const numberFormat = new Intl.NumberFormat(language, {
      style: 'currency',
      currency
    })

    // Determine if zero-decimal currency
    const parts = numberFormat.formatToParts(value)
    const hasDecimal = parts.some((part) => part.type === 'decimal')

    const finalValue = hasDecimal ? value / 100 : value
    return numberFormat.format(finalValue)
  } catch {
    return `${currency} ${value}`
  }
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

  // Create optimistic version of cartDetails
  const [optimisticCartDetails, updateOptimisticCart] = useOptimistic<
    OptimisticCartDetails,
    OptimisticAction
  >(cart.cartDetails as OptimisticCartDetails, (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM': {
        const { product, options } = action
        // Use getProductId to ensure consistent ID resolution with ShoppingCart.
        // If product has no ID, getProductId generates a UUID and mutates the product,
        // ensuring both optimistic and real cart states use the same key.
        const id = getProductId(product)
        const count = options?.count ?? 1

        // Item already exists - increment it
        if (state[id]) {
          return {
            ...state,
            [id]: {
              ...state[id],
              quantity: state[id].quantity + count,
              value: state[id].price * (state[id].quantity + count),
              _optimistic: true
            }
          }
        }

        // New item - add it
        return {
          ...state,
          [id]: {
            ...product,
            id,
            quantity: count,
            value: product.price * count,
            formattedValue: formatPrice(
              product.price * count,
              cart.currency,
              cart.language
            ),
            formattedPrice: formatPrice(
              product.price,
              cart.currency,
              cart.language
            ),
            timestamp: new Date().toISOString(),
            price_data: product.price_data || {},
            product_data: product.product_data || {},
            _optimistic: true
          } as OptimisticCartEntry
        }
      }

      case 'REMOVE_ITEM': {
        const { id } = action
        const { [id]: _removed, ...rest } = state
        return rest
      }

      case 'INCREMENT_ITEM': {
        const { id, count = 1 } = action
        if (!state[id]) return state

        return {
          ...state,
          [id]: {
            ...state[id],
            quantity: state[id].quantity + count,
            value: state[id].price * (state[id].quantity + count),
            _optimistic: true
          }
        }
      }

      case 'DECREMENT_ITEM': {
        const { id, count = 1 } = action
        if (!state[id]) return state

        const newQuantity = state[id].quantity - count

        // Remove if quantity would be 0 or less
        if (newQuantity <= 0) {
          const { [id]: _removed, ...rest } = state
          return rest
        }

        return {
          ...state,
          [id]: {
            ...state[id],
            quantity: newQuantity,
            value: state[id].price * newQuantity,
            _optimistic: true
          }
        }
      }

      case 'SET_QUANTITY': {
        const { id, quantity } = action
        if (!state[id]) return state

        // Remove if quantity is 0
        if (quantity === 0) {
          const { [id]: _removed, ...rest } = state
          return rest
        }

        return {
          ...state,
          [id]: {
            ...state[id],
            quantity,
            value: state[id].price * quantity,
            _optimistic: true
          }
        }
      }

      case 'CLEAR_CART': {
        return {}
      }

      default:
        return state
    }
  })

  // Check if we're in an optimistic state
  const isOptimistic = Object.values(optimisticCartDetails).some(
    (item) => item._optimistic === true
  )

  // Calculate optimistic totals
  const optimisticCartCount = Object.values(optimisticCartDetails).reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const optimisticTotalPrice = Object.values(optimisticCartDetails).reduce(
    (sum, item) => sum + item.value,
    0
  )

  // Wrap addItem with optimistic update
  const addItem = (product: Product, options: AddItemOptions = {}) => {
    startTransition(() => {
      // Update optimistically and perform real update together
      updateOptimisticCart({ type: 'ADD_ITEM', product, options })
      cart.addItem(product, options)
    })
  }

  // Wrap removeItem
  const removeItem = (id: string) => {
    startTransition(() => {
      updateOptimisticCart({ type: 'REMOVE_ITEM', id })
      cart.removeItem(id)
    })
  }

  // Wrap incrementItem
  const incrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    startTransition(() => {
      updateOptimisticCart({
        type: 'INCREMENT_ITEM',
        id,
        count
      })
      cart.incrementItem(id, { ...options, count })
    })
  }

  // Wrap decrementItem
  const decrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    startTransition(() => {
      updateOptimisticCart({
        type: 'DECREMENT_ITEM',
        id,
        count
      })
      cart.decrementItem(id, { ...options, count })
    })
  }

  // Wrap setItemQuantity
  const setItemQuantity = (id: string, quantity: number) => {
    startTransition(() => {
      updateOptimisticCart({ type: 'SET_QUANTITY', id, quantity })
      cart.setItemQuantity(id, quantity)
    })
  }

  // Wrap clearCart
  const clearCart = () => {
    startTransition(() => {
      updateOptimisticCart({ type: 'CLEAR_CART' })
      cart.clearCart()
    })
  }

  // Return the same API as useShoppingCart, but with optimistic updates
  return {
    ...cart,
    cartDetails: optimisticCartDetails as CartDetails,
    cartCount: optimisticCartCount,
    totalPrice: optimisticTotalPrice,
    formattedTotalPrice: formatPrice(
      optimisticTotalPrice,
      cart.currency,
      cart.language
    ),
    isOptimistic, // New property - true when showing optimistic updates
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    setItemQuantity,
    clearCart
  }
}
