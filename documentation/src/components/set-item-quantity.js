import React from 'react';
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart';

export function SetItemQuantity({ product }) {
  const { setItemQuantity, cartDetails } = useShoppingCart();

  const itemQuantity = !cartDetails[product.sku]
    ? 0
    : cartDetails[product.sku].quantity;

  /* A helper function that turns the price into a readable format */
  const price = formatCurrencyString({
    value: product.price,
    currency: product.currency,
    language: 'en-US',
  });
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
      {/* Adds the item to the cart */}
      <input
        type={'number'}
        defaultValue={itemQuantity}
        onChange={e => {
          const { value } = e.target;

          setItemQuantity(product.sku, value);
        }}
      />
      {/* <button
        onClick={() => setItemQuantity(product.sku), 10}
        aria-label={`Add one ${product.name} to your cart`}
        style={{ height: 50, width: 100, marginBottom: 30 }}
      >
        {`Add one ${product.name} to your cart`}
      </button> */}
    </article>
  );
}

export default SetItemQuantity;
