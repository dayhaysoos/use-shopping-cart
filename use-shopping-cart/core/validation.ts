import type { CartDetails } from './types'

/**
 * Returns the constructor name of any value.
 */
function typeOf(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  return (value as any).constructor.name
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateCount(count: unknown, actionName: string): void {
  if (typeof count !== 'number') {
    const error = `Invalid count in ${actionName}: count must be a number. The current type is ${typeOf(
      count
    )}.`
    console.warn(error)
    throw new ValidationError(error)
  }

  if (count <= 0) {
    const error = `Invalid count in ${actionName}: count must be greater than 0. The current value is ${count}.`
    console.warn(error)
    throw new ValidationError(error)
  }
}

export function validateQuantity(quantity: unknown, actionName: string): void {
  if (typeof quantity !== 'number') {
    const error = `Invalid quantity in ${actionName}: quantity must be a number. The current type is ${typeOf(
      quantity
    )}.`
    console.warn(error)
    throw new ValidationError(error)
  }

  if (quantity < 0) {
    const error = `Invalid quantity in ${actionName}: quantity must be greater than or equal to 0. The current value is ${quantity}.`
    console.warn(error)
    throw new ValidationError(error)
  }
}

export function validateItemExists(
  id: string,
  cartDetails: CartDetails,
  actionName: string
): void {
  if (!(id in cartDetails)) {
    const error = `Invalid product ID in ${actionName}: the ID "${id}" must already be in the cart.`
    console.warn(error)
    throw new ValidationError(error)
  }
}

export function validateProduct(product: unknown): void {
  if (!product || typeof product !== 'object') {
    throw new ValidationError('Product must be an object')
  }

  const p = product as Record<string, unknown>

  if (typeof p.price !== 'number') {
    throw new ValidationError('Product.price must be a number')
  }

  if (!p.currency || typeof p.currency !== 'string') {
    throw new ValidationError('Product.currency must be a string')
  }

  if (!p.name || typeof p.name !== 'string') {
    throw new ValidationError('Product.name must be a string')
  }
}
