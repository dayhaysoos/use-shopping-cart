'use client'

import { startTransition, useState } from 'react'
import { useShoppingCart } from './useShoppingCart'
import { useCartContext } from './cartContext'
import {
  committedChanges,
  useOptimisticCartContext
} from './optimisticCartContext'
import type { ShoppingCart } from '../core/ShoppingCart'
import type {
  CartDetails,
  Product,
  AddItemOptions,
  IncrementOptions
} from '../core/types'
import { applyCartChange, cartTotals, type CartChange } from '../core/cartState'
import {
  validateProduct,
  validateCount,
  validateQuantity,
  validateItemExists
} from '../core/validation'

export type {
  OptimisticCartEntry,
  OptimisticCartDetails
} from './optimisticCartContext'

export type { CartChange }

export interface UseOptimisticCartOptions {
  onChange?: (change: CartChange) => Promise<unknown> | unknown
}

interface ChangeQueue {
  tail: Promise<unknown>
  queued: CartChange[]
}

const changeQueues = new WeakMap<ShoppingCart, ChangeQueue>()

function getChangeQueue(store: ShoppingCart): ChangeQueue {
  let queue = changeQueues.get(store)
  if (!queue) {
    queue = { tail: Promise.resolve(), queued: [] }
    changeQueues.set(store, queue)
  }
  return queue
}

function enqueueChange(
  store: ShoppingCart,
  change: CartChange,
  validate: (expectedCartDetails: () => CartDetails) => void,
  onChange: (change: CartChange) => unknown,
  commit: () => void
): Promise<void> {
  const queue = getChangeQueue(store)
  validate(() => {
    const state = store.getState()
    return queue.queued.reduce(
      (details, queuedChange) => applyCartChange(details, queuedChange, state),
      state.cartDetails
    )
  })
  queue.queued = [...queue.queued, change]

  const task = queue.tail.then(async () => {
    try {
      validate(() => store.getState().cartDetails)
      await onChange(change)
      committedChanges.add(change)
      commit()
    } finally {
      queue.queued = queue.queued.filter((c) => c !== change)
    }
  })
  queue.tail = task.catch(() => {})
  return task
}

export function useOptimisticCart({ onChange }: UseOptimisticCartOptions = {}) {
  const cart = useShoppingCart()
  const store = useCartContext()
  const optimistic = useOptimisticCartContext()
  const [error, setError] = useState<unknown>(null)

  const optimisticCartDetails = optimistic.cartDetails
  const isOptimistic = optimisticCartDetails !== cart.cartDetails
  const optimisticTotals = cartTotals(optimisticCartDetails, cart)

  const run = (
    change: CartChange,
    commit: () => void,
    validate: (expectedCartDetails: () => CartDetails) => void = () => {}
  ) => {
    if (!onChange) {
      commit()
      return
    }

    const task = enqueueChange(store, change, validate, onChange, commit)
    startTransition(async () => {
      optimistic.showChange(change)
      try {
        await task
        startTransition(() => setError(null))
      } catch (caught) {
        startTransition(() => setError(caught))
      }
    })
  }

  const addItem = (product: Product, options: AddItemOptions = {}) => {
    const count = options.count ?? 1
    run(
      { type: 'add', product, count, metadata: options },
      () => cart.addItem(product, options),
      () => {
        validateProduct(product)
        validateCount(count, 'addItem')
      }
    )
  }

  const removeItem = (id: string) => {
    run(
      { type: 'remove', id },
      () => cart.removeItem(id),
      (expectedCartDetails) =>
        validateItemExists(id, expectedCartDetails(), 'removeItem')
    )
  }

  const incrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    run(
      { type: 'adjust', id, by: count },
      () => cart.incrementItem(id, { ...options, count }),
      (expectedCartDetails) => {
        validateCount(count, 'incrementItem')
        validateItemExists(id, expectedCartDetails(), 'incrementItem')
      }
    )
  }

  const decrementItem = (id: string, options: IncrementOptions = {}) => {
    const count = options.count ?? 1
    run(
      { type: 'adjust', id, by: -count },
      () => cart.decrementItem(id, { ...options, count }),
      (expectedCartDetails) => {
        validateCount(count, 'decrementItem')
        validateItemExists(id, expectedCartDetails(), 'decrementItem')
      }
    )
  }

  const setItemQuantity = (id: string, quantity: number) => {
    run(
      { type: 'set', id, quantity },
      () => cart.setItemQuantity(id, quantity),
      (expectedCartDetails) => {
        validateQuantity(quantity, 'setItemQuantity')
        validateItemExists(id, expectedCartDetails(), 'setItemQuantity')
      }
    )
  }

  const clearCart = () => {
    run({ type: 'clear' }, () => cart.clearCart())
  }

  return {
    ...cart,
    cartDetails: optimisticCartDetails,
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
