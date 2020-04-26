/** @jsx jsx */
import { jsx } from 'theme-ui';
import ReactDOM from 'react-dom';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CartProvider } from 'use-shopping-cart';
import './index.css';
import App from './App';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_PUBLIC);

ReactDOM.render(
  <Elements stripe={stripePromise}>
    <ElementsConsumer>
      {({ stripe }) => (
        <CartProvider
          stripe={stripe}
          billingAddressCollection={false}
          successUrl={'https://stripe.com'}
          cancelUrl={'https://twitter.com/dayhaysoos'}
          currency={'USD'}
        >
          <App />
        </CartProvider>
      )}
    </ElementsConsumer>
  </Elements>,
  document.getElementById('root')
);
