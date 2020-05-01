import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

export function RedirectToCheckout({ product }) {
  const { redirectToCheckout, cartDetails } = useShoppingCart()

  const hasItems = !Object.keys(cartDetails).length > 0

  /* A helper function that turns the price into a readable format */
  const price = formatCurrencyString({
    value: product.price,
    currency: product.currency,
    language: 'en-US',
  })
  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
      }}
    >
      <figure style={{ textAlign: 'center' }}>
        <img
          style={{ height: 200, width: 250 }}
          src={product.image}
          alt={product.name}
        />
        <figcaption>{product.name}</figcaption>
      </figure>
      <p>{price}</p>

      {hasItems && (
        <p style={{ color: 'red' }}>
          Please go to addItem() and add an item to the cart
        </p>
      )}

      <button
        disabled={hasItems}
        onClick={() => redirectToCheckout()}
        aria-label={`Add ${product.name} to your cart`}
        style={{ height: 50, width: 100, marginBottom: 30 }}
      >
        Checkout
      </button>
    </article>
  )
}

export default RedirectToCheckout
