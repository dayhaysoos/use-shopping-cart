# Gatsby Plugin Use-Shopping-Cart

_This is a WIP and not stable yet, use at your own risk._

This plugin simplifies the use of [use-shopping-cart](https://useshoppingcart.com/) with your existing Gatsby site by handling the integration of the `<CartProvider>` for you. Use-shopping-cart is an API layer to manage shopping cart logic and handle integration with Stripe payments for secure transactions.

## Install

```sh
npm install gatsby-plugin-use-shopping-cart use-shopping-cart
```

```sh
yarn add gatsby-plugin-use-shopping-cart use-shopping-cart
```

## How to use

```js
//gatsby-config.js
plugins: [
  //...other plugins...
  {
    resolve: `gatsby-plugin-use-shopping-cart`,
    options: {
      mode: "payment",
      cartMode: "client-only",
      stripePublicKey: process.env.GATSBY_STRIPE_PUBLIC_KEY,
      successUrl: "https://www.google.com", // url must start with http or https
      cancelUrl: "https://www.stripe.com", // url must start with http or https
      currency: "USD",
      allowedCountries: ["US", "GB", "CA"],
      billingAddressCollection: true,
    },
  },
]
```

## Options

mode - String
cartMode - String
stripePublicKey - String
successUrl - String
cancelUrl - String
currency - String
allowedCountries - Array of strings
billingAddressCollection - Boolean
