import { formatCurrencyString } from './formatters'
import type { Product, CartEntry } from './types'
import { findProductId } from './productId'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const generatedIdCache = new WeakMap<object, string>()

export function getProductId(product: Product): string {
  const existingId = findProductId(product)

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
  price_metadata?: Record<string, unknown>
  product_metadata?: Record<string, unknown>
}

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
