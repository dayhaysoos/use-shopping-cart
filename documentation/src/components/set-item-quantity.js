import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

export function SetItemQuantity({ product }) {
  const { setItemQuantity, cartDetails } = useShoppingCart()

  const itemQuantity = !cartDetails[product.sku]
    ? 0
    : cartDetails[product.sku].quantity

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
      {/* Dropdown to change the item's quantity */}
      <select
        defaultValue={itemQuantity}
        onChange={(event) => {
          setItemQuantity(product.sku, event.target.value)
        }}
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
      </select>
    </article>
  )
}

export default SetItemQuantity
