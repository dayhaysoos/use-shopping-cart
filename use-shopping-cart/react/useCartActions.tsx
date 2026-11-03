'use client'

import { useActionState } from 'react'
import { useShoppingCart } from './useShoppingCart'
import { getProductId } from '../core/Entry'
import {
  decodeAddItem,
  decodeCountChange,
  decodeItemId,
  decodeQuantity
} from './formData'

export interface ActionState {
  status: 'idle' | 'success' | 'error'
  error: string | null
  productId?: string | null
  itemId?: string | null
  quantity?: number | null
}

export type AddItemState = ActionState & { productId: string | null }
export type ItemState = ActionState & { itemId: string | null }
export type QuantityState = ActionState & {
  itemId: string | null
  quantity: number | null
}
export type ClearState = Pick<ActionState, 'status' | 'error'>
// Names kept from the v4 rc.1 type declarations.
export type RemoveItemState = ItemState
export type UpdateQuantityState = QuantityState

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

/**
 * Build a useActionState action: `perform` decodes the form, runs the cart
 * operation and returns the success state; any thrown error becomes
 * `{ ...idle, status: 'error', error }`.
 */
function createFormAction<S extends ActionState>(
  idle: S,
  fallbackError: string,
  perform: (formData: FormData) => S
) {
  return async (_prevState: S, formData: FormData): Promise<S> => {
    try {
      return perform(formData)
    } catch (error) {
      return {
        ...idle,
        status: 'error',
        error: getErrorMessage(error) || fallbackError
      }
    }
  }
}

const idleItem: ItemState = { status: 'idle', error: null, itemId: null }

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

  const [addItemState, addToCartAction, addItemPending] = useActionState(
    createFormAction<AddItemState>(
      { status: 'idle', error: null, productId: null },
      'Failed to add item to cart',
      (formData) => {
        const { product, count } = decodeAddItem(formData)
        cart.addItem(product, { count })
        return {
          status: 'success',
          error: null,
          productId: getProductId(product)
        }
      }
    ),
    { status: 'idle', error: null, productId: null }
  )

  const [removeItemState, removeFromCartAction, removeItemPending] =
    useActionState(
      createFormAction<ItemState>(
        idleItem,
        'Failed to remove item',
        (formData) => {
          const itemId = decodeItemId(formData)
          cart.removeItem(itemId)
          return { status: 'success', error: null, itemId }
        }
      ),
      idleItem
    )

  const [updateQuantityState, updateQuantityAction, updateQuantityPending] =
    useActionState(
      createFormAction<QuantityState>(
        { status: 'idle', error: null, itemId: null, quantity: null },
        'Failed to update quantity',
        (formData) => {
          const { itemId, quantity } = decodeQuantity(formData)
          cart.setItemQuantity(itemId, quantity)
          return { status: 'success', error: null, itemId, quantity }
        }
      ),
      { status: 'idle', error: null, itemId: null, quantity: null }
    )

  const [clearCartState, clearCartAction, clearCartPending] = useActionState(
    createFormAction<ClearState>(
      { status: 'idle', error: null },
      'Failed to clear cart',
      () => {
        cart.clearCart()
        return { status: 'success', error: null }
      }
    ),
    { status: 'idle', error: null }
  )

  const [incrementItemState, incrementItemAction, incrementItemPending] =
    useActionState(
      createFormAction<ItemState>(
        idleItem,
        'Failed to increment item',
        (formData) => {
          const { itemId, count } = decodeCountChange(formData)
          cart.incrementItem(itemId, { count })
          return { status: 'success', error: null, itemId }
        }
      ),
      idleItem
    )

  const [decrementItemState, decrementItemAction, decrementItemPending] =
    useActionState(
      createFormAction<ItemState>(
        idleItem,
        'Failed to decrement item',
        (formData) => {
          const { itemId, count } = decodeCountChange(formData)
          cart.decrementItem(itemId, { count })
          return { status: 'success', error: null, itemId }
        }
      ),
      idleItem
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
