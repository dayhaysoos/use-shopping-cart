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
import {
  applyCartChange,
  cartTotals,
  changedEntryId,
  type CartChange
} from '../core/cartState'

export interface OptimisticCartEntry extends CartEntry {
  _optimistic?: boolean
}

export type OptimisticCartDetails = {
  [id: string]: OptimisticCartEntry
}

export function useOptimisticCart() {
  const cart = useShoppingCart()

  const [optimisticCartDetails, updateOptimisticCart] = useOptimistic<
    OptimisticCartDetails,
    CartChange
  >(cart.cartDetails as OptimisticCartDetails, (state, change) => {
    const next: OptimisticCartDetails = applyCartChange(state, change, cart)
    const id = changedEntryId(change)

    return id && next !== state && next[id]
      ? { ...next, [id]: { ...next[id], _optimistic: true } }
      : next
  })

  const isOptimistic = Object.values(optimisticCartDetails).some(
    (item) => item._optimistic === true
  )

  const optimisticTotals = cartTotals(optimisticCartDetails, cart)

  const addItem = (product: Product, options: AddItemOptions = {}) => {
    startTransition(() => {
      updateOptimisticCart({
        type: 'add',
        product,
        count: options.count ?? 1,
        metadata: options
      })
      cart.addItem(product, options)
    })
  }

  const removeItem = (id: string) => {
    startTransition(() => {
      updateOptimisticCart({ type: 'remove', id })
      cart.removeItem(id)
    })
  }

  const incrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    startTransition(() => {
      updateOptimisticCart({ type: 'adjust', id, by: count })
      cart.incrementItem(id, { ...options, count })
    })
  }

  const decrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    startTransition(() => {
      updateOptimisticCart({ type: 'adjust', id, by: -count })
      cart.decrementItem(id, { ...options, count })
    })
  }

  const setItemQuantity = (id: string, quantity: number) => {
    startTransition(() => {
      updateOptimisticCart({ type: 'set', id, quantity })
      cart.setItemQuantity(id, quantity)
    })
  }

  const clearCart = () => {
    startTransition(() => {
      updateOptimisticCart({ type: 'clear' })
      cart.clearCart()
    })
  }

  return {
    ...cart,
    cartDetails: optimisticCartDetails as CartDetails,
    cartCount: optimisticTotals.cartCount,
    totalPrice: optimisticTotals.totalPrice,
    formattedTotalPrice: optimisticTotals.formattedTotalPrice,
    isOptimistic,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    setItemQuantity,
    clearCart
  }
}
