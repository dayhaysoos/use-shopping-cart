import React from 'react'
import { CartProvider } from 'use-shopping-cart'
import { DocsProvider } from '../context'

function Root({ children }) {
  return (
    <>
      <DocsProvider>
        <CartProvider
          mode="payment"
          cartMode="checkout-session"
          stripe={process.env.REACT_APP_STRIPE_API_PUBLIC}
          billingAddressCollection={false}
          successUrl="https://stripe.com"
          cancelUrl="https://twitter.com/dayhaysoos"
          currency="USD"
        >
          {children}
        </CartProvider>
      </DocsProvider>
    </>
  )
}

export default Root
