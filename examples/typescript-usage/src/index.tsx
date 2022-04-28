import * as React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { CartProvider } from 'use-shopping-cart'

ReactDOM.render(
  <React.StrictMode>
    <CartProvider
      cartMode="checkout-session"
      stripe={process.env.REACT_APP_STRIPE_API_PUBLIC ?? ''}
      currency="USD"
      loading={<p aria-live="polite">Loading redux-persist...</p>}
    >
      <App />
    </CartProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
