'use client'

import * as React from 'react'
import { ShoppingCart, createCartState } from '../core/ShoppingCart'
import type { CartConfig } from '../core/types'
import { CartContext, setServerState } from './cartContext'
import { OptimisticCartLayer } from './optimisticCartLayer'

export interface CartProviderProps extends CartConfig {
  children: React.ReactNode
}

export function CartProvider({ children, ...config }: CartProviderProps) {
  const [cart] = React.useState(() => {
    const created = new ShoppingCart(config)
    setServerState(
      created,
      createCartState({ ...config, language: config.language ?? 'en-US' })
    )
    return created
  })

  return (
    <CartContext.Provider value={cart}>
      <OptimisticCartLayer>{children}</OptimisticCartLayer>
    </CartContext.Provider>
  )
}
