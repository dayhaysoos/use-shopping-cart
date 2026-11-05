'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { useCartContext } from './CartProvider'
import type { ShoppingCart } from '../core/ShoppingCart'
import type { CartState } from '../core/types'

const cartActionNames = [
  'addItem',
  'incrementItem',
  'decrementItem',
  'setItemQuantity',
  'removeItem',
  'clearCart',
  'loadCart',
  'handleCartHover',
  'handleCartClick',
  'handleCloseCart',
  'storeLastClicked',
  'changeStripeKey',
  'changeLanguage',
  'changeCurrency',
  'redirectToCheckout'
] as const

type CartActionName = (typeof cartActionNames)[number]

export type CartActions = {
  [K in keyof Pick<ShoppingCart, CartActionName>]: (
    ...args: Parameters<ShoppingCart[K]>
  ) => ReturnType<ShoppingCart[K]>
}

export interface UseShoppingCartReturn extends CartState, CartActions {}

export function useShoppingCart(): UseShoppingCartReturn {
  const cart = useCartContext()

  const state = useSyncExternalStore(
    (callback) => cart.subscribe(callback),
    () => cart.getState(),
    () => cart.getState()
  )

  const methods = useMemo(
    () =>
      Object.fromEntries(
        cartActionNames.map((name) => [name, cart[name].bind(cart)])
      ) as CartActions,
    [cart]
  )

  return { ...state, ...methods }
}
