import type { CartDetails, CartEntryInput } from './types'
import { CartError, type CartErrorCode } from './errors'

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
    fail('INVALID_PRODUCT', 'Product must be an object')
  }

  const p = product as Record<string, unknown>

  if (typeof p.price !== 'number') {
    fail('INVALID_PRODUCT', 'Product.price must be a number')
  }

  if (!p.currency || typeof p.currency !== 'string') {
    fail('INVALID_PRODUCT', 'Product.currency must be a string')
  }

  if (!p.name || typeof p.name !== 'string') {
    fail('INVALID_PRODUCT', 'Product.name must be a string')
  }
}

export function isValidCartEntry(entry: unknown): entry is CartEntryInput {
  if (!entry || typeof entry !== 'object') return false

  const e = entry as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.price === 'number' &&
    Number.isFinite(e.price) &&
    typeof e.quantity === 'number' &&
    Number.isInteger(e.quantity) &&
    e.quantity > 0 &&
    typeof e.name === 'string' &&
    typeof e.currency === 'string'
  )
}

export function validateCartDetails(
  cartDetails: unknown,
  actionName: string
): void {
  if (!cartDetails || typeof cartDetails !== 'object') {
    fail(
      'INVALID_CART',
      `Invalid cartDetails in ${actionName}: cartDetails must be an object of cart entries.`
    )
  }

  for (const id in cartDetails) {
    if (!isValidCartEntry((cartDetails as Record<string, unknown>)[id])) {
      fail(
        'INVALID_CART',
        `Invalid cart entry "${id}" in ${actionName}: a cart entry needs a string id, name and currency, a finite price, and a quantity that is an integer greater than 0.`
      )
    }
  }
}
