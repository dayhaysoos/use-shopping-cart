https://useshoppingcart.com

# use-shopping-cart

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

> A React Hook that handles shopping cart state and logic for Stripe.

[![NPM](https://img.shields.io/npm/v/use-shopping-cart.svg)](https://www.npmjs.com/package/use-shopping-cart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Installation

```bash
# With Yarn
yarn add @stripe/stripe-js use-shopping-cart

# With NPM
npm install --save @stripe/stripe-js use-shopping-cart
```

## Usage

### Initialization

At the root level of your application (or the highest point you'll be using Stripe from), wrap your components in a `<CartProvider>`.

`<CartProvider>` comes with several props that allow you to interact with the Stripe API and customize the Stripe experience.

When loading up Stripe, don't forget to use your public Stripe API key with it. If you need help setting up your environment variables for this, [view a list of environment variable tutorials.](#Environment-Variable-Tutorials)

#### [CheckoutSession mode](https://use-shopping-cart.netlify.app/usage/cartprovider#checkoutsession-mode)

Creating a [CheckoutSession](https://stripe.com/docs/payments/checkout/one-time#create-checkout-session) server-side allows for a more flexible and powerful integration but requires a server component (e.g. a Netlify Function).

At the root level of your app, wrap your Root app in the `<CartProvider />`

```jsx
import ReactDOM from 'react-dom'

import { loadStripe } from '@stripe/stripe-js'
import { CartProvider } from 'use-shopping-cart'

import App from './App'

// Remember to add your public Stripe key
const stripePromise = loadStripe(process.env.STRIPE_API_PUBLIC)

ReactDOM.render(
  <CartProvider mode="checkout-session" stripe={stripePromise} currency="USD">
    <App />
  </CartProvider>,
  document.getElementById('root')
)
```

When using CheckoutSessions your product object must adhere to the following shape:

```js
const products = [
  {
    // Line item name to be shown on the Stripe Checkout page
    name: 'Bananas',
    // Optional description to be shown on the Stripe Checkout page
    description: 'Yummy yellow fruit',
    // A unique identifier for this item (stock keeping unit)
    sku: 'sku_banana001',
    // price in smallest currency unit (e.g. cent for USD)
    price: 400,
    currency: 'USD',
    // Optional image to be shown on the Stripe Checkout page
    image: 'https://my-image.com/image.jpg'
  }
  /* ... more products */
]
```

Additionally, you must verify the cartItems on the server-side before creating the CheckoutSession. For this you can use the [validateCartItems() helper](<https://use-shopping-cart.netlify.app/usage/validateCartItems()>).

#### [Client-only Checkout mode](https://use-shopping-cart.netlify.app/usage/cartprovider#client-only-checkout-mode)

To operate a checkout page without any server component you need to enable client-only checkout mode and insert your
 product information in your Stripe Dashboard:

- [Enable client-only Checkout](https://stripe.com/docs/payments/checkout/client#enable-checkout)
- [Create your products](https://stripe.com/docs/payments/checkout/client#create-products)

At the root level of your app, wrap your Root app in the `<CartProvider />`

```jsx
import ReactDOM from 'react-dom'

import { loadStripe } from '@stripe/stripe-js'
import { CartProvider } from 'use-shopping-cart'

import App from './App'

// Remember to add your public Stripe key
const stripePromise = loadStripe(process.env.STRIPE_API_PUBLIC)

ReactDOM.render(
  <CartProvider
    mode="client-only"
    stripe={stripePromise}
    // The URL to which Stripe should send customers when payment is complete.
    successUrl="http://localhost:3000/success"
    // The URL to which Stripe should send customers when payment is canceled.
    cancelUrl="http://localhost:3000"
    currency="USD"
    // https://stripe.com/docs/payments/checkout/client#collect-shipping-address
    allowedCountries={['US', 'GB', 'CA']}
    // https://stripe.com/docs/payments/checkout/client#collect-billing-address
    billingAddressCollection={true}
  >
    <App />
  </CartProvider>,
  document.getElementById('root')
)
```

When operating in client-only mode you must set the `successUrl` and `cancelUrl` props on the `CartProvider` component, and the product object must adhere to the following shape:

```js
const products = [
  {
    name: 'Bananas',
    // sku ID from your Stripe Dashboard
    sku: 'sku_GBJ2Ep8246qeeT',
    // price in smallest currency unit (e.g. cent for USD)
    price: 400,
    currency: 'USD',
    // Optional image to be shown on the Stripe Checkout page
    image: 'https://my-image.com/image.jpg'
  }
  /* ... more products */
]
```

### Using the hook

The hook `useShoppingCart()` provides several utilities and pieces of data for you to use in your application. The examples below won't cover every part of the `useShoppingCart()` API but you can [look at the API](#API) below.

```jsx
import { useShoppingCart } from 'use-shopping-cart'
import { Product } from './Product'
import { CartItems } from './CartItems'

const productData = [
  {
    name: 'Bananas',
    sku: 'sku_GBJ2Ep8246qeeT',
    price: 400,
    image: 'https://www.fillmurray.com/300/300',
    currency: 'USD'
  },
  {
    name: 'Tangerines',
    sku: 'sku_GBJ2WWfMaGNC2Z',
    price: 100,
    image: 'https://www.fillmurray.com/300/300',
    currency: 'USD'
  }
]

export function App() {
  /* Gets the totalPrice and a method for redirecting to stripe */
  const { totalPrice, redirectToCheckout, cartCount } = useShoppingCart()

  return (
    <div>
      {/* Renders the products */}
      {productData.map((product) => (
        <Product key={product.sku} product={product} />
      ))}

      {/* This is where we'll render our cart */}
      <p>Number of Items: {cartCount}</p>
      <p>Total: {totalPrice()}</p>
      <CartItems />

      {/* Redirects the user to Stripe */}
      <button onClick={() => redirectToCheckout()}>Checkout</button>
    </div>
  )
}
```

#### How do I add an item to the user's cart?

To add a product to the cart, use `useShoppingCart()`'s `addItem(product)` method. It takes in your product object, which must have a `sku` and a `price`, and adds it to the cart.

```jsx
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

export function Product({ product }) {
  const { addItem } = useShoppingCart()

  /* A helper function that turns the price into a readable format */
  const price = formatCurrencyString({
    value: product.price,
    currency: product.currency,
    language: navigator.language
  })

  return (
    <article>
      <figure>
        <img src={product.image} alt={`Image of ${product.name}`} />
        <figcaption>{product.name}</figcaption>
      </figure>
      <p>{price}</p>

      {/* Adds the item to the cart */}
      <button
        onClick={() => addItem(product)}
        aria-label={`Add ${product.name} to your cart`}
      >
        Add to cart
      </button>
    </article>
  )
}
```

#### Now how do I display the cart to the user?

Once the user has added their items to the cart, you can use the `cartDetails` object to display the different data about each product in their cart.

Each product in `cartDetails` contains the same data you provided when you called `addItem(product)`. In addition, `cartDetails` also provides the following properties:

<table>
  <tr>
    <th>Name</th>
    <th>Value</th>
  </tr>
  <tr>
    <td><code>quantity</code></td>
    <td>Number of that product added to the cart</td>
  </tr>
  <tr>
    <td><code>value</code></td>
    <td>The <code>price * quantity</code></td>
  </tr>
  <tr>
    <td><code>formattedValue</code></td>
    <td>A currency formatted version of <code>value</code></td>
  </tr>
</table>

```jsx
import { useShoppingCart } from 'use-shopping-cart'

export function CartItems() {
  const {
    cartDetails,
    decrementItem,
    incrementItem,
    removeItem
  } = useShoppingCart()

  const cart = []
  // Note: Object.keys().map() takes 2x as long as a for-in loop
  for (const sku in cartDetails) {
    const cartEntry = cartDetails[sku]

    // all of your basic product data still exists (i.e. name, image, price)
    cart.push(
      <article>
        {/* image here */}
        {/* name here */}
        {/* formatted total price of that item */}
        <p>Line total: {cartEntry.formattedValue}</p>

        {/* What if we want to remove one of the item... or add one */}
        <button
          onClick={() => decrementItem(cartEntry.sku)}
          aria-label={`Remove one ${cartEntry.name} from your cart`}
        >
          -
        </button>
        <p>Quantity: {cartEntry.quantity}</p>
        <button
          onClick={() => incrementItem(cartEntry.sku)}
          aria-label={`Add one ${cartEntry.name} to your cart`}
        >
          +
        </button>

        {/* What if we don't want this product at all */}
        <button
          onClick={() => removeItem(cartEntry.sku)}
          aria-label={`Remove all ${cartEntry.name} from your cart`}
        >
          Remove
        </button>
      </article>
    )
  }

  return cart
}
```

Note that in the above code, to reduce the quantity of a product in the user's cart, you must pass an SKU to `decrementItem()` like so (note that you can also decrease by more than one):

```js
decrementItem(cartEntry.sku)

// or decrease by a count
decrementItem(cartEntry.sku, 3)
```

This also works the same when trying to increase the quantity of a product:

```js
incrementItem(cartEntry)

// increase by a count
incrementItem(cartEntry.sku, 4)
```

Just like you can reduce or increase the quantity of a product you can remove the product entirely with `removeItem()`:

```js
removeItem(cartEntry.sku)
```

#### How could the user set the quantity of an item to a specific number?

This is achievable with the `setItemQuantity(sku, quantity)` method (introduced in 2.0.0). It takes an SKU of a product in the cart and the quantity of that product you wish to have. Here is a very simple example:

```jsx
export function GiveMeFiveDonutsPlease() {
  const { setItemQuantity } = useShoppingCart()
  return (
    <button onClick={() => setItemQuantity('donuts-1a2b3c', 5)}>
      Set donut quantity to 5
    </button>
  )
}
```

For a real-world robust example visit the [documentation for `setItemQuantity`](<https://use-shopping-cart.app/usage/setItemQuantity()>).

## API

You can [view the full API](https://use-shopping-cart.netlify.app/) on our documentation page.

### `<CartProvider>`

Props for this component in Client-only mode:

<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td><code>mode</code></td>
    <td>"client-only"</td>
  </tr>
  <tr>
    <td><code>stripe</code></td>
    <td>Stripe | undefined</td>
  </tr>
  <tr>
    <td><code>successUrl</code></td>
    <td>string</td>
  </tr>
  <tr>
    <td><code>cancelUrl</code></td>
    <td>string</td>
  </tr>
  <tr>
    <td><code>currency</code></td>
    <td>string</td>
  </tr>
  <tr>
    <td><code>language</code></td>
    <td>string</td>
  </tr>
  <tr>
    <td><code>billingAddressCollection</code></td>
    <td>boolean</td>
  </tr>
  <tr>
    <td><code>allowedCountries</code></td>
    <td>null | string[]</td>
  </tr>
</table>

And now, CheckoutSession mode:

<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td><code>mode</code></td>
    <td>"checkout-session"</td>
  </tr>
  <tr>
    <td><code>stripe</code></td>
    <td>Stripe | undefined</td>
  </tr>
  <tr>
    <td><code>currency</code></td>
    <td>string</td>
  </tr>
  <tr>
    <td><code>language</code></td>
    <td>string</td>
  </tr>
</table>

### `useShoppingCart()`

Returns an object with all the following properties and methods:

<table>
  <tr>
    <th>Name</th>
    <th>Type/Args</th>
    <th>Return Type</th>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/addItem()"><code>addItem()</code></a></td>
    <td>product: Object</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/incrementItem()"><code>incrementItem()</code></a></td>
    <td>sku: string</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/decrementItem()"><code>decrementItem()</code></a></td>
    <td>sku: string</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/removeItem()"><code>removeItem()</code></a></td>
    <td>sku: string</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/setItemQuantity()"><code>setItemQuantity()</code></a></td>
    <td>sku: string, quantity: number</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/api#totalPrice"><code>totalPrice</code></a></td>
    <td>N/A</td>
    <td>number</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/api#formattedTotalPrice"><code>formattedTotalPrice</code></a></td>
    <td>N/A</td>
    <td>string</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/api#cartCount"><code>cartCount</code></a></td>
    <td>number</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/api#cartDetails"><code>cartDetails</code></a></td>
    <td>Object of cart entries</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/redirectToCheckout()"><code>redirectToCheckout()</code></a></td>
    <td>sessionId?: string</td>
    <td>Error (if one occurrs)</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/clearCart()"><code>clearCart()</code></a></td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
</table>

### `formatCurrencyString(options)`

This function takes one options argument, these are the options for this function:

<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>value</td>
    <td>number</td>
  </tr>
  <tr>
    <td>currency</td>
    <td>string</td>
  </tr>
  <tr>
    <td>language</td>
    <td>string (optional)</td>
  </tr>
</table>

## Environment Variable Tutorials

The following tutorials teach how to set up your custom environment variables for your project.

- [create-react-app](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [gatsby.js](https://www.gatsbyjs.org/docs/environment-variables/)
- [next.js](https://nextjs.org/docs/api-reference/next.config.js/environment-variables)
- [react-static](https://github.com/react-static/react-static/blob/master/docs/concepts.md#environment-variables)

## License

MIT © [dayhaysoos](https://github.com/dayhaysoos)

---

## Working on this project:

If you're working on this project don't forget to check out
[the CONTRIBUTING.md file](https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/CONTRIBUTING.md).

Before you run any of the examples be sure to set your environment variables at the root of
the project in a `.env` file (or `documentation/.env` for the documentation workspace). There is a `.env.example` and a `documentation/.env.example` file with the example variables you'll need to run the examples and documentation workspaces in this project. You'll need to fill them in with your own API keys from Stripe.

```dotenv
# .env.example
STRIPE_API_PUBLIC=
STRIPE_API_SECRET=

# documentation/.env.example
GATSBY_STRIPE_PUBLISHABLE_KEY=
```

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

### Warning
Please make all README edits to `/use-shopping-cart/README.md`. All edits to `/README.md` will be overwritten on
 commit by `/use-shopping-cart/README.md`. Consider `/README.md` read-only.

We created this hook with [create-react-hook](https://github.com/hermanya/create-react-hook).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.kevincunningham.co.uk"><img src="https://avatars3.githubusercontent.com/u/8320213?v=4" width="100px;" alt=""/><br /><sub><b>Kevin Cunningham</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=doingandlearning" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=doingandlearning" title="Code">💻</a></td>
    <td align="center"><a href="https://ianjones.us/"><img src="https://avatars2.githubusercontent.com/u/4407263?v=4" width="100px;" alt=""/><br /><sub><b>Ian Jones</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=theianjones" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://chrisbrownie.dev/"><img src="https://avatars2.githubusercontent.com/u/19195374?v=4" width="100px;" alt=""/><br /><sub><b>Christopher Brown</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/dayhaysoos"><img src="https://avatars3.githubusercontent.com/u/1852675?v=4" width="100px;" alt=""/><br /><sub><b>Nick DeJesus</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://shodipoayomide.com"><img src="https://avatars2.githubusercontent.com/u/20538832?v=4" width="100px;" alt=""/><br /><sub><b>Shodipo Ayomide</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=Developerayo" title="Documentation">📖</a></td>
    <td align="center"><a href="http://appbureauet.dk"><img src="https://avatars1.githubusercontent.com/u/167574?v=4" width="100px;" alt=""/><br /><sub><b>Anders Bech Mellson</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=mellson" title="Code">💻</a></td>
    <td align="center"><a href="https://thorweb.dev"><img src="https://avatars0.githubusercontent.com/u/23213994?v=4" width="100px;" alt=""/><br /><sub><b>Thor 雷神</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Documentation">📖</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://ryan.warner.codes"><img src="https://avatars2.githubusercontent.com/u/1595979?v=4" width="100px;" alt=""/><br /><sub><b>Ryan Warner</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=RyanWarner" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
