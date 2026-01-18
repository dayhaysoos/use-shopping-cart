'use client'

import { useActionState } from 'react'
import { useShoppingCart } from './useShoppingCart'
import { validateProduct } from '../core/validation'
import { getProductId } from '../core/Entry'

interface ActionState<T = null> {
  status: 'idle' | 'success' | 'error'
  error: string | null
  productId?: string | null
  itemId?: string | null
  quantity?: number | null
}

const MAX_PRODUCT_JSON_LENGTH = 50_000

type AddItemState = ActionState & { productId: string | null }
type ItemState = ActionState & { itemId: string | null }
type QuantityState = ActionState & {
  itemId: string | null
  quantity: number | null
}
type ClearState = { status: 'idle' | 'success' | 'error'; error: string | null }

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

function parsePositiveInteger(
  value: FormDataEntryValue | null,
  fieldName: string
): number | null {
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`)
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`)
  }

  return parsed
}

function parseNonNegativeInteger(
  value: FormDataEntryValue | null,
  fieldName: string
): number | null {
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`)
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`)
  }

  return parsed
}

/**
 * Form-friendly cart actions using React 19's useActionState.
 * Perfect for progressive enhancement and form-based cart operations.
 *
 * @example
 * ```tsx
 * function ProductCard({ product }: { product: Product }) {
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
    async (
      _prevState: AddItemState,
      formData: FormData
    ): Promise<AddItemState> => {
      try {
        const productJSON = formData.get('product')
        const countStr = formData.get('count')

        if (!productJSON || typeof productJSON !== 'string') {
          return {
            status: 'error',
            error: 'Product data is required',
            productId: null
          }
        }

        if (productJSON.length > MAX_PRODUCT_JSON_LENGTH) {
          return {
            status: 'error',
            error: 'Product data is too large',
            productId: null
          }
        }

        let product: unknown
        try {
          product = JSON.parse(productJSON)
        } catch (error) {
          if (error instanceof SyntaxError) {
            return {
              status: 'error',
              error: 'Product data must be valid JSON',
              productId: null
            }
          }
          throw error
        }

        validateProduct(product)
        const count = parsePositiveInteger(countStr, 'count') ?? 1

        const safeProduct = product as Parameters<typeof cart.addItem>[0]
        cart.addItem(safeProduct, { count })

        return {
          status: 'success',
          error: null,
          productId: getProductId(safeProduct)
        }
      } catch (error) {
        return {
          status: 'error',
          error: getErrorMessage(error) || 'Failed to add item to cart',
          productId: null
        }
      }
    },
    { status: 'idle', error: null, productId: null }
  )

  // Remove from cart action
  const [removeItemState, removeFromCartAction, removeItemPending] =
    useActionState(
      async (_prevState: ItemState, formData: FormData): Promise<ItemState> => {
        try {
          const itemId = formData.get('itemId')

          if (!itemId || typeof itemId !== 'string') {
            return {
              status: 'error',
              error: 'Item ID is required',
              itemId: null
            }
          }

          cart.removeItem(itemId)

          return { status: 'success', error: null, itemId }
        } catch (error) {
          return {
            status: 'error',
            error: getErrorMessage(error) || 'Failed to remove item',
            itemId: null
          }
        }
      },
      { status: 'idle', error: null, itemId: null }
    )

  // Update quantity action
  const [updateQuantityState, updateQuantityAction, updateQuantityPending] =
    useActionState(
      async (
        _prevState: QuantityState,
        formData: FormData
      ): Promise<QuantityState> => {
        try {
          const itemId = formData.get('itemId')
          const quantityStr = formData.get('quantity')

          if (
            !itemId ||
            typeof itemId !== 'string' ||
            !quantityStr ||
            typeof quantityStr !== 'string'
          ) {
            return {
              status: 'error',
              error: 'Item ID and quantity are required',
              itemId: null,
              quantity: null
            }
          }

          const quantity = parseNonNegativeInteger(quantityStr, 'quantity')

          cart.setItemQuantity(itemId, quantity!)

          return { status: 'success', error: null, itemId, quantity }
        } catch (error) {
          return {
            status: 'error',
            error: getErrorMessage(error) || 'Failed to update quantity',
            itemId: null,
            quantity: null
          }
        }
      },
      { status: 'idle', error: null, itemId: null, quantity: null }
    )

  // Clear cart action
  const [clearCartState, clearCartAction, clearCartPending] = useActionState(
    async (
      _prevState: ClearState,
      _formData: FormData
    ): Promise<ClearState> => {
      try {
        cart.clearCart()
        return { status: 'success', error: null }
      } catch (error) {
        return {
          status: 'error',
          error: getErrorMessage(error) || 'Failed to clear cart'
        }
      }
    },
    { status: 'idle', error: null }
  )

  // Increment item action
  const [incrementItemState, incrementItemAction, incrementItemPending] =
    useActionState(
      async (_prevState: ItemState, formData: FormData): Promise<ItemState> => {
        try {
          const itemId = formData.get('itemId')
          const countStr = formData.get('count')

          if (!itemId || typeof itemId !== 'string') {
            return {
              status: 'error',
              error: 'Item ID is required',
              itemId: null
            }
          }

          const count = parsePositiveInteger(countStr, 'count') ?? 1
          cart.incrementItem(itemId, { count })

          return { status: 'success', error: null, itemId }
        } catch (error) {
          return {
            status: 'error',
            error: getErrorMessage(error) || 'Failed to increment item',
            itemId: null
          }
        }
      },
      { status: 'idle', error: null, itemId: null }
    )

  // Decrement item action
  const [decrementItemState, decrementItemAction, decrementItemPending] =
    useActionState(
      async (_prevState: ItemState, formData: FormData): Promise<ItemState> => {
        try {
          const itemId = formData.get('itemId')
          const countStr = formData.get('count')

          if (!itemId || typeof itemId !== 'string') {
            return {
              status: 'error',
              error: 'Item ID is required',
              itemId: null
            }
          }

          const count = parsePositiveInteger(countStr, 'count') ?? 1
          cart.decrementItem(itemId, { count })

          return { status: 'success', error: null, itemId }
        } catch (error) {
          return {
            status: 'error',
            error: getErrorMessage(error) || 'Failed to decrement item',
            itemId: null
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
