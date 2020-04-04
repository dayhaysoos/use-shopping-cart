# use-stripe-cart

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

> Shopping cart state and logic for Stripe

[![NPM](https://img.shields.io/npm/v/use-stripe-cart.svg)](https://www.npmjs.com/package/use-stripe-cart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-stripe-cart

or

yarn add use-stripe-cart
```

## Usage

At the root level of your app, wrap your Root app in the `<CartProvider />`

```jsx
/** @jsx jsx */
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
```

To add an item to the cart, you could use `addItem()`

```jsx
/**@jsx jsx */
import { jsx, Box, Image, Button, Flex } from 'theme-ui';
import { useStripeCart } from 'use-stripe-cart';
import { toCurrency } from '../util';

/**
 * PRODUCT DATA COMING FROM PROPS
const fakeData = [
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
];
*/

const Product = product => {
  const { addItem } = useStripeCart();
  const { name, sku, price, image, currency } = product;
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image src={image} />
      <Box>
        <p>{name}</p>
        <p>{toCurrency({ price: price, currency })}</p>
      </Box>
      <Button onClick={() => addItem({ ...product })} backgroundColor={'black'}>
        Add To Cart
      </Button>
    </Flex>
  );
};
```

For displaying what's actually in the cart, refer to the CartDisplay component:
https://github.com/dayhaysoos/use-stripe-cart/blob/master/example/src/components/cart-display.js

## API

`cartDetails: Object`

Cart details is an object with skus of the items in the cart as keys and details of the items as the value, for example:

```jsx
{
  sku_GBJ2Ep8246qeeT: {
    name: 'Bananas';
    sku: 'sku_GBJ2Ep8246qeeT';
    price: 400;
    image: 'https://www.fillmurray.com/300/300';
    currency: 'USD';
    quantity: 1;
    formattedPrice: '$4.00';
  }
}
```

## License

MIT © [dayhaysoos](https://github.com/dayhaysoos)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.kevincunningham.co.uk"><img src="https://avatars3.githubusercontent.com/u/8320213?v=4" width="100px;" alt=""/><br /><sub><b>Kevin Cunningham</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-stripe-cart/commits?author=doingandlearning" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://ianjones.us/"><img src="https://avatars2.githubusercontent.com/u/4407263?v=4" width="100px;" alt=""/><br /><sub><b>Ian Jones</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-stripe-cart/commits?author=theianjones" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://chrisbrownie.dev/"><img src="https://avatars2.githubusercontent.com/u/19195374?v=4" width="100px;" alt=""/><br /><sub><b>Christopher Brown</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-stripe-cart/commits?author=ChrisBrownie55" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
