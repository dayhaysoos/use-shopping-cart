import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'
import { AddMoreItems } from './utilities'

export function SetItemQuantity() {
  const { setItemQuantity, cartDetails } = useShoppingCart()

  const entries = []
  for (const sku in cartDetails) {
    const entry = cartDetails[sku]

    const options = []
    for (let quantity = 1; quantity <= 20; ++quantity)
      options.push(<option value={quantity}>{quantity}</option>)

    entries.push(
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
            src={entry.image}
            alt={entry.name}
          />
          <figcaption>{entry.name}</figcaption>
        </figure>
        <p>{entry.formattedValue}</p>

        <div style={{ display: 'flex', alignItem: 'center' }}>
          {/* Dropdown to change the item's quantity */}
          <label htmlFor="quantity-select" style={{ margin: '0 1rem 0 0' }}>
            Quantity:
          </label>
          <select
            id="quantity-select"
            defaultValue={entry.quantity}
            onChange={(event) => {
              setItemQuantity(sku, parseInt(event.target.value, 10))
            }}
          >
            {options}
          </select>
        </div>
      </article>
    )
  }

  if (entries.length) return entries
  return <AddMoreItems />
}

export default SetItemQuantity
