# Gatsby Plugin Use-Shopping-Cart

_This plugin is in early release, please test and provide any feedback._

This plugin simplifies the use of [Use-Shopping-Cart](https://useshoppingcart.com/) with your existing Gatsby site by handling the integration of the `<CartProvider>` for you. Use-Shopping-Cart is an API layer to manage shopping cart logic and handle integration with Stripe payments for secure transactions. Plugin options allow you to configure Use-Shopping-Cart according to their docs.

## Install

```sh
npm install gatsby-plugin-use-shopping-cart use-shopping-cart @stripe/stripe-js
```

```sh
yarn add gatsby-plugin-use-shopping-cart use-shopping-cart @stripe/stripe-js
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

## Plugin Options

The following options are taken directly from the standard use-shopping-cart API. Default values are provided where possible using Gatsby's plugin configuration API.

| Plugin Option            | Type             | Default Value                   |
| ------------------------ | ---------------- | ------------------------------- |
| mode                     | string           | payment                         |
| cartMode                 | string           | client-only                     |
| stripePublicKey          | string           | null                            |
| successUrl               | string           | https://www.useshoppingcart.com |
| cancelUrl                | string           | https://www.stripe.com          |
| currency                 | string           | USD                             |
| allowedCountries         | array of strings | ["US", "GB", "CA"]              |
| billingAddressCollection | boolean          | true                            |

## How it works

The core part of this plugin is wrapping the root app provider in `gatsby-ssr.js` and `gatsby-browser.js` so that the shopping cart state is available across your Gatsby site. For those that are curious this is what that code looks like.

```js
import React from "react"
import { CartProvider } from "use-shopping-cart"

export const wrapRootElement = ({ element }, pluginOptions) => {
  const {
    mode,
    cartMode,
    stripePublicKey,
    successUrl,
    cancelUrl,
    currency,
    allowedCountries,
    billingAddressCollection,
  } = pluginOptions

  return (
    <CartProvider
      mode={mode}
      cartMode={cartMode}
      stripe={stripePublicKey}
      successUrl={successUrl}
      cancelUrl={cancelUrl}
      currency={currency}
      allowedCountries={allowedCountries}
      billingAddressCollection={billingAddressCollection}
    >
      {element}
    </CartProvider>
  )
}
```
