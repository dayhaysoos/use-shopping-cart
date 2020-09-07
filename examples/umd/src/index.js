import { jsx } from './utils.js'
import { ProductList } from './ProductList.js'
import { Cart } from './Cart.js'

function App() {
  return jsx`
    <main>
      <h1>Use Shopping Cart ― UMD</h1>
      <${ProductList} />
      <${Cart} />
    </main>
  `
}

const stripe = Stripe(process.env.STRIPE_API_PUBLIC)
const { render } = ReactDOM
const { CartProvider } = UseShoppingCart
render(
  jsx`
  <${CartProvider}
    mode=client-only
    stripe=${stripe}
    successUrl=/success
    cancelUrl=/cancelled
    currency=USD
    allowedCountries=${['US', 'GB', 'CA']}
    billingAddressCollection
  >
    <${App} />
  <//>
`,
  document.getElementById('root')
)
