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
import { applyCartChange, cartTotals, type CartChange } from '../core/cartState'
import {
  cartCalls,
  toCartChange,
  validateCartCall,
  type CartCall,
  type CartCallName
} from '../core/cartCall'

export type { CartChange }

type OptimisticActions = {
  [K in CartCallName]: (...args: Parameters<(typeof cartCalls)[K]>) => void
}

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
      validateCartCall(call, store.getState().cartDetails)
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

  const { cartDetails: optimisticCartDetails, pendingIds } = optimistic
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

    const bind = (name: CartCallName) => {
      const toCall = cartCalls[name] as (...args: unknown[]) => CartCall
      const method = store[name] as (...args: unknown[]) => void
      return (...args: unknown[]) =>
        run(toCall(...args), () => method.apply(store, args))
    }

    return Object.fromEntries(
      Object.keys(cartCalls).map((name) => [name, bind(name as CartCallName)])
    ) as OptimisticActions
  }, [store, showChange])

  return {
    ...cart,
    cartDetails: optimisticCartDetails,
    cartCount: optimisticTotals.cartCount,
    totalPrice: optimisticTotals.totalPrice,
    formattedTotalPrice: optimisticTotals.formattedTotalPrice,
    isOptimistic,
    pendingIds,
    error,
    ...actions
  }
}
