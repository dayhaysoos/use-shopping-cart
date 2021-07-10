import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export function LoadCart() {
  const { loadCart } = useShoppingCart()

  const cartData = {
    some_product: {
      name: 'Some Product',
      sku: 'some_product',
      price: 400,
      currency: 'USD',
      id: 'some_product',
      quantity: 5,
      value: 750,
      formattedValue: '$7.50'
    }
  }

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
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          width: '100%',
          flexDirection: 'column'
        }}
      >
        <pre
          style={{
            backgroundColor: 'lightgray',
            marginBottom: 10,
            fontSize: 12,
            padding: 10,
            height: 200,
            overflow: 'scroll'
          }}
        >
          {JSON.stringify(cartData, null, 2)}
        </pre>
        <button
          onClick={() => loadCart(cartData)}
          aria-label={`Add cart data to your cart`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          Load Cart data to Cart
        </button>
        <button
          onClick={() => loadCart(cartData, false)}
          aria-label={`Add cart data to your cart`}
          style={{ height: 50, width: 100, marginBottom: 30 }}
        >
          Replace Cart data
        </button>
      </section>
    </article>
  )
}

export default LoadCart
