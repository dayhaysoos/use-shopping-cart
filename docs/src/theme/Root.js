import React from 'react'
import { CartProvider } from 'use-shopping-cart'

function Root({ children }) {
  return (
    <>
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
      ,
    </>
  )
}

export default Root
