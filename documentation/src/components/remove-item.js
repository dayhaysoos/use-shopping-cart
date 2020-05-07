import React from 'react';
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart';

export function RemoveItem({ product }) {
  const { removeItem } = useShoppingCart();

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
      <button
        onClick={() => removeItem(product.sku)}
        aria-label={`Remove ${product.name} from your cart`}
        style={{ height: 50, width: 100, marginBottom: 30 }}
      >
        {`Remove from cart`}
      </button>
    </article>
  );
}

export default RemoveItem;
