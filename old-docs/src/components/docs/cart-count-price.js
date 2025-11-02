import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export function CartCountPrice() {
  const { cartCount, totalPrice, formattedTotalPrice } = useShoppingCart()

  return (
    <>
      <label>Cart Count:</label> <p>{cartCount}</p>
      <label>Total Price:</label> <p>{totalPrice}</p>
      <label>Formatted Total Price:</label>
      <p>{formattedTotalPrice}</p>
    </>
  )
}

export default CartCountPrice
