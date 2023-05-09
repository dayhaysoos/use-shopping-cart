'use client'

import React from 'react'
import { CartProvider as USCProvider } from 'use-shopping-cart'

function CartProvider({ children }) {
  return (
    <USCProvider
      mode="checkout-session"
      stripe={'test'}
      currency={'USD'}
      successUrl={'https://example.com/success'}
      cancelUrl={'https://example.com/cancel'}
      allowedCountries={['US', 'GB', 'CA']}
      billingAddressCollection={true}
    >
      {children}
    </USCProvider>
  )
}

export default CartProvider

