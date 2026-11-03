import { formatCurrencyString } from './formatters'
import type { Product, CartEntry } from './types'

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

const generatedIdCache = new WeakMap<object, string>()

/**
 * Extract the ID from a product (or generate one if missing).
 */
export function getProductId(product: Product): string {
  const existingId =
    ('id' in product && product.id) ||
    ('price_id' in product && product.price_id) ||
    ('sku_id' in product && product.sku_id) ||
    ('sku' in product && product.sku)

  if (existingId) return existingId

  const cachedId = generatedIdCache.get(product as object)
  if (cachedId) return cachedId

  const generatedId = generateUUID()
  generatedIdCache.set(product as object, generatedId)
  return generatedId
}

export interface CartEntryOptions {
  currency: string
  language: string
  /** Merged into the entry's `price_data` */
  price_metadata?: Record<string, unknown>
  /** Merged into the entry's `product_data` */
  product_metadata?: Record<string, unknown>
}

/**
 * Create a cart entry from a product. `value` and the formatted strings are
 * derived from `price` and `quantity`.
 */
export function createCartEntry(
  id: string,
  product: Product,
  quantity: number,
  { currency, language, price_metadata, product_metadata }: CartEntryOptions
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
    timestamp: new Date().toISOString(),
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
