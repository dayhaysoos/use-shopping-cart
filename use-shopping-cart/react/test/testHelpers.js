import * as React from 'react'
import { CartProvider } from '../index'

export const createWrapper = (overrides = {}) => ({ children }) => (
  <CartProvider
    mode="payment"
    cartMode="client-only"
    successUrl="https://egghead.io/success"
    cancelUrl="https://egghead.io/cancel"
    stripe="FAKE-KEY"
    currency="USD"
    {...overrides}
  >
    {children}
  </CartProvider>
)

export const expectedInitialCartState = {
  cartDetails: {},
  totalPrice: 0,
  formattedTotalPrice: '$0.00',
  cartCount: 0,
  shouldDisplayCart: false
}
