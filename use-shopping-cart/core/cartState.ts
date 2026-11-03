import { createCartEntry, getProductId } from './Entry'
import { calculateFormattedTotalPrice } from './formatters'
import type { AddItemOptions, CartDetails, CartState, Product } from './types'

/**
 * Return `state` with `cartDetails` replaced and every derived field
 * (`cartCount`, `totalPrice`, `formattedTotalPrice`) recomputed from it.
 *
 * This is the only place cart totals are calculated, so totals always equal
 * the sum of the entries.
 */
export function withCartDetails<S extends CartState>(
  state: S,
  cartDetails: CartDetails
): S {
  let totalPrice = 0
  let cartCount = 0

  for (const id in cartDetails) {
    totalPrice += cartDetails[id].value
    cartCount += cartDetails[id].quantity
  }

  return {
    ...state,
    cartDetails,
    cartCount,
    totalPrice,
    formattedTotalPrice: calculateFormattedTotalPrice(
      totalPrice,
      state.currency,
      state.language
    )
  }
}

/**
 * Rebuild entries that came from outside the cart's own operations (storage,
 * config, `loadCart`) or whose formatting is stale after a currency or
 * language change. Each entry's `value` and formatted strings are derived
 * from its `price` and `quantity`; existing timestamps are kept.
 */
export function normalizeCartDetails(
  cartDetails: CartDetails,
  currency: string,
  language: string
): CartDetails {
  const normalized: CartDetails = {}

  for (const id in cartDetails) {
    const entry = cartDetails[id]
    const rebuilt = createCartEntry(id, entry, entry.quantity, {
      currency,
      language
    })
    normalized[id] = entry.timestamp
      ? { ...rebuilt, timestamp: entry.timestamp }
      : rebuilt
  }

  return normalized
}

export interface CartFormat {
  currency: string
  language: string
}

/** A change to cartDetails. Quantities that reach 0 or below remove the entry. */
export type CartChange =
  | {
      type: 'add'
      product: Product
      count: number
      metadata?: Pick<AddItemOptions, 'price_metadata' | 'product_metadata'>
    }
  | { type: 'adjust'; id: string; by: number }
  | { type: 'set'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

/**
 * Apply a change to cartDetails and return the new cartDetails.
 * Changes to ids that aren't in the cart return `cartDetails` unchanged;
 * callers that need to reject those validate first.
 *
 * Shared by `ShoppingCart` and `useOptimisticCart`, so optimistic entries
 * match the real ones.
 */
export function applyCartChange(
  cartDetails: CartDetails,
  change: CartChange,
  format: CartFormat
): CartDetails {
  switch (change.type) {
    case 'add': {
      const id = getProductId(change.product)
      const existing = cartDetails[id]
      const entry = createCartEntry(
        id,
        existing ?? change.product,
        (existing?.quantity ?? 0) + change.count,
        { ...format, ...change.metadata }
      )
      return { ...cartDetails, [id]: entry }
    }

    case 'adjust':
    case 'set': {
      const existing = cartDetails[change.id]
      if (!existing) return cartDetails

      const quantity =
        change.type === 'adjust'
          ? existing.quantity + change.by
          : change.quantity
      if (quantity <= 0) return removeEntry(cartDetails, change.id)

      return {
        ...cartDetails,
        [change.id]: createCartEntry(change.id, existing, quantity, format)
      }
    }

    case 'remove':
      return change.id in cartDetails
        ? removeEntry(cartDetails, change.id)
        : cartDetails

    case 'clear':
      return {}
  }
}

function removeEntry(cartDetails: CartDetails, id: string): CartDetails {
  const { [id]: _removed, ...rest } = cartDetails
  return rest
}
