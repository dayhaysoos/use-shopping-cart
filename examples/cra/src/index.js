import React from 'react'
import ReactDOM from 'react-dom'
import { CartProvider } from 'use-shopping-cart'
import './index.css'
import App from './App'

ReactDOM.render(
  <CartProvider
    mode="payment"
    cartMode="checkout-session"
    stripe={process.env.REACT_APP_STRIPE_API_PUBLIC}
    billingAddressCollection={false}
    successUrl="https://stripe.com"
    cancelUrl="https://twitter.com/dayhaysoos"
    currency="USD"
  >
    <App />
  </CartProvider>,
  document.getElementById('root')
)
