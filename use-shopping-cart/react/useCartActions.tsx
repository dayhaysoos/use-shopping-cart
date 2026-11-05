'use client'

import { useActionState } from 'react'
import { useShoppingCart } from './useShoppingCart'
import { getProductId } from '../core/Entry'
import { isCartError, type CartErrorCode } from '../core/errors'
import {
  decodeAddItem,
  decodeCountChange,
  decodeItemId,
  decodeQuantity
} from './formData'

export interface ActionState {
  status: 'idle' | 'success' | 'error'
  error: string | null
  errorCode: CartErrorCode | null
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
export type ClearState = Pick<ActionState, 'status' | 'error' | 'errorCode'>
export type RemoveItemState = ItemState
export type UpdateQuantityState = QuantityState

type ActionFields<S> = Omit<S, keyof ClearState>

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

function useFormAction<S extends ClearState>(
  idleFields: ActionFields<S>,
  fallbackError: string,
  perform: (formData: FormData) => ActionFields<S>
) {
  const idle = {
    ...idleFields,
    status: 'idle',
    error: null,
    errorCode: null
  } as S

  return useActionState<S, FormData>(async (_prevState, formData) => {
    try {
      return {
        ...perform(formData),
        status: 'success',
        error: null,
        errorCode: null
      } as S
    } catch (error) {
      return {
        ...idleFields,
        status: 'error',
        error: getErrorMessage(error) || fallbackError,
        errorCode: isCartError(error) ? error.code : 'UNKNOWN'
      } as S
    }
  }, idle as Awaited<S>)
}

export function useCartActions() {
  const cart = useShoppingCart()

  const [addItemState, addToCartAction, addItemPending] =
    useFormAction<AddItemState>(
      { productId: null },
      'Failed to add item to cart',
      (formData) => {
        const { product, count } = decodeAddItem(formData)
        cart.addItem(product, { count })
        return { productId: getProductId(product) }
      }
    )

  const [removeItemState, removeFromCartAction, removeItemPending] =
    useFormAction<ItemState>(
      { itemId: null },
      'Failed to remove item',
      (formData) => {
        const itemId = decodeItemId(formData)
        cart.removeItem(itemId)
        return { itemId }
      }
    )

  const [updateQuantityState, updateQuantityAction, updateQuantityPending] =
    useFormAction<QuantityState>(
      { itemId: null, quantity: null },
      'Failed to update quantity',
      (formData) => {
        const { itemId, quantity } = decodeQuantity(formData)
        cart.setItemQuantity(itemId, quantity)
        return { itemId, quantity }
      }
    )

  const [clearCartState, clearCartAction, clearCartPending] =
    useFormAction<ClearState>({}, 'Failed to clear cart', () => {
      cart.clearCart()
      return {}
    })

  const [incrementItemState, incrementItemAction, incrementItemPending] =
    useFormAction<ItemState>(
      { itemId: null },
      'Failed to increment item',
      (formData) => {
        const { itemId, count } = decodeCountChange(formData)
        cart.incrementItem(itemId, { count })
        return { itemId }
      }
    )

  const [decrementItemState, decrementItemAction, decrementItemPending] =
    useFormAction<ItemState>(
      { itemId: null },
      'Failed to decrement item',
      (formData) => {
        const { itemId, count } = decodeCountChange(formData)
        cart.decrementItem(itemId, { count })
        return { itemId }
      }
    )

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
