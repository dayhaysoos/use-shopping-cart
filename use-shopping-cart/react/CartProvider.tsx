'use client'

import * as React from 'react'
import { ShoppingCart } from '../core/ShoppingCart'
import type { CartConfig } from '../core/types'
import { isClient } from '../utilities/SSR'

const CartContext = React.createContext<ShoppingCart | null>(null)

export interface CartProviderProps extends CartConfig {
  children: React.ReactNode
  loading?: React.ReactNode
}

export function CartProvider({
  children,
  loading = null,
  ...config
}: CartProviderProps) {
  const cartRef = React.useRef<ShoppingCart | null>(null)

  if (!cartRef.current) {
    cartRef.current = new ShoppingCart(config)
  }

  // Server-side rendering guard: use global isClient to match ShoppingCart's storage initialization
  if (config.shouldPersist !== false && !isClient) {
    return <>{loading}</>
  }

  return (
    <CartContext.Provider value={cartRef.current}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext(): ShoppingCart {
  const cart = React.useContext(CartContext)

  if (!cart) {
    throw new Error('useCartContext must be used within CartProvider')
  }

  return cart
}
