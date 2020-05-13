const React = require('react');
const { CartProvider } = require('use-shopping-cart');
const { loadStripe } = require('@stripe/stripe-js');

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLISHABLE_KEY);

export const wrapRootElement = ({ element }) => {
  return (
    <CartProvider
      stripe={stripePromise}
      successUrl={`https://useshoppingcart.com/`}
      cancelUrl={`https://useshoppingcart.com`}
      currency={'USD'}
      allowedCountries={['US', 'GB', 'CA']}
      billingAddressCollection={true}
      mode={'client-only'}
    >
      {element}
    </CartProvider>
  );
};
