'use client'

import { useSyncExternalStore, useCallback, useRef } from 'react'
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
  'changeLanguage',
  'changeCurrency'
] as const

type CartActionName = (typeof cartActionNames)[number]

export type CartActions = {
  [K in keyof Pick<ShoppingCart, CartActionName>]: (
    ...args: Parameters<ShoppingCart[K]>
  ) => ReturnType<ShoppingCart[K]>
}

export interface UseShoppingCartReturn extends CartState, CartActions {}

const methodsCache = new WeakMap<ShoppingCart, CartActions>()
const cartViewCache = new WeakMap<CartState, UseShoppingCartReturn>()

function getMethods(cart: ShoppingCart): CartActions {
  let methods = methodsCache.get(cart)
  if (!methods) {
    methods = Object.fromEntries(
      cartActionNames.map((name) => [name, cart[name].bind(cart)])
    ) as CartActions
    methodsCache.set(cart, methods)
  }
  return methods
}

function getCartView(cart: ShoppingCart): UseShoppingCartReturn {
  const state = cart.getState()
  let view = cartViewCache.get(state)
  if (!view) {
    view = { ...state, ...getMethods(cart) }
    cartViewCache.set(state, view)
  }
  return view
}

export function useShoppingCart(): UseShoppingCartReturn
export function useShoppingCart<T>(
  selector: (cart: UseShoppingCartReturn) => T
): T
export function useShoppingCart<T>(
  selector: (cart: UseShoppingCartReturn) => T = (cart) => cart as unknown as T
): T {
  const cart = useCartContext()
  const last = useRef<{
    view: UseShoppingCartReturn
    selector: (cart: UseShoppingCartReturn) => T
    selected: T
  } | null>(null)

  const subscribe = useCallback(
    (callback: () => void) => cart.subscribe(callback),
    [cart]
  )

  const getSnapshot = () => {
    const view = getCartView(cart)
    if (last.current?.view === view && last.current.selector === selector) {
      return last.current.selected
    }
    const selected = selector(view)
    last.current = { view, selector, selected }
    return selected
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
