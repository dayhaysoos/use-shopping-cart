import type { Product, CartDetails } from '../core/types'
import { productIdFields } from '../core/productId'
import { CartError } from '../core/errors'
import { validateInteger } from '../core/validation'

export { CartError, isCartError } from '../core/errors'
export type { CartErrorCode } from '../core/errors'

export interface ValidatedItem {
  price_data: {
    currency: string
    unit_amount: number
    product_data: { name: string; [s: string]: any }
    [s: string]: any
  }
  quantity: number
}

export interface LineItem {
  price: string
  quantity: number
}

export function validateCartItems(
  inventorySrc: Iterable<Product>,
  cartDetails: CartDetails
): ValidatedItem[] {
  const validatedItems: ValidatedItem[] = []

  if (!inventorySrc || typeof inventorySrc[Symbol.iterator] !== 'function') {
    throw new CartError(
      'INVALID_INVENTORY',
      'Invalid Cart: inventory must be an iterable collection.'
    )
  }

  if (!cartDetails || typeof cartDetails !== 'object') {
    throw new CartError(
      'INVALID_CART',
      'Invalid Cart: cartDetails must be an object.'
    )
  }

  const inventoryMap = new Map<string, Product>()
  for (const product of inventorySrc) {
    if (!product || typeof product !== 'object') {
      throw new CartError(
        'INVALID_INVENTORY',
        'Invalid Cart: inventory products must be objects.'
      )
    }

    for (const field of productIdFields) {
      const id = product[field]
      if (!id) continue
      if (!inventoryMap.has(String(id))) inventoryMap.set(String(id), product)
    }
  }

  for (const id in cartDetails) {
    const cartItem = cartDetails[id]
    if (!cartItem || typeof cartItem !== 'object') {
      throw new CartError(
        'INVALID_CART',
        `Invalid Cart: cart entry "${id}" must be an object.`
      )
    }

    const inventoryItem = inventoryMap.get(id)
    if (inventoryItem === undefined) {
      throw new CartError(
        'NOT_IN_INVENTORY',
        `Invalid Cart: product with id "${id}" is not in your inventory.`
      )
    }

    const quantity = cartItem.quantity
    validateInteger(
      quantity,
      'quantity',
      1,
      'INVALID_QUANTITY',
      `cart entry "${id}"`
    )

    const item: ValidatedItem = {
      price_data: {
        currency: inventoryItem.currency,
        unit_amount: inventoryItem.price,
        product_data: {
          name: inventoryItem.name,
          ...inventoryItem.product_data
        },
        ...inventoryItem.price_data
      },
      quantity
    }

    if (
      cartItem.product_data &&
      typeof cartItem.product_data.metadata === 'object'
    ) {
      item.price_data.product_data.metadata = {
        ...cartItem.product_data.metadata,
        ...item.price_data.product_data.metadata
      }
    }

    if (
      typeof inventoryItem.description === 'string' &&
      inventoryItem.description.length > 0
    )
      item.price_data.product_data.description = inventoryItem.description

    if (
      typeof inventoryItem.image === 'string' &&
      inventoryItem.image.length > 0
    )
      item.price_data.product_data.images = [inventoryItem.image]

    validatedItems.push(item)
  }

  return validatedItems
}

export function formatLineItems(cartDetails: CartDetails): LineItem[] {
  const lineItems: LineItem[] = []
  for (const id in cartDetails)
    lineItems.push({ price: id, quantity: cartDetails[id].quantity })

  return lineItems
}
