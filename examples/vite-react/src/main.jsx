import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CartProvider } from 'use-shopping-cart'

ReactDOM.createRoot(document.getElementById('root')).render(
  <CartProvider
    mode="payment"
    cartMode="checkout-session"
    stripe={import.meta.env.VITE_STRIPE_API_PUBLIC}
    billingAddressCollection={false}
    successUrl="https://stripe.com"
    cancelUrl="https://twitter.com/dayhaysoos"
    currency="USD"
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
    ,
  </CartProvider>
)

