'use client'

import { useOptimistic, startTransition, useState } from 'react'
import { useShoppingCart } from './useShoppingCart'
import { useCartContext } from './CartProvider'
import type { ShoppingCart } from '../core/ShoppingCart'
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
  validateQuantity,
  validateItemExists
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

export function useOptimisticCart({ onChange }: UseOptimisticCartOptions = {}) {
  const cart = useShoppingCart()
  const store = useCartContext()
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
    commit: () => void,
    validate: (expectedCartDetails: () => CartDetails) => void = () => {}
  ) => {
    if (!onChange) {
      commit()
      return
    }

    const queue = getChangeQueue(store)
    validate(() => {
      const state = store.getState()
      return queue.queued.reduce(
        (details, queuedChange) =>
          applyCartChange(details, queuedChange, state),
        state.cartDetails
      )
    })
    queue.queued = [...queue.queued, change]

    startTransition(async () => {
      showChange(change)
      const task = queue.tail
        .then(async () => {
          validate(() => store.getState().cartDetails)
          await onChange(change)
          committedChanges.add(change)
          commit()
        })
        .finally(() => {
          queue.queued = queue.queued.filter((c) => c !== change)
        })
      queue.tail = task.catch(() => {})
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
