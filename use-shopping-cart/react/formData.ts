import type { Product } from '../core/types'
import { validateProduct } from '../core/validation'

// Decoders for useCartActions: FormData in, typed input out. Invalid input
// throws; the error message becomes the action's `error` state.

const MAX_PRODUCT_JSON_LENGTH = 50_000

/** Fields: `product` (JSON), optional `count`. */
export function decodeAddItem(formData: FormData): {
  product: Product
  count: number
} {
  const productJSON = formData.get('product')
  if (!productJSON || typeof productJSON !== 'string') {
    throw new Error('Product data is required')
  }
  if (productJSON.length > MAX_PRODUCT_JSON_LENGTH) {
    throw new Error('Product data is too large')
  }

  const product = parseJSON(productJSON)
  if (product === undefined) {
    throw new Error('Product data must be valid JSON')
  }

  validateProduct(product)
  return { product: product as Product, count: decodeCount(formData) }
}

/** Fields: `itemId`. */
export function decodeItemId(formData: FormData): string {
  const itemId = formData.get('itemId')
  if (!itemId || typeof itemId !== 'string') {
    throw new Error('Item ID is required')
  }
  return itemId
}

/** Fields: `itemId`, optional `count` (defaults to 1). */
export function decodeCountChange(formData: FormData): {
  itemId: string
  count: number
} {
  const itemId = decodeItemId(formData)
  return { itemId, count: decodeCount(formData) }
}

/** Fields: `itemId`, `quantity` (0 removes the item). */
export function decodeQuantity(formData: FormData): {
  itemId: string
  quantity: number
} {
  const itemId = formData.get('itemId')
  const quantity = formData.get('quantity')
  if (
    !itemId ||
    typeof itemId !== 'string' ||
    !quantity ||
    typeof quantity !== 'string'
  ) {
    throw new Error('Item ID and quantity are required')
  }

  return { itemId, quantity: toInteger(quantity, 'quantity', 'non-negative') }
}

/** Parsed JSON, or undefined if `text` isn't valid JSON. */
function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** Optional `count` field; defaults to 1. */
function decodeCount(formData: FormData): number {
  const count = formData.get('count')
  if (count === null) return 1
  if (typeof count !== 'string') throw new Error('count must be a string')
  return toInteger(count, 'count', 'positive')
}

function toInteger(
  value: string,
  fieldName: string,
  kind: 'positive' | 'non-negative'
): number {
  const parsed = Number(value)
  const inRange = kind === 'positive' ? parsed > 0 : parsed >= 0
  if (!Number.isInteger(parsed) || !inRange) {
    throw new Error(`${fieldName} must be a ${kind} integer`)
  }
  return parsed
}
