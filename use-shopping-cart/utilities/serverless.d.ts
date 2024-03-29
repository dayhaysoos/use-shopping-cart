import { Product, CartDetails } from '../core/index'

interface ValidatedItem {
  price_data: {
    currency: string
    unit_amount: number
    product_data: { name: string; [s: string]: any }
    [s: string]: any
  }
  quantity: number
}

interface LineItem {
  price: string
  quantity: number
}

export function validateCartItems(
  inventory: Product[],
  cartDetails: CartDetails
): ValidatedItem[]

export function formatLineItems(cartDetails: CartDetails): LineItem[]
