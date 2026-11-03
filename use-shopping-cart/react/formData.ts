import type { Product } from '../core/types'
import { validateProduct } from '../core/validation'

// Decoders for useCartActions: FormData in, typed input out. Each throws a
// FormInputError whose message is shown to the user as the action's error.

export class FormInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FormInputError'
  }
}

const MAX_PRODUCT_JSON_LENGTH = 50_000

/** Fields: `product` (JSON), optional `count`. */
export function decodeAddItem(formData: FormData): {
  product: Product
  count: number
} {
  const productJSON = formData.get('product')
  if (!productJSON || typeof productJSON !== 'string') {
    throw new FormInputError('Product data is required')
  }
  if (productJSON.length > MAX_PRODUCT_JSON_LENGTH) {
    throw new FormInputError('Product data is too large')
  }

  let product: unknown
  try {
    product = JSON.parse(productJSON)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new FormInputError('Product data must be valid JSON')
    }
    throw error
  }

  validateProduct(product)
  const count = parsePositiveInteger(formData.get('count'), 'count') ?? 1

  return { product: product as Product, count }
}

/** Fields: `itemId`. */
export function decodeItemId(formData: FormData): string {
  const itemId = formData.get('itemId')
  if (!itemId || typeof itemId !== 'string') {
    throw new FormInputError('Item ID is required')
  }
  return itemId
}

/** Fields: `itemId`, optional `count` (defaults to 1). */
export function decodeCountChange(formData: FormData): {
  itemId: string
  count: number
} {
  const itemId = decodeItemId(formData)
  const count = parsePositiveInteger(formData.get('count'), 'count') ?? 1
  return { itemId, count }
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
    throw new FormInputError('Item ID and quantity are required')
  }

  return {
    itemId,
    quantity: parseInteger(quantity, 'quantity', 'non-negative')!
  }
}

function parsePositiveInteger(
  value: FormDataEntryValue | null,
  fieldName: string
): number | null {
  return parseInteger(value, fieldName, 'positive')
}

function parseInteger(
  value: FormDataEntryValue | null,
  fieldName: string,
  kind: 'positive' | 'non-negative'
): number | null {
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new FormInputError(`${fieldName} must be a string`)
  }

  const parsed = Number(value)
  const inRange = kind === 'positive' ? parsed > 0 : parsed >= 0
  if (!Number.isInteger(parsed) || !inRange) {
    throw new FormInputError(`${fieldName} must be a ${kind} integer`)
  }

  return parsed
}
