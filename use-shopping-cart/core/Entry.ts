import { formatISO } from 'date-fns'
import { formatCurrencyString } from './formatters'
import type { Product, CartEntry, CartDetails } from './types'

/**
 * Generate a UUID for products without an ID
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Extract the ID from a product (or generate one if missing).
 * If a UUID is generated, it is attached to the product object
 * to ensure consistent identification on subsequent calls.
 */
export function getProductId(product: Product): string {
  const existingId =
    ('id' in product && product.id) ||
    ('price_id' in product && product.price_id) ||
    ('sku_id' in product && product.sku_id) ||
    ('sku' in product && product.sku)

  if (existingId) return existingId

  // Generate and attach ID to product for consistency
  const generatedId = generateUUID()
  ;(product as { id?: string }).id = generatedId
  return generatedId
}

/**
 * Create a new cart entry from a product
 */
export function createCartEntry(
  id: string,
  product: Product,
  quantity: number,
  price_metadata: Record<string, unknown> = {},
  product_metadata: Record<string, unknown> = {},
  currency: string,
  language: string
): CartEntry {
  const value = product.price * quantity

  return {
    ...product,
    id,
    quantity,
    value,
    formattedValue: formatCurrencyString({ value, currency, language }),
    formattedPrice: formatCurrencyString({
      value: product.price,
      currency,
      language
    }),
    timestamp: formatISO(new Date()),
    price_data: {
      ...product.price_data,
      ...price_metadata
    },
    product_data: {
      ...product.product_data,
      ...product_metadata
    }
  }
}

/**
 * Immutably add an entry to cartDetails.
 * Returns a new cartDetails object.
 */
export function addEntryToCart(
  cartDetails: CartDetails,
  entry: CartEntry
): CartDetails {
  return {
    ...cartDetails,
    [entry.id]: entry
  }
}

/**
 * Immutably remove an entry from cartDetails.
 * Returns a new cartDetails object.
 */
export function removeEntryFromCart(
  cartDetails: CartDetails,
  id: string
): CartDetails {
  const { [id]: removed, ...rest } = cartDetails
  return rest
}

/**
 * Calculate total values from cartDetails.
 */
export function calculateTotals(cartDetails: CartDetails): {
  totalPrice: number
  cartCount: number
} {
  let totalPrice = 0
  let cartCount = 0

  for (const id in cartDetails) {
    const entry = cartDetails[id]
    totalPrice += entry.value
    cartCount += entry.quantity
  }

  return { totalPrice, cartCount }
}
