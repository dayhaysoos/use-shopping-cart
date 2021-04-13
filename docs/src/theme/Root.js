import React from 'react'
import { CartProvider } from 'use-shopping-cart'

function Root({ children }) {
  return (
    <>
      <CartProvider
        cartMode="checkout-session"
        mode="payment"
        stripe={'pk_test_MAQ6vJsaQH6lTjJQc07plIB000QCr569IB'}
        billingAddressCollection={false}
        successUrl="https://stripe.com"
        cancelUrl="https://twitter.com/dayhaysoos"
        currency="USD"
      >
        {children}
      </CartProvider>
    </>
  )
}

export default Root
