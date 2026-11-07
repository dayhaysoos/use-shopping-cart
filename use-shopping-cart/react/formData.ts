import type { Product } from '../core/types'
import { validateProduct } from '../core/validation'
import { CartError } from '../core/errors'

const MAX_PRODUCT_JSON_LENGTH = 50_000

export function decodeAddItem(formData: FormData): {
  product: Product
  count: number
} {
  const productJSON = formData.get('product')
  if (!productJSON || typeof productJSON !== 'string') {
    throw new CartError('INVALID_FORM_DATA', 'Product data is required')
  }
  if (productJSON.length > MAX_PRODUCT_JSON_LENGTH) {
    throw new CartError('INVALID_FORM_DATA', 'Product data is too large')
  }

  const product = parseJSON(productJSON)
  if (product === undefined) {
    throw new CartError('INVALID_FORM_DATA', 'Product data must be valid JSON')
  }

  validateProduct(product)
  return { product: product as Product, count: decodeCount(formData) }
}

export function decodeItemId(formData: FormData): string {
  const itemId = formData.get('itemId')
  if (!itemId || typeof itemId !== 'string') {
    throw new CartError('INVALID_FORM_DATA', 'Item ID is required')
  }
  return itemId
}

export function decodeCountChange(formData: FormData): {
  itemId: string
  count: number
} {
  const itemId = decodeItemId(formData)
  return { itemId, count: decodeCount(formData) }
}

export function decodeQuantity(formData: FormData): {
  itemId: string
  quantity: number
} {
  const itemId = decodeItemId(formData)
  const quantity = formData.get('quantity')
  if (!quantity || typeof quantity !== 'string') {
    throw new CartError('INVALID_FORM_DATA', 'Quantity is required')
  }
  return { itemId, quantity: Number(quantity) }
}

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function decodeCount(formData: FormData): number {
  const count = formData.get('count')
  if (count === null) return 1
  if (typeof count !== 'string') {
    throw new CartError('INVALID_FORM_DATA', 'count must be a string')
  }
  return Number(count)
}
