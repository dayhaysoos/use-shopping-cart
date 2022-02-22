import * as React from 'react'
import { AddMoreItems } from './utilities'
import { CartDisplayWrapper } from './cart-display-wrapper'
import { useShoppingCart } from 'use-shopping-cart'

export default function CartDetails() {
  const { cartCount } = useShoppingCart()

  if (cartCount < 1) return <AddMoreItems />
  return <CartDisplayWrapper />
}
