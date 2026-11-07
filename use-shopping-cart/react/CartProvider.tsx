'use client'

import * as React from 'react'
import { ShoppingCart } from '../core/ShoppingCart'
import type { CartConfig } from '../core/types'
import { CartContext } from './cartContext'
import { OptimisticCartLayer } from './optimisticCartLayer'

export interface CartProviderProps extends CartConfig {
  children: React.ReactNode
}

export function CartProvider({ children, ...config }: CartProviderProps) {
  const [cart] = React.useState(() => new ShoppingCart(config))

  return (
    <CartContext.Provider value={cart}>
      <OptimisticCartLayer>{children}</OptimisticCartLayer>
    </CartContext.Provider>
  )
}
