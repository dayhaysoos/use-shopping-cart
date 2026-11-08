import type {
  AddItemOptions,
  CartDetails,
  IncrementOptions,
  Product
} from './types'
import type { CartChange } from './cartState'
import { getProductId } from './productId'
import {
  validateCount,
  validateItemExists,
  validateProduct,
  validateQuantity
} from './validation'

export type CartCall =
  | { action: 'addItem'; product: Product; options: AddItemOptions }
  | {
      action: 'incrementItem' | 'decrementItem'
      id: string
      options: IncrementOptions
    }
  | { action: 'setItemQuantity'; id: string; quantity: number }
  | { action: 'removeItem'; id: string }
  | { action: 'clearCart' }

export const cartCalls = {
  addItem: (product: Product, options: AddItemOptions = {}): CartCall => ({
    action: 'addItem',
    product,
    options
  }),
  incrementItem: (id: string, options: IncrementOptions = {}): CartCall => ({
    action: 'incrementItem',
    id,
    options
  }),
  decrementItem: (id: string, options: IncrementOptions = {}): CartCall => ({
    action: 'decrementItem',
    id,
    options
  }),
  setItemQuantity: (id: string, quantity: number): CartCall => ({
    action: 'setItemQuantity',
    id,
    quantity
  }),
  removeItem: (id: string): CartCall => ({ action: 'removeItem', id }),
  clearCart: (): CartCall => ({ action: 'clearCart' })
} satisfies Record<CartCall['action'], (...args: never[]) => CartCall>

export type CartCallName = keyof typeof cartCalls

export function validateCartCall(
  call: CartCall,
  cartDetails: CartDetails
): void {
  toCartChange(call, cartDetails)
}

export function toCartChange(
  call: CartCall,
  cartDetails: CartDetails
): CartChange {
  switch (call.action) {
    case 'addItem': {
      validateProduct(call.product)
      const count = call.options.count ?? 1
      validateCount(count, call.action)
      const { price_metadata, product_metadata } = call.options
      return {
        type: 'add',
        id: getProductId(call.product),
        product: call.product,
        count,
        metadata: { price_metadata, product_metadata }
      }
    }
    case 'incrementItem':
    case 'decrementItem': {
      const id = String(call.id)
      const count = call.options.count ?? 1
      validateCount(count, call.action)
      validateItemExists(id, cartDetails, call.action)
      return {
        type: 'adjust',
        id,
        by: call.action === 'incrementItem' ? count : -count
      }
    }
    case 'setItemQuantity': {
      const id = String(call.id)
      validateQuantity(call.quantity, call.action)
      validateItemExists(id, cartDetails, call.action)
      return { type: 'set', id, quantity: call.quantity }
    }
    case 'removeItem': {
      const id = String(call.id)
      validateItemExists(id, cartDetails, call.action)
      return { type: 'remove', id }
    }
    case 'clearCart':
      return { type: 'clear' }
  }
}
