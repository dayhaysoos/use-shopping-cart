'use client'

import * as React from 'react'
import { ShoppingCart } from '../core/ShoppingCart'
import type { CartConfig } from '../core/types'
import { isClient } from '../utilities/SSR'
import { CartContext } from './cartContext'
import { OptimisticCartLayer } from './optimisticCartContext'

export interface CartProviderProps extends CartConfig {
  children: React.ReactNode
  loading?: React.ReactNode
}

export function CartProvider({
  children,
  loading = null,
  ...config
}: CartProviderProps) {
  const [cart] = React.useState(() => new ShoppingCart(config))

  if (config.shouldPersist !== false && !isClient) {
    return <>{loading}</>
  }

  return (
    <CartContext.Provider value={cart}>
      <OptimisticCartLayer>{children}</OptimisticCartLayer>
    </CartContext.Provider>
  )
}
