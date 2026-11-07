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
