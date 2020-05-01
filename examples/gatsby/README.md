<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->
<p align="center">
  <a href="https://www.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby E-Commerce Starter
</h1>

This is a Gatsby e-commerce example based on https://www.gatsbyjs.org/docs/ecommerce-tutorial/

## Setup

### 1. Install the dependencies

```bash
npm install
// or
yarn
```

### 2. Enabling the “Checkout client-only integration” for your Stripe account

In this example we're using Stripe Checkout in client-only mode. You need to enable client-only mode in the [Checkout settings](https://dashboard.stripe.com/account/checkout/settings).

Additionally, you need to set a name for your Stripe account in your [Account settings](https://dashboard.stripe.com/account). You can find more configuration details in the [Stripe docs](https://stripe.com/docs/payments/checkout#configure).

### 3. Create your products in your Stripe Account

To sell your products, you need to create them in your Stripe account using the [Stripe Dashboard](https://dashboard.stripe.com/products) or the [Stripe API](https://stripe.com/docs/api/products/create). This is required for Stripe to validate that the request coming from the frontend is legitimate and to charge the correct amount for the selected product/SKU. Stripe requires every SKU used with Stripe Checkout to have a name: be sure to add one to all of your SKUs.

You will need to create both test and live product SKUs separately in the Stripe Dashboard. Make sure you toggle to "Viewing test data", then create your products for local development.

### 4. Setup the env variables

Create a `.env.development` file:

```bash
cp .env.example .env.development
```

Open the newly created `.env.development` file and set your [Stripe API keys](https://dashboard.stripe.com/test/apikeys).

### 5. Run it

```bash
npm run develop
// or
yarn develop
```
