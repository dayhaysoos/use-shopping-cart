import type { Product } from '../core/types'
import { validateProduct } from '../core/validation'
import { CartError, type CartErrorCode } from '../core/errors'

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
  const itemId = formData.get('itemId')
  const quantity = formData.get('quantity')
  if (
    !itemId ||
    typeof itemId !== 'string' ||
    !quantity ||
    typeof quantity !== 'string'
  ) {
    throw new CartError(
      'INVALID_FORM_DATA',
      'Item ID and quantity are required'
    )
  }

  return {
    itemId,
    quantity: toInteger(quantity, 'quantity')
  }
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
  if (typeof count !== 'string')
    throw new CartError('INVALID_COUNT', 'count must be a string')
  return toInteger(count, 'count')
}

const integerFields = {
  count: { kind: 'positive', code: 'INVALID_COUNT' },
  quantity: { kind: 'non-negative', code: 'INVALID_QUANTITY' }
} as const satisfies Record<string, { kind: string; code: CartErrorCode }>

function toInteger(value: string, field: keyof typeof integerFields): number {
  const { kind, code } = integerFields[field]
  const parsed = Number(value)
  const inRange = kind === 'positive' ? parsed > 0 : parsed >= 0
  if (!Number.isInteger(parsed) || !inRange) {
    throw new CartError(code, `${field} must be a ${kind} integer`)
  }
  return parsed
}
