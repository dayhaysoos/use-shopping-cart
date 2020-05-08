import React from 'react';
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart';

export function IncrementItem({ product }) {
  const { incrementItem } = useShoppingCart();

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
      <section
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
        }}
      >
        <button
          onClick={() => incrementItem(product.sku)}
          aria-label={`Add one ${product.name} to your cart`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          {`Add one ${product.name} to your cart`}
        </button>
        <button
          onClick={() => incrementItem(product.sku, 10)}
          aria-label={`Add by 10`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          {`Add 10 ${product.name} to your cart`}
        </button>
      </section>
    </article>
  );
}

export default IncrementItem;
