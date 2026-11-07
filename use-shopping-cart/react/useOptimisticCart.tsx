'use client'

import {
  startTransition,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
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
      try {
        commit()
      } catch {
        // Backend already accepted the change via onChange, so commit failures
        // should not propagate as errors (cart state will reconcile on next sync)
      }
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

  const onChangeRef = useRef(onChange)
  useLayoutEffect(() => {
    onChangeRef.current = onChange
  })

  const { showChange } = optimistic
  const actions = useMemo(() => {
    const run = (call: CartCall, commit: () => void) => {
      const onChange = onChangeRef.current
      if (!onChange) {
        commit()
        return
      }

      const { change, task } = enqueueChange(store, call, onChange, commit)
      startTransition(async () => {
        showChange(change)
        try {
          await task
          startTransition(() => setError(null))
        } catch (caught) {
          startTransition(() => setError(caught))
        }
      })
    }

    return {
      addItem: (product: Product, options: AddItemOptions = {}) =>
        run({ action: 'addItem', product, options }, () =>
          store.addItem(product, options)
        ),
      removeItem: (id: string) =>
        run({ action: 'removeItem', id }, () => store.removeItem(id)),
      incrementItem: (id: string, options: IncrementOptions = {}) =>
        run({ action: 'incrementItem', id, options }, () =>
          store.incrementItem(id, options)
        ),
      decrementItem: (id: string, options: IncrementOptions = {}) =>
        run({ action: 'decrementItem', id, options }, () =>
          store.decrementItem(id, options)
        ),
      setItemQuantity: (id: string, quantity: number) =>
        run({ action: 'setItemQuantity', id, quantity }, () =>
          store.setItemQuantity(id, quantity)
        ),
      clearCart: () => run({ action: 'clearCart' }, () => store.clearCart())
    }
  }, [store, showChange])

  return {
    ...cart,
    cartDetails: optimisticCartDetails,
    cartCount: optimisticTotals.cartCount,
    totalPrice: optimisticTotals.totalPrice,
    formattedTotalPrice: optimisticTotals.formattedTotalPrice,
    isOptimistic,
    error,
    ...actions
  }
}
