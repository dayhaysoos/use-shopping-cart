import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export function CartDisplayWrapper({ children }) {
  const { cartDetails, clearCart } = useShoppingCart()

  return (
    <section
      style={{
        display: 'flex',
        overflow: 'hidden',
        flexWrap: 'wrap',
        marginBottom: 30
      }}
    >
      {children}
      <div style={{ width: '50%' }}>
        <pre
          style={{
            backgroundColor: 'lightgray',
            marginBottom: 10,
            fontSize: 12,
            padding: 10,
            height: 500,
            overflow: 'scroll',
            color: 'black'
          }}
        >
          {JSON.stringify(cartDetails, null, 2)}
        </pre>
        <button onClick={clearCart} aria-label="Clear Cart">
          Clear Cart
        </button>
      </div>
    </section>
  )
}

export default CartDisplayWrapper
