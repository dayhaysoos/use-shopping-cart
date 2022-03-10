import * as React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { CartProvider } from 'use-shopping-cart'

ReactDOM.render(
  <React.StrictMode>
    <CartProvider
      cartMode="checkout-session"
      stripe=""
      currency="USD"
      loading={<p aria-live="polite">Loading redux-persist...</p>}
    >
      <App />
    </CartProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
