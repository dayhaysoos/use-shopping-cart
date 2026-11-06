'use client'

import { startTransition, useState } from 'react'
import { useShoppingCart } from './useShoppingCart'
import { useCartContext } from './cartContext'
import { markCommitted, useOptimisticCartContext } from './optimisticCartLayer'
import type { ShoppingCart } from '../core/ShoppingCart'
import type { Product, AddItemOptions, IncrementOptions } from '../core/types'
import { applyCartChange, cartTotals, type CartChange } from '../core/cartState'
import { toCartChange, type CartCall } from '../core/cartCall'

export type {
  OptimisticCartEntry,
  OptimisticCartDetails
} from './optimisticCartLayer'

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
  call: CartCall,
  onChange: (change: CartChange) => unknown,
  commit: () => void
): { change: CartChange; task: Promise<void> } {
  const queue = getChangeQueue(store)
  const state = store.getState()
  const change = toCartChange(
    call,
    queue.queued.reduce(
      (details, queuedChange) => applyCartChange(details, queuedChange, state),
      state.cartDetails
    )
  )
  queue.queued = [...queue.queued, change]

  const task = queue.tail.then(async () => {
    try {
      toCartChange(call, store.getState().cartDetails)
      await onChange(change)
      markCommitted(change)
      commit()
    } finally {
      queue.queued = queue.queued.filter((c) => c !== change)
    }
  })
  queue.tail = task.catch(() => {})
  return { change, task }
}

export function useOptimisticCart({ onChange }: UseOptimisticCartOptions = {}) {
  const cart = useShoppingCart()
  const store = useCartContext()
  const optimistic = useOptimisticCartContext()
  const [error, setError] = useState<unknown>(null)

  const optimisticCartDetails = optimistic.cartDetails
  const isOptimistic = optimisticCartDetails !== cart.cartDetails
  const optimisticTotals = isOptimistic
    ? cartTotals(optimisticCartDetails, cart)
    : cart

  const run = (call: CartCall, commit: () => void) => {
    if (!onChange) {
      commit()
      return
    }

    const { change, task } = enqueueChange(store, call, onChange, commit)
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
    run({ action: 'addItem', product, options }, () =>
      cart.addItem(product, options)
    )
  }

  const removeItem = (id: string) => {
    run({ action: 'removeItem', id }, () => cart.removeItem(id))
  }

  const incrementItem = (id: string, options: IncrementOptions = {}) => {
    run({ action: 'incrementItem', id, options }, () =>
      cart.incrementItem(id, options)
    )
  }

  const decrementItem = (id: string, options: IncrementOptions = {}) => {
    run({ action: 'decrementItem', id, options }, () =>
      cart.decrementItem(id, options)
    )
  }

  const setItemQuantity = (id: string, quantity: number) => {
    run({ action: 'setItemQuantity', id, quantity }, () =>
      cart.setItemQuantity(id, quantity)
    )
  }

  const clearCart = () => {
    run({ action: 'clearCart' }, () => cart.clearCart())
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
