import * as useShoppingCart from 'use-shopping-cart'

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
  inventory: useShoppingCart.Product[],
  cartDetails: useShoppingCart.CartDetails
): ValidatedItem[]

export function formatLineItems(
  cartDetails: useShoppingCart.CartDetails
): LineItem[]
