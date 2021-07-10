/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import * as React from 'react'
import { CartProvider, useShoppingCart } from '../react/index'

function UscWithSelector() {
  const cart = useShoppingCart(
    ({ totalPrice }) => ({ totalPrice })
  )

  cart.totalPrice
  // Can't access anything outside of totalPrice and the cart actions.
  // cart.cartCount

  return null
}
function UscWithoutSelector() {
  const cart = useShoppingCart()
  cart.totalPrice
  cart.formattedTotalPrice
  cart.cartCount
  cart.cartDetails

  const cartEntry = cart.cartDetails['id_abcd1234']
  cartEntry.value
  cartEntry.description
  cartEntry.formattedValue
  cartEntry.id
  cartEntry.image
  cartEntry.name
  cartEntry.price
  cartEntry.price_data
  cartEntry.product_data
  cartEntry.quantity
  cartEntry.value

  cart.stripe
  cart.cartMode
  cart.mode
  cart.successUrl
  cart.cancelUrl
  cart.billingAddressCollection
  cart.allowedCountries
  cart.shouldDisplayCart
  cart.lastClicked
  cart.currency
  cart.language

  return null
}
function UscActions() {
  const cart = useShoppingCart(() => ({}))
  cart.loadCart({
    some_product: {
      name: 'Some Product',
      sku: 'some_product',
      price: 400,
      currency: 'USD',
      id: 'some_product',
      quantity: 5,
      value: 750,
      formattedValue: '$7.50'
    }
  })
  cart.addItem({
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    id: 'id_banana001',
    price: 400,
    currency: 'USD',
    image: 'https://my-image.com/banana.jpg'
  })
  cart.incrementItem('id_banana001')
  cart.incrementItem('id_banana001', { count: 4 })
  cart.decrementItem('id_banana001', { count: 2 })
  cart.setItemQuantity('id_banana001', 10)
  cart.removeItem('id_banana001')

  cart.storeLastClicked('id_banana001')
  cart.handleCartHover()
  cart.handleCloseCart()
  cart.handleCartClick()

  cart.redirectToCheckout()
  cart.checkoutSingleItem('id_banana001')

  cart.changeStripeKey('PUBLIC_STRIPE_API_KEY')
  cart.changeLanguage('ja')
  cart.changeCurrency('JPY')
  return null
}

function App() {
  return (
    <>
      <CartProvider
        cartMode="checkout-session"
        stripe="KEY"
        currency="USD"
      >
        <UscWithSelector />
      </CartProvider>

      <CartProvider
        cartMode="client-only"
        mode="payment"
        stripe="KEY"
        currency="USD"
        successUrl="https://example.com/success"
        cancelUrl="https://example.com/"
      >
        <UscWithoutSelector />
      </CartProvider>

      <CartProvider
        cartMode="client-only"
        mode="subscription"
        stripe="KEY"
        currency="USD"
        successUrl="https://example.com/success"
        cancelUrl="https://example.com/"
        allowedCountries={['US', 'GB', 'CA']}
        billingAddressCollection={true}
      >
        <UscActions />
      </CartProvider>
    </>
  )
}
