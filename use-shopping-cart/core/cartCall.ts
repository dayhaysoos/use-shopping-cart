import type {
  AddItemOptions,
  CartDetails,
  IncrementOptions,
  Product
} from './types'
import type { CartChange } from './cartState'
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
      return {
        type: 'add',
        product: call.product,
        count,
        metadata: call.options
      }
    }
    case 'incrementItem':
    case 'decrementItem': {
      const count = call.options.count ?? 1
      validateCount(count, call.action)
      validateItemExists(call.id, cartDetails, call.action)
      return {
        type: 'adjust',
        id: call.id,
        by: call.action === 'incrementItem' ? count : -count
      }
    }
    case 'setItemQuantity':
      validateQuantity(call.quantity, call.action)
      validateItemExists(call.id, cartDetails, call.action)
      return { type: 'set', id: call.id, quantity: call.quantity }
    case 'removeItem':
      validateItemExists(call.id, cartDetails, call.action)
      return { type: 'remove', id: call.id }
    case 'clearCart':
      return { type: 'clear' }
  }
}
