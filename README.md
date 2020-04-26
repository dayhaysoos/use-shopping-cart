# use-shopping-cart

> A React Hook that handles shopping cart state and logic for Stripe.

[![NPM](https://img.shields.io/npm/v/use-shopping-cart.svg)](https://www.npmjs.com/package/use-shopping-cart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Installation

```bash
npm install --save use-shopping-cart

# or

yarn add use-shopping-cart
```

## Usage

### Initialization

At the root level of your application (or the highest point you'll be using Stripe from), wrap your components in a `<CartProvider>`.

`<CartProvider>` comes with several props that allow you to interact with the Stripe API and customize the Stripe experience.

```jsx
import ReactDOM from 'react-dom'

import { loadStripe } from '@stripe/stripe-js'
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js'
import { CartProvider } from 'use-shopping-cart'

import App from './App'

// Remember to add your public Stripe key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_PUBLIC)

ReactDOM.render(
  <Elements stripe={stripePromise}>
    <ElementsConsumer>
      {({ stripe }) => (
        <CartProvider
          stripe={stripe}
          successUrl="stripe.com"
          cancelUrl="twitter.com/dayhaysoos"
          currency="USD"
          allowedCountries={['US', 'UK', 'CA']}
          billingAddressCollection={true}
        >
          <App />
        </CartProvider>
      )}
    </ElementsConsumer>
  </Elements>,
  document.getElementById('root')
)
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
    currency: 'USD',
  },
  {
    name: 'Tangerines',
    sku: 'sku_GBJ2WWfMaGNC2Z',
    price: 100,
    image: 'https://www.fillmurray.com/300/300',
    currency: 'USD',
  },
]

export function App() {
  /* Gets the totalPrice and a method for redirecting to stripe */
  const { totalPrice, redirectToCheckout } = useShoppingCart()

  return (
    <div>
      {/* Renders the products */}
      {productData.map(product => (
        <Product product={product} />
      ))}

      {/* This is where we'll render our cart */}
      <p>Total: {totalPrice()}</p>
      <CartItems />

      {/* Redirects the user to Stripe */}
      <button onClick={redirectToCheckout}>Checkout</button>
    </div>
  )
}
```

#### How do I add an item to the user's cart?

To add a product to the cart, use `useShoppingCart()`'s `addItem(product)` method. It takes in your product object, which must have a `sku` and a `price`, and adds it to the cart.

```jsx
import { useShoppingCart, toCurrency } from 'use-shopping-cart'

export function Product({ product }) {
  const { addItem } = useShoppingCart()

  /* A helper function that turns the price into a readable format */
  const price = toCurrency({
    price: product.price,
    currency: product.currency,
    language: navigator.language,
  })

  return (
    <article>
      <figure>
        <img src={product.image} alt="" />
        <figcaption>{product.name}</figcaption>
      </figure>
      <p>{price}</p>

      {/* Adds the item to the cart */}
      <button
        onClick={() => addItem(product)}
        aria-label={`Add ${product.name} to your cart`}
      >Add to cart</button>
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
    reduceItemByOne,
    addItem,
    removeCartItem
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
        <p>Line total: {cartEntry.formattedValue}</p>

        {/* What if we want to remove one of the item... or add one */}
        <button
          onClick={() => reduceItemByOne(cartEntry.sku)}
          aria-label={`Remove one ${cartEntry.name} from your cart`}
        >-</button>
        <p>Quantity: {cartEntry.quantity}</p>
        <button
          onClick={() => addItem(cartEntry)}
          aria-label={`Add one ${cartEntry.name} to your cart`}
        >+</button>

        {/* What if we don't want this product at all */}
        <button
          onClick={() => removeCartItem(cartEntry.sku)}
          aria-label={`Remove all ${cartEntry.name} from your cart`}
        >Remove</button>
      </article>
    )
  }
}
```

Note that in the above code, to reduce the quantity of a product in the user's cart, you must pass an SKU to `reduceItemByOne()` like so:

```js
reduceItemByOne(cartEntry.sku)
```

Just like you can reduce the quantity of a product you can remove the product entirely with `removeCartItem()`:

```js
removeCartItem(cartEntry.sku)
```

However, those two examples differ from the way that you increase the quantity of a product in the user's cart. Currently, to do this, you must pass the entire `cartEntry` to `addItem()`:

```js
addItem(cartEntry)
```

## API

You can [view the full API](https://use-shopping-cart.netlify.app/) on our documentation page.

### `<CartProvider>`

<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
  </tr>
</table>

### `useShoppingCart()`

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
    <td><a href="https://use-shopping-cart.netlify.app/usage/reduceItemByOne()"><code>reduceItemByOne()</code></a></td>
    <td>sku: string</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/removeCartItem()"><code>removeCartItem()</code></a></td>
    <td>sku: string</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="https://use-shopping-cart.netlify.app/usage/api#totalPrice"><code>totalPrice()</code></a></td>
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
    <td>N/A</td>
    <td>Error (if one occurrs)</td>
  </tr>
</table>

## License

MIT © [dayhaysoos](https://github.com/dayhaysoos)

---

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
    <td align="center"><a href="https://chrisbrownie.dev/"><img src="https://avatars2.githubusercontent.com/u/19195374?v=4" width="100px;" alt=""/><br /><sub><b>Christopher Brown</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dayhaysoos"><img src="https://avatars3.githubusercontent.com/u/1852675?v=4" width="100px;" alt=""/><br /><sub><b>Nick DeJesus</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://shodipoayomide.com"><img src="https://avatars2.githubusercontent.com/u/20538832?v=4" width="100px;" alt=""/><br /><sub><b>Shodipo Ayomide</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=Developerayo" title="Documentation">📖</a></td>
    <td align="center"><a href="http://appbureauet.dk"><img src="https://avatars1.githubusercontent.com/u/167574?v=4" width="100px;" alt=""/><br /><sub><b>Anders Bech Mellson</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=mellson" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
