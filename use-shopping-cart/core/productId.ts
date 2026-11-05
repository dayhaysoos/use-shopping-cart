import type { Product } from './types'

export const productIdFields = ['id', 'price_id', 'sku_id', 'sku'] as const

export function findProductId(product: Product): string | undefined {
  for (const field of productIdFields) {
    const value = product[field]
    if (value) return value
  }
  return undefined
}
