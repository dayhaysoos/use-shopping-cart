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
export type RemoveItemState = ItemState
export type UpdateQuantityState = QuantityState

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

function useFormAction<S extends ActionState>(
  idle: S,
  fallbackError: string,
  perform: (formData: FormData) => S
) {
  return useActionState<S, FormData>(async (_prevState, formData) => {
    try {
      return perform(formData)
    } catch (error) {
      return {
        ...idle,
        status: 'error',
        error: getErrorMessage(error) || fallbackError
      }
    }
  }, idle as Awaited<S>)
}

const idleItem: ItemState = { status: 'idle', error: null, itemId: null }

export function useCartActions() {
  const cart = useShoppingCart()

  const [addItemState, addToCartAction, addItemPending] =
    useFormAction<AddItemState>(
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
    )

  const [removeItemState, removeFromCartAction, removeItemPending] =
    useFormAction(idleItem, 'Failed to remove item', (formData) => {
      const itemId = decodeItemId(formData)
      cart.removeItem(itemId)
      return { status: 'success', error: null, itemId }
    })

  const [updateQuantityState, updateQuantityAction, updateQuantityPending] =
    useFormAction<QuantityState>(
      { status: 'idle', error: null, itemId: null, quantity: null },
      'Failed to update quantity',
      (formData) => {
        const { itemId, quantity } = decodeQuantity(formData)
        cart.setItemQuantity(itemId, quantity)
        return { status: 'success', error: null, itemId, quantity }
      }
    )

  const [clearCartState, clearCartAction, clearCartPending] =
    useFormAction<ClearState>(
      { status: 'idle', error: null },
      'Failed to clear cart',
      () => {
        cart.clearCart()
        return { status: 'success', error: null }
      }
    )

  const [incrementItemState, incrementItemAction, incrementItemPending] =
    useFormAction(idleItem, 'Failed to increment item', (formData) => {
      const { itemId, count } = decodeCountChange(formData)
      cart.incrementItem(itemId, { count })
      return { status: 'success', error: null, itemId }
    })

  const [decrementItemState, decrementItemAction, decrementItemPending] =
    useFormAction(idleItem, 'Failed to decrement item', (formData) => {
      const { itemId, count } = decodeCountChange(formData)
      cart.decrementItem(itemId, { count })
      return { status: 'success', error: null, itemId }
    })

  return {
    addToCartAction,
    addItemState,
    isAddingItem: addItemPending,

    removeFromCartAction,
    removeItemState,
    isRemovingItem: removeItemPending,

    updateQuantityAction,
    updateQuantityState,
    isUpdatingQuantity: updateQuantityPending,

    incrementItemAction,
    incrementItemState,
    isIncrementingItem: incrementItemPending,

    decrementItemAction,
    decrementItemState,
    isDecrementingItem: decrementItemPending,

    clearCartAction,
    clearCartState,
    isClearingCart: clearCartPending,

    isPending:
      addItemPending ||
      removeItemPending ||
      updateQuantityPending ||
      incrementItemPending ||
      decrementItemPending ||
      clearCartPending
  }
}
