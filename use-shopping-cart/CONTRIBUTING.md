# Contribution Guidelines

**Please ensure your pull request adheres to the following guidelines:**

- Search previous suggestions before making a new one, as yours may be a duplicate.
- Make an individual pull request for each suggestion.
- Create a branch with yourname/feature. For example:
	- `git checkout -b dayhaysoos/testing-cartItems`
- Keep descriptions short and simple, but descriptive of your changes.
- Start the description with a capital and end with a full stop/period.
- ℹ️ You can use an emoji, only before the Title-Cased Description.
- Check your spelling and grammar.
	- [Grammarly](https://www.grammarly.com/) is a nice free tool for this and has browser extensions.
- New categories or improvements to the existing categorization are welcome.
- Pull requests should have a useful title.

### Updating your PR
A lot of times, making a PR adhere to the standards above can be difficult. If the maintainers notice anything that we'd like changed, we'll ask you to edit your PR before we merge it. There's no need to open a new PR, just edit the existing one. If you're not sure how to do that.

Submit a PR and wait for approval/comments from the maintainers

## Getting your environment set up

Before you run any of the examples be sure to set your environment variables at the root of
the project in a `.env.development` file (or `documentation/.env.development` for the documentation workspace). There is a `.env.example` and a `documentation/.env.example` file with the example variables you'll need to run the examples and documentation workspaces in this project. You'll need to fill them in with your own API keys from Stripe.

```dotenv
# .env.example
STRIPE_API_PUBLIC=
STRIPE_API_SECRET=

# documentation/.env.example
GATSBY_STRIPE_PUBLISHABLE_KEY=
```

The following tutorials teach how to set up your custom environment variables for your project for their respective frameworks.

- [create-react-app](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [gatsby.js](https://www.gatsbyjs.org/docs/environment-variables/)
- [next.js](https://nextjs.org/docs/api-reference/next.config.js/environment-variables)
- [react-static](https://github.com/react-static/react-static/blob/master/docs/concepts.md#environment-variables)


Here are a couple commands to get you started in development:

```bash
# Run the development environment which builds use-shopping-cart in watch-mode
# and starts the CRA example with Netlify functions
yarn dev

# Runs tests in watch-mode
yarn test

# Runs the documentation page locally
yarn dev:docs
```

### Warning about editing the README

Please make all README edits to `/README.md` and when you're done copy them to `/use-shopping-cart/README.md`. This is done so that once the README updates are merged and published to NPM, you can see the README appear on both GitHub and NPM.

### Looking to add a payment service to use-shopping-cart

If you're looking to add a new payment service like Square, Amazon Pay, PayPal, or even Shopify's Billing API, please [view this guide](https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/CONTRIBUTING-SERVICES.md) on how to do so.