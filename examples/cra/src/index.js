/** @jsx jsx */
import { jsx } from 'theme-ui'
import ReactDOM from 'react-dom'
import { loadStripe } from '@stripe/stripe-js'
import { CartProvider } from 'use-shopping-cart'
import './index.css'
import App from './App'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_PUBLIC)

ReactDOM.render(
  <CartProvider
    mode="checkout-session"
    stripe={stripePromise}
    billingAddressCollection={false}
    successUrl="https://stripe.com"
    cancelUrl="https://twitter.com/dayhaysoos"
    currency="USD"
  >
    <App />
  </CartProvider>,
  document.getElementById('root')
)
