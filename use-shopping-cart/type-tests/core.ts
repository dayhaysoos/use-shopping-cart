import type { CartState, CartEntry, Product } from 'use-shopping-cart/core'
import {
  ShoppingCart,
  formatCurrencyString,
  filterCart,
  redirectToCheckout
} from 'use-shopping-cart/core'

const cart = new ShoppingCart({
  currency: 'USD',
  shouldPersist: true
})

new ShoppingCart({
  // @ts-expect-error totals are derived, not config
  cartCount: 3
})

let state: CartState = cart.getState()
cart.subscribe(() => {
  state = cart.getState()
})

cart.addItem(
  { id: 'id_abc', name: 'Test Product', price: 10, currency: 'USD' },
  { count: 2 }
)
cart.setItemQuantity('id_abc', 4)
// @ts-expect-error quantity must be a number
cart.setItemQuantity('id_abc', '1')
cart.setItemQuantity('id_abc', -2)
cart.incrementItem('id_abc')
cart.decrementItem('id_abc', { count: 2 })
cart.removeItem('id_abc')
cart.clearCart()
cart.addItem(
  { id: 'id_abc', name: 'Test Product 2', price: 99, currency: 'USD' },
  { count: 1 }
)
cart.loadCart(
  {
    id_123: {
      id: 'id_123',
      name: 'Test Product 3',
      price: 14_99,
      currency: 'MXN',
      quantity: 2,
      value: 14_99 * 2,
      formattedValue: formatCurrencyString({
        value: 14_99 * 2,
        currency: 'MXN',
        language: 'es-MX'
      }),
      formattedPrice: '$14.99',
      timestamp: new Date().toISOString(),
      price_data: {},
      product_data: {}
    },
    id_watermelon: {
      id: 'id_watermelon',
      name: 'Watermelon',
      price: 9_99,
      currency: 'MXN',
      quantity: 3,
      value: 9_99 * 3,
      formattedValue: formatCurrencyString({
        value: 9_99 * 3,
        currency: 'MXN',
        language: 'es-MX'
      }),
      formattedPrice: '$9.99',
      timestamp: new Date().toISOString(),
      price_data: {},
      product_data: {}
    }
  },
  false
)
cart.storeLastClicked('id_watermelon')
cart.changeLanguage('es-MX')
cart.changeCurrency('MXN')
const redirected: void = redirectToCheckout(
  'https://checkout.stripe.com/c/pay/cs_test_123'
)
// @ts-expect-error redirectToCheckout is no longer a cart method
cart.redirectToCheckout
// @ts-expect-error the Stripe key is no longer cart config
new ShoppingCart({ stripe: 'pk_test_123' })

cart.handleCartHover()
cart.handleCartClick()
cart.handleCloseCart()

console.log(cart.getState())
filterCart(cart.getState().cartDetails, async (entry: CartEntry) => {
  // sold out of watermelon
  if (entry.id === 'id_watermelon') return false
  return true
})
