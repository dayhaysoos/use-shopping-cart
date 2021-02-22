/** @jsx jsx */
import { jsx } from 'theme-ui'
import ReactDOM from 'react-dom'
import { loadStripe } from '@stripe/stripe-js'
import { CartProvider } from 'use-shopping-cart'
import './index.css'
import App from './App'
import { Provider } from 'react-redux'
import store from '../src/store'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_PUBLIC)

ReactDOM.render(
  <Provider store={store}>
    <CartProvider
      mode="checkout-session"
      stripe={stripePromise}
      billingAddressCollection={false}
      successUrl="https://stripe.com"
      cancelUrl="https://twitter.com/dayhaysoos"
      currency="USD"
    >
      <App />
    </CartProvider>
  </Provider>,
  document.getElementById('root')
)
