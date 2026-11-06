'use client'

import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  type ReactNode
} from 'react'
import { useShoppingCart } from './useShoppingCart'
import type { CartEntry } from '../core/types'
import {
  applyCartChange,
  changedEntryId,
  type CartChange,
  type CartFormat
} from '../core/cartState'
import { CartError } from '../core/errors'

export interface OptimisticCartEntry extends CartEntry {
  _optimistic?: boolean
}

export type OptimisticCartDetails = {
  [id: string]: OptimisticCartEntry
}

const committedChanges = new WeakSet<CartChange>()

export function markCommitted(change: CartChange): void {
  committedChanges.add(change)
}

function showPendingChange(
  details: OptimisticCartDetails,
  change: CartChange,
  format: CartFormat
): OptimisticCartDetails {
  if (committedChanges.has(change)) return details
  const next: OptimisticCartDetails = applyCartChange(details, change, format)
  const id = changedEntryId(change)
  return id && next !== details && next[id]
    ? { ...next, [id]: { ...next[id], _optimistic: true } }
    : next
}

interface OptimisticCart {
  cartDetails: OptimisticCartDetails
  showChange: (change: CartChange) => void
}

const OptimisticCartContext = createContext<OptimisticCart | null>(null)

export function OptimisticCartLayer({ children }: { children: ReactNode }) {
  const cartDetails = useShoppingCart((cart) => cart.cartDetails)
  const currency = useShoppingCart((cart) => cart.currency)
  const language = useShoppingCart((cart) => cart.language)

  const [optimisticCartDetails, showChange] = useOptimistic<
    OptimisticCartDetails,
    CartChange
  >(cartDetails, (state, change) =>
    showPendingChange(state, change, { currency, language })
  )

  const value = useMemo(
    () => ({ cartDetails: optimisticCartDetails, showChange }),
    [optimisticCartDetails, showChange]
  )

  return (
    <OptimisticCartContext.Provider value={value}>
      {children}
    </OptimisticCartContext.Provider>
  )
}

export function useOptimisticCartContext(): OptimisticCart {
  const optimistic = useContext(OptimisticCartContext)
  if (!optimistic) {
    throw new CartError(
      'NO_CART_PROVIDER',
      'useOptimisticCartContext must be used within CartProvider'
    )
  }
  return optimistic
}
