import { createCartEntry, updateCartEntry } from './Entry'
import { getProductId } from './productId'
import { calculateFormattedTotalPrice } from './formatters'
import type { AddItemOptions, CartDetails, CartState, Product } from './types'

export interface CartFormat {
  currency: string
  language: string
}

export function cartTotals(
  cartDetails: CartDetails,
  { currency, language }: CartFormat
): Pick<CartState, 'cartCount' | 'totalPrice' | 'formattedTotalPrice'> {
  let totalPrice = 0
  let cartCount = 0

  for (const id in cartDetails) {
    totalPrice += cartDetails[id].value
    cartCount += cartDetails[id].quantity
  }

  return {
    cartCount,
    totalPrice,
    formattedTotalPrice: calculateFormattedTotalPrice(
      totalPrice,
      currency,
      language
    )
  }
}

export function withCartDetails(
  state: CartState,
  cartDetails: CartDetails
): CartState {
  return { ...state, cartDetails, ...cartTotals(cartDetails, state) }
}

export function normalizeCartDetails(
  cartDetails: CartDetails,
  currency: string,
  language: string
): CartDetails {
  const normalized: CartDetails = {}

  for (const id in cartDetails) {
    normalized[id] = updateCartEntry(id, cartDetails[id], {
      currency,
      language
    })
  }

  return normalized
}

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

export function applyCartChange(
  cartDetails: CartDetails,
  change: CartChange,
  format: CartFormat
): CartDetails {
  switch (change.type) {
    case 'add': {
      const id = getProductId(change.product)
      const existing = cartDetails[id]
      const options = {
        ...format,
        price_metadata: change.metadata?.price_metadata,
        product_metadata: change.metadata?.product_metadata
      }
      const entry = existing
        ? updateCartEntry(id, existing, {
            ...options,
            quantity: existing.quantity + change.count
          })
        : createCartEntry(id, change.product, change.count, options)
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
        [change.id]: updateCartEntry(change.id, existing, {
          ...format,
          quantity
        })
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

export function changedEntryId(change: CartChange): string | undefined {
  if (change.type === 'add') return getProductId(change.product)
  if (change.type === 'clear') return undefined
  return change.id
}

function removeEntry(cartDetails: CartDetails, id: string): CartDetails {
  const { [id]: _removed, ...rest } = cartDetails
  return rest
}
