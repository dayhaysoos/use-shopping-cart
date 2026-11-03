import { createCartEntry } from './Entry'
import { calculateFormattedTotalPrice } from './formatters'
import type { CartDetails, CartState } from './types'

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
