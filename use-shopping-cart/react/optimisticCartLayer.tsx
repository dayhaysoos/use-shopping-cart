'use client'

import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  type ReactNode
} from 'react'
import { useShoppingCart } from './useShoppingCart'
import type { CartDetails } from '../core/types'
import {
  applyCartChange,
  changedEntryId,
  type CartChange,
  type CartFormat
} from '../core/cartState'

interface PendingCart {
  cartDetails: CartDetails
  pendingIds: ReadonlySet<string>
}

const noPendingIds: ReadonlySet<string> = new Set()

const committedChanges = new WeakSet<CartChange>()

export function markCommitted(change: CartChange): void {
  committedChanges.add(change)
}

function showPendingChange(
  pending: PendingCart,
  change: CartChange,
  format: CartFormat
): PendingCart {
  if (committedChanges.has(change)) return pending
  const cartDetails = applyCartChange(pending.cartDetails, change, format)
  const id = changedEntryId(change)
  const pendingIds =
    id && cartDetails !== pending.cartDetails && cartDetails[id]
      ? new Set([...pending.pendingIds, id])
      : pending.pendingIds
  return { cartDetails, pendingIds }
}

interface OptimisticCart extends PendingCart {
  showChange: (change: CartChange) => void
}

const OptimisticCartContext = createContext<OptimisticCart | null>(null)

export function OptimisticCartLayer({ children }: { children: ReactNode }) {
  const cartDetails = useShoppingCart((cart) => cart.cartDetails)
  const currency = useShoppingCart((cart) => cart.currency)
  const language = useShoppingCart((cart) => cart.language)

  const committed = useMemo(
    () => ({ cartDetails, pendingIds: noPendingIds }),
    [cartDetails]
  )
  const [pending, showChange] = useOptimistic<PendingCart, CartChange>(
    committed,
    (state, change) => showPendingChange(state, change, { currency, language })
  )

  const value = useMemo(
    () => ({ ...pending, showChange }),
    [pending, showChange]
  )

  return (
    <OptimisticCartContext.Provider value={value}>
      {children}
    </OptimisticCartContext.Provider>
  )
}

export function useOptimisticCartContext(): OptimisticCart {
  return useContext(OptimisticCartContext)!
}
