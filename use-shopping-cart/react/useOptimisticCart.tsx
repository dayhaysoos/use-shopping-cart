'use client'

import { useOptimistic, startTransition, useRef, useState } from 'react'
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
import {
  validateProduct,
  validateCount,
  validateQuantity
} from '../core/validation'

export interface OptimisticCartEntry extends CartEntry {
  _optimistic?: boolean
}

export type OptimisticCartDetails = {
  [id: string]: OptimisticCartEntry
}

export type { CartChange }

export interface UseOptimisticCartOptions {
  onChange?: (change: CartChange) => Promise<unknown> | unknown
}

const committedChanges = new WeakSet<CartChange>()

export function useOptimisticCart({ onChange }: UseOptimisticCartOptions = {}) {
  const cart = useShoppingCart()
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const [error, setError] = useState<unknown>(null)

  const [optimisticCartDetails, showChange] = useOptimistic<
    OptimisticCartDetails,
    CartChange
  >(cart.cartDetails as OptimisticCartDetails, (state, change) => {
    if (committedChanges.has(change)) return state
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

  const run = (
    change: CartChange,
    validate: () => void,
    commit: () => void
  ) => {
    if (!onChange) {
      commit()
      return
    }

    validate()
    startTransition(async () => {
      showChange(change)
      const task = queue.current.then(async () => {
        await onChange(change)
        committedChanges.add(change)
        commit()
      })
      queue.current = task.catch(() => {})
      try {
        await task
        setError(null)
      } catch (caught) {
        setError(caught)
      }
    })
  }

  const addItem = (product: Product, options: AddItemOptions = {}) => {
    const count = options.count ?? 1
    run(
      { type: 'add', product, count, metadata: options },
      () => {
        validateProduct(product)
        validateCount(count, 'addItem')
      },
      () => cart.addItem(product, options)
    )
  }

  const removeItem = (id: string) => {
    run(
      { type: 'remove', id },
      () => {},
      () => cart.removeItem(id)
    )
  }

  const incrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    run(
      { type: 'adjust', id, by: count },
      () => validateCount(count, 'incrementItem'),
      () => cart.incrementItem(id, { ...options, count })
    )
  }

  const decrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    run(
      { type: 'adjust', id, by: -count },
      () => validateCount(count, 'decrementItem'),
      () => cart.decrementItem(id, { ...options, count })
    )
  }

  const setItemQuantity = (id: string, quantity: number) => {
    run(
      { type: 'set', id, quantity },
      () => validateQuantity(quantity, 'setItemQuantity'),
      () => cart.setItemQuantity(id, quantity)
    )
  }

  const clearCart = () => {
    run(
      { type: 'clear' },
      () => {},
      () => cart.clearCart()
    )
  }

  return {
    ...cart,
    cartDetails: optimisticCartDetails as CartDetails,
    cartCount: optimisticTotals.cartCount,
    totalPrice: optimisticTotals.totalPrice,
    formattedTotalPrice: optimisticTotals.formattedTotalPrice,
    isOptimistic,
    error,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    setItemQuantity,
    clearCart
  }
}
