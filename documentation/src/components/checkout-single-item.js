import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

export function CheckoutSingleItem({ product }) {
  const { checkoutSingleItem } = useShoppingCart()

  /* A helper function that turns the price into a readable format */
  const price = formatCurrencyString({
    value: product.price,
    currency: product.currency,
    language: 'en-US'
  })
  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%'
      }}
    >
      <figure style={{ textAlign: 'center' }}>
        <img
          style={{ height: 200, width: 250 }}
          src={product.image}
          alt={` ${product.name}`}
        />
        <figcaption>{product.name}</figcaption>
      </figure>
      <p>{price}</p>
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          width: '100%'
        }}
      >
        <button
          onClick={() => checkoutSingleItem(product)}
          aria-label={`Buy ${product.name} to your cart`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          Buy Now
        </button>
        <button
          onClick={() => checkoutSingleItem({ ...product, quantity: 10 })}
          aria-label={`Buy 10 ${product.name} to your cart`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          Buy 10 Now
        </button>
      </section>
    </article>
  )
}

export default CheckoutSingleItem
