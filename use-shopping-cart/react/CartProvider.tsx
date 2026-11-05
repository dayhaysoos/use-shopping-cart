'use client'

import * as React from 'react'
import { ShoppingCart } from '../core/ShoppingCart'
import type { CartConfig } from '../core/types'
import { isClient } from '../utilities/SSR'
import { CartContext } from './cartContext'
import { OptimisticCartLayer } from './useOptimisticCart'

export { useCartContext } from './cartContext'

export interface CartProviderProps extends CartConfig {
  children: React.ReactNode
  loading?: React.ReactNode
}

export function CartProvider({
  children,
  loading = null,
  ...config
}: CartProviderProps) {
  // Created once per mount; later config changes are applied through cart actions.
  const [cart] = React.useState(() => new ShoppingCart(config))

  // Server-side rendering guard: use global isClient to match ShoppingCart's storage initialization
  if (config.shouldPersist !== false && !isClient) {
    return <>{loading}</>
  }

  return (
    <CartContext.Provider value={cart}>
      <OptimisticCartLayer>{children}</OptimisticCartLayer>
    </CartContext.Provider>
  )
}
