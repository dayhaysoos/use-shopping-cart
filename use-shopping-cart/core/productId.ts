import type { Product } from './types'

export const productIdFields = ['id', 'price_id', 'sku_id', 'sku'] as const

function findProductId(product: Product): string | undefined {
  for (const field of productIdFields) {
    const value = product[field]
    if (value) return value
  }
  return undefined
}

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
