export type CartErrorCode =
  | 'INVALID_PRODUCT'
  | 'INVALID_COUNT'
  | 'INVALID_QUANTITY'
  | 'ITEM_NOT_IN_CART'
  | 'INVALID_FORM_DATA'
  | 'INVALID_INVENTORY'
  | 'INVALID_CART'
  | 'NOT_IN_INVENTORY'
  | 'INVALID_CHECKOUT_URL'
  | 'NOT_IN_BROWSER'
  | 'NO_CART_PROVIDER'
  | 'UNKNOWN'

export class CartError extends Error {
  readonly code: CartErrorCode

  constructor(code: CartErrorCode, message: string) {
    super(message)
    this.name = 'CartError'
    this.code = code
  }
}

export function isCartError(error: unknown): error is CartError {
  return (
    error instanceof Error &&
    error.name === 'CartError' &&
    typeof (error as CartError).code === 'string'
  )
}
