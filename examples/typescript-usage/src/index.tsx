import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { CartProvider } from 'use-shopping-cart/dist/react'

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
