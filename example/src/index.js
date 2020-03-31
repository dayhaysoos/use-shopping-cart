/** @jsx jsx */
import { jsx } from 'theme-ui';
import ReactDOM from 'react-dom';
import { CartProvider } from 'use-stripe-cart';
import './index.css';
import App from './App';

const stripe = window.Stripe(process.env.REACT_APP_STRIPE_API_PUBLIC);

ReactDOM.render(
  <CartProvider
    stripe={stripe}
    billingAddressCollection={false}
    successUrl={'stripe.com'}
    cancelUrl={'twitter.com/dayhaysoos'}
    currency={'USD'}
  >
    <App />
  </CartProvider>,
  document.getElementById('root')
);
