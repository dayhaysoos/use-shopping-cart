export const exampleProducts = `
[
  {
    "name": "Bananas",
    "description": "Yummy yellow fruit",
    "id": "id_banana001",
    "price": 400,
    "currency": "USD",
    "image": "https://cdn.mos.cms.futurecdn.net/42E9as7NaTaAi4A6JcuFwG-1200-80.jpg"
  }
]
`

export const exampleCartProvider = `
import ReactDOM from 'react-dom'
import { CartProvider } from 'use-shopping-cart'

import App from './App'

ReactDOM.render(
  <CartProvider
    mode="payment"
    cartMode="client-only"
    stripe={YOUR_STRIPE_API_KEY_GOES_HERE}
    successUrl="stripe.com"
    cancelUrl="twitter.com/dayhaysoos"
    currency="USD"
    allowedCountries={['US', 'GB', 'CA']}
    billingAddressCollection={true}
  >
    <App />
  </CartProvider>,
  document.getElementById('root')
)
`

export const exampleFrontend = `
import { useShoppingCart, formatCurrencyString } 'use-shopping-cart'

function Product({ product }) {
  const { redirectToCheckout } = useShoppingCart()
  const { name, image, description, currency } = product
  const price = formatCurrencyString({ value: product.price, currency, language: 'en-US' })

  async function buyNow() {
    const response = await fetch("/.netlify/functions/create-session", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [product.id]: { ...product, quantity: 1 } }),
    }).then(res => res.json())
      .catch(error => {/* Error handling */})

    redirectToCheckout({ sessionId: response.sessionId })
  }

  return (
    <article>
      <figure>
        <img src={image} alt={description} width="100" />
        <figcaption>
          {price} {name}
        </figcaption>
      </figure>
      <button onClick={buyNow}>Buy now</button>
    </article>
  )
}
`

export const exampleServerless = `
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_API_SECRET)
const { validateCartItems } = require('use-shopping-cart/src/serverUtil')
const inventory = require('./data/products.json')

exports.handler = async (event) => {
  try {
    const productJSON = JSON.parse(event.body)
    const line_items = validateCartItems(inventory, productJSON)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      success_url: \`${process.env.URL}/success.html\`,
      cancel_url: process.env.URL,
      line_items
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id })
    }
  } catch (error) {/* Error handling */}
}
`
