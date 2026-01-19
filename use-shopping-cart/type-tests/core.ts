/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import type { CartState, CartEntry, Product } from '../core/types'
import { ShoppingCart, formatCurrencyString, filterCart } from '../core/index'

const cart = new ShoppingCart({
  stripe: '',
  currency: 'USD',
  shouldPersist: true
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
// @ts-ignore
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
cart.changeStripeKey('blah')
cart.changeLanguage('es-MX')
cart.changeCurrency('MXN')
try {
  cart.redirectToCheckout('ptslpcbwoi328jcxm82')
} catch {}

cart.handleCartHover()
cart.handleCartClick()
cart.handleCloseCart()

console.log(cart.getState())
filterCart(cart.getState().cartDetails, async (entry: CartEntry) => {
  // sold out of watermelon
  if (entry.id === 'id_watermelon') return false
  return true
})
