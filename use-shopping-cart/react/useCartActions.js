'use client'

import { useActionState } from 'react'
import { useShoppingCart } from './index'

/**
 * Form-friendly cart actions using React 19's useActionState.
 * Perfect for progressive enhancement and form-based cart operations.
 *
 * @example
 * ```jsx
 * function ProductCard({ product }) {
 *   const { addToCartAction, isPending } = useCartActions()
 *
 *   return (
 *     <form action={addToCartAction}>
 *       <input type="hidden" name="product" value={JSON.stringify(product)} />
 *       <button disabled={isPending}>
 *         {isPending ? 'Adding...' : 'Add to Cart'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCartActions() {
  const cart = useShoppingCart()

  // Add to cart action
  const [addItemState, addToCartAction, addItemPending] = useActionState(
    async (prevState, formData) => {
      try {
        const productJSON = formData.get('product')
        const countStr = formData.get('count')

        if (!productJSON) {
          return { status: 'error', error: 'Product data is required' }
        }

        const product = JSON.parse(productJSON)
        const count = countStr ? parseInt(countStr, 10) : 1

        cart.addItem(product, { count })

        return {
          status: 'success',
          error: null,
          productId:
            product.id || product.price_id || product.sku_id || product.sku
        }
      } catch (error) {
        return {
          status: 'error',
          error: error.message || 'Failed to add item to cart'
        }
      }
    },
    { status: 'idle', error: null, productId: null }
  )

  // Remove from cart action
  const [removeItemState, removeFromCartAction, removeItemPending] =
    useActionState(
      async (prevState, formData) => {
        try {
          const itemId = formData.get('itemId')

          if (!itemId) {
            return { status: 'error', error: 'Item ID is required' }
          }

          cart.removeItem(itemId)

          return { status: 'success', error: null, itemId }
        } catch (error) {
          return {
            status: 'error',
            error: error.message || 'Failed to remove item'
          }
        }
      },
      { status: 'idle', error: null, itemId: null }
    )

  // Update quantity action
  const [updateQuantityState, updateQuantityAction, updateQuantityPending] =
    useActionState(
      async (prevState, formData) => {
        try {
          const itemId = formData.get('itemId')
          const quantityStr = formData.get('quantity')

          if (!itemId || !quantityStr) {
            return {
              status: 'error',
              error: 'Item ID and quantity are required'
            }
          }

          const quantity = parseInt(quantityStr, 10)

          if (isNaN(quantity) || quantity < 0) {
            return { status: 'error', error: 'Quantity must be a valid number' }
          }

          cart.setItemQuantity(itemId, quantity)

          return { status: 'success', error: null, itemId, quantity }
        } catch (error) {
          return {
            status: 'error',
            error: error.message || 'Failed to update quantity'
          }
        }
      },
      { status: 'idle', error: null, itemId: null, quantity: null }
    )

  // Clear cart action
  const [clearCartState, clearCartAction, clearCartPending] = useActionState(
    async (prevState, formData) => {
      try {
        cart.clearCart()
        return { status: 'success', error: null }
      } catch (error) {
        return {
          status: 'error',
          error: error.message || 'Failed to clear cart'
        }
      }
    },
    { status: 'idle', error: null }
  )

  // Increment item action
  const [incrementItemState, incrementItemAction, incrementItemPending] =
    useActionState(
      async (prevState, formData) => {
        try {
          const itemId = formData.get('itemId')
          const countStr = formData.get('count')

          if (!itemId) {
            return { status: 'error', error: 'Item ID is required' }
          }

          const count = countStr ? parseInt(countStr, 10) : 1
          cart.incrementItem(itemId, { count })

          return { status: 'success', error: null, itemId }
        } catch (error) {
          return {
            status: 'error',
            error: error.message || 'Failed to increment item'
          }
        }
      },
      { status: 'idle', error: null, itemId: null }
    )

  // Decrement item action
  const [decrementItemState, decrementItemAction, decrementItemPending] =
    useActionState(
      async (prevState, formData) => {
        try {
          const itemId = formData.get('itemId')
          const countStr = formData.get('count')

          if (!itemId) {
            return { status: 'error', error: 'Item ID is required' }
          }

          const count = countStr ? parseInt(countStr, 10) : 1
          cart.decrementItem(itemId, { count })

          return { status: 'success', error: null, itemId }
        } catch (error) {
          return {
            status: 'error',
            error: error.message || 'Failed to decrement item'
          }
        }
      },
      { status: 'idle', error: null, itemId: null }
    )

  // Return all actions and states
  return {
    // Add item
    addToCartAction,
    addItemState,
    isAddingItem: addItemPending,

    // Remove item
    removeFromCartAction,
    removeItemState,
    isRemovingItem: removeItemPending,

    // Update quantity
    updateQuantityAction,
    updateQuantityState,
    isUpdatingQuantity: updateQuantityPending,

    // Increment
    incrementItemAction,
    incrementItemState,
    isIncrementingItem: incrementItemPending,

    // Decrement
    decrementItemAction,
    decrementItemState,
    isDecrementingItem: decrementItemPending,

    // Clear cart
    clearCartAction,
    clearCartState,
    isClearingCart: clearCartPending,

    // Global pending state (any action in progress)
    isPending:
      addItemPending ||
      removeItemPending ||
      updateQuantityPending ||
      incrementItemPending ||
      decrementItemPending ||
      clearCartPending
  }
}
