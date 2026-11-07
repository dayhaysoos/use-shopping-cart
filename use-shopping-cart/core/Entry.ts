import { formatCurrencyString } from './formatters'
import type { Product, CartEntry } from './types'

export interface CartEntryOptions {
  currency: string
  language: string
  price_metadata?: Record<string, unknown>
  product_metadata?: Record<string, unknown>
}

export interface CartEntryUpdate extends CartEntryOptions {
  quantity?: number
}

export function createCartEntry(
  id: string,
  product: Product,
  quantity: number,
  options: CartEntryOptions
): CartEntry {
  return buildEntry(id, product, quantity, options, new Date().toISOString())
}

export function updateCartEntry(
  id: string,
  entry: CartEntry,
  { quantity = entry.quantity, ...options }: CartEntryUpdate
): CartEntry {
  return buildEntry(
    id,
    entry,
    quantity,
    options,
    entry.timestamp || new Date().toISOString()
  )
}

function buildEntry(
  id: string,
  product: Product,
  quantity: number,
  { currency, language, price_metadata, product_metadata }: CartEntryOptions,
  timestamp: string
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
    timestamp,
    price_data: withMetadata(product.price_data, price_metadata),
    product_data: withMetadata(product.product_data, product_metadata)
  }
}

function withMetadata(
  data: Record<string, any> | undefined,
  metadata: Record<string, unknown> | undefined
): Record<string, any> {
  if (!metadata) return { ...data }
  return { ...data, metadata: { ...data?.metadata, ...metadata } }
}
