import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

export function DecrementItem({ product }) {
  const { decrementItem } = useShoppingCart()

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
          alt={product.name}
        />
        <figcaption>{product.name}</figcaption>
      </figure>
      <p>{price}</p>
      {/* Removes the item from the cart */}
      <section
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-evenly'
        }}
      >
        <button
          onClick={() => decrementItem(product.sku)}
          aria-label={`Remove one ${product.name} from your cart`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          {`Remove one ${product.name} from your cart`}
        </button>
        <button
          onClick={() => decrementItem(product.sku, 10)}
          aria-label={`Remove by 10`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          {`Remove 10 ${product.name} from your cart`}
        </button>
      </section>
    </article>
  )
}

export default DecrementItem
