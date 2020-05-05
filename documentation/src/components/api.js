import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export function API() {
  const { cartCount, totalPrice } = useShoppingCart()

  return (
    <>
      <label>Total Price:</label> <p>{totalPrice()}</p>
      <label>Cart Count:</label> <p>{cartCount}</p>
    </>
  )
}

export default API
