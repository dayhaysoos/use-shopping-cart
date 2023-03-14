/* eslint-disable camelcase */
import type { Store } from '@reduxjs/toolkit'

import {
  CartState,
  actions,
  filterCart,
  formatCurrencyString,
  createShoppingCartStore,
  createPersistedStore,
  CartEntry
} from '../core/index'

const store: Store<CartState> = createShoppingCartStore({
  cartMode: 'client-only',
  mode: 'payment',
  successUrl: 'https://www.example.com/success',
  cancelUrl: 'https://www.example.com/cancel',
  billingAddressCollection: true,
  stripe: '',
  currency: 'USD',
  shouldPersist: true
})

createPersistedStore(store)
/* eslint-disable no-unused-vars */
let state: CartState = store.getState()
store.subscribe(() => {
  state = store.getState()
})
store.dispatch(
  actions.addItem(
    { id: 'id_abc', name: 'Test Product', price: 10, currency: 'USD' },
    { count: 2 }
  )
)
store.dispatch(actions.setItemQuantity('id_abc', 4))
// @ts-ignore
store.dispatch(actions.setItemQuantity('id_abc', '1'))
store.dispatch(actions.setItemQuantity('id_abc', -2))
store.dispatch(actions.incrementItem('id_abc'))
store.dispatch(actions.decrementItem('id_abc', { count: 2 }))
store.dispatch(actions.removeItem('id_abc'))
store.dispatch(actions.clearCart())
store.dispatch(
  actions.addItem(
    { id: 'id_abc', name: 'Test Product 2', price: 99, currency: 'USD' },
    { count: 1 }
  )
)
store.dispatch(
  actions.loadCart(
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
        })
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
        })
      }
    },
    false
  )
)
store.dispatch(actions.storeLastClicked('id_watermelon'))
store.dispatch(actions.changeStripeKey('blah'))
store.dispatch(actions.changeLanguage('es-MX'))
store.dispatch(actions.changeCurrency('MXN'))
try {
  store.dispatch(actions.redirectToCheckout())
} catch {}
try {
  store.dispatch(actions.redirectToCheckout('ptslpcbwoi328jcxm82'))
} catch {}
try {
  store.dispatch(actions.checkoutSingleItem('id_watermelon'))
} catch {}
store.dispatch(actions.handleCartHover())
store.dispatch(actions.handleCartClick())
store.dispatch(actions.handleCloseCart())

console.log(store.getState())
filterCart(store.getState().cartDetails, async (entry: CartEntry) => {
  // sold out of watermelon
  if (entry.id === 'id_watermelon') return false
  return true
})
