import type { CartDetails } from './types'
import { CartError, type CartErrorCode } from './errors'

/**
 * Returns the constructor name of any value.
 */
function typeOf(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  return (value as any).constructor.name
}

function fail(code: CartErrorCode, message: string): never {
  console.warn(message)
  throw new CartError(code, message)
}

export function validateInteger(
  value: unknown,
  name: string,
  min: 0 | 1,
  code: CartErrorCode,
  where: string
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(
      code,
      `Invalid ${name} in ${where}: ${name} must be a finite number. The current type is ${typeOf(value)}.`
    )
  }

  if (!Number.isInteger(value)) {
    fail(
      code,
      `Invalid ${name} in ${where}: ${name} must be an integer. The current value is ${value}.`
    )
  }

  if (value < min) {
    const bound = min === 1 ? 'greater than 0' : 'greater than or equal to 0'
    fail(
      code,
      `Invalid ${name} in ${where}: ${name} must be ${bound}. The current value is ${value}.`
    )
  }
}

export function validateCount(count: unknown, actionName: string): void {
  validateInteger(count, 'count', 1, 'INVALID_COUNT', actionName)
}

export function validateQuantity(quantity: unknown, actionName: string): void {
  validateInteger(quantity, 'quantity', 0, 'INVALID_QUANTITY', actionName)
}

export function validateItemExists(
  id: string,
  cartDetails: CartDetails,
  actionName: string
): void {
  if (!(id in cartDetails)) {
    const error = `Invalid product ID in ${actionName}: the ID "${id}" must already be in the cart.`
    fail('ITEM_NOT_IN_CART', error)
  }
}

export function validateProduct(product: unknown): void {
  if (!product || typeof product !== 'object') {
    throw new CartError('INVALID_PRODUCT', 'Product must be an object')
  }

  const p = product as Record<string, unknown>

  if (typeof p.price !== 'number') {
    throw new CartError('INVALID_PRODUCT', 'Product.price must be a number')
  }

  if (!p.currency || typeof p.currency !== 'string') {
    throw new CartError('INVALID_PRODUCT', 'Product.currency must be a string')
  }

  if (!p.name || typeof p.name !== 'string') {
    throw new CartError('INVALID_PRODUCT', 'Product.name must be a string')
  }
}
