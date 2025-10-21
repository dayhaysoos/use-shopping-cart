'use client'

import { useOptimistic, startTransition } from 'react'
import { useShoppingCart } from './index'

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
  const [optimisticCartDetails, updateOptimisticCart] = useOptimistic(
    cart.cartDetails,
    (state, action) => {
      switch (action.type) {
        case 'ADD_ITEM': {
          const { product, options } = action
          const id =
            product.id || product.price_id || product.sku_id || product.sku
          const count = options?.count || 1

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
              formattedValue: formatPrice(product.price * count, cart.currency),
              formattedPrice: formatPrice(product.price, cart.currency),
              timestamp: new Date().toISOString(),
              _optimistic: true
            }
          }
        }

        case 'REMOVE_ITEM': {
          const { id } = action
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: removed, ...rest } = state
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: removed, ...rest } = state
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: removed, ...rest } = state
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
    }
  )

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
  const addItem = (product, options = {}) => {
    // Update optimistically first (instant)
    updateOptimisticCart({ type: 'ADD_ITEM', product, options })

    // Then perform real update in background
    startTransition(() => {
      cart.addItem(product, options)
    })
  }

  // Wrap removeItem
  const removeItem = (id) => {
    updateOptimisticCart({ type: 'REMOVE_ITEM', id })
    startTransition(() => {
      cart.removeItem(id)
    })
  }

  // Wrap incrementItem
  const incrementItem = (id, options = {}) => {
    updateOptimisticCart({
      type: 'INCREMENT_ITEM',
      id,
      count: options.count || 1
    })
    startTransition(() => {
      cart.incrementItem(id, options)
    })
  }

  // Wrap decrementItem
  const decrementItem = (id, options = {}) => {
    updateOptimisticCart({
      type: 'DECREMENT_ITEM',
      id,
      count: options.count || 1
    })
    startTransition(() => {
      cart.decrementItem(id, options)
    })
  }

  // Wrap setItemQuantity
  const setItemQuantity = (id, quantity) => {
    updateOptimisticCart({ type: 'SET_QUANTITY', id, quantity })
    startTransition(() => {
      cart.setItemQuantity(id, quantity)
    })
  }

  // Wrap clearCart
  const clearCart = () => {
    updateOptimisticCart({ type: 'CLEAR_CART' })
    startTransition(() => {
      cart.clearCart()
    })
  }

  // Return the same API as useShoppingCart, but with optimistic updates
  return {
    ...cart,
    cartDetails: optimisticCartDetails,
    cartCount: optimisticCartCount,
    totalPrice: optimisticTotalPrice,
    formattedTotalPrice: formatPrice(optimisticTotalPrice, cart.currency),
    isOptimistic, // New property - true when showing optimistic updates
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    setItemQuantity,
    clearCart
  }
}

/**
 * Helper to format price (simplified version)
 */
function formatPrice(value, currency) {
  try {
    const numberFormat = new Intl.NumberFormat('en-US', {
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
