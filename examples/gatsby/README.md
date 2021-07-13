# Gatsby Starter Use-Shopping-Cart

This example is current as of Use-Shopping-Cart v3 and Gatsby v3. [gatsby-plugin-use-shopping-cart](https://www.gatsbyjs.com/plugins/gatsby-plugin-use-shopping-cart/) is used to handle the integration and setup of Gatsby and Use-Shopping-Cart.

This is a basic example of Use-Shopping-Cart with Gatsby. This example uses [client only mode](https://useshoppingcart.com/docs/getting-started-client-mode) for the product validation. The products themselves are sourced from Stripe dashboard using [gatsby-source-stripe](https://www.gatsbyjs.com/plugins/gatsby-source-stripe/).

Hooks are used to seperate concerns and handle the GraphQl queries.

Styling is as minimal as possible.

## Getting Started

This assumes you have some familiarity with Gatsby. If you are brand new to Gatsby you should start with [their tutorial](https://www.gatsbyjs.com/docs/tutorial/) and then come back here.

1. Copy and paste this starter (clone or fork the repo, whatever is easier). Run `yarn install` or `npm install`.

1. Create a Stripe account and [add products to your product dashboard](https://support.stripe.com/questions/how-to-create-products-and-prices). Make sure you are in the "test" environment.

1. Copy and paste your public and secret key to update the `.env` variables like below. Again make sure you are in your test environment. The test keys will looks like this; `sk_test_abc1237sghmasfk`.

```env
STRIPE_SECRET_KEY=sk_test_123abc
GATSBY_STRIPE_PUBLIC_KEY=pk_test_123abc
```

1. Update `gatsby-plugin-use-shopping-cart` with the appropriate values, what is already there should work in most cases.

```js
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
```

1.

## To do

- Add loading indicators after button click
- Check a11y standards in case folks are copy pasting code
- Make the cart an actual modal with proper a11y support for the modal
- Implement an example of `setItemQuantity` in the cart
