'use client'

import { useSyncExternalStore, useCallback, useRef } from 'react'
import { getServerState, useCartContext } from './cartContext'
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

function getCartView(
  cart: ShoppingCart,
  state: CartState
): UseShoppingCartReturn {
  let view = cartViewCache.get(state)
  if (!view) {
    view = { ...state, ...getMethods(cart) }
    cartViewCache.set(state, view)
  }
  return view
}

type CartSelector<T> = (cart: UseShoppingCartReturn) => T

const selectionCache = new WeakMap<
  UseShoppingCartReturn,
  WeakMap<CartSelector<unknown>, unknown>
>()

function select<T>(view: UseShoppingCartReturn, selector: CartSelector<T>): T {
  let selections = selectionCache.get(view)
  if (!selections) {
    selections = new WeakMap()
    selectionCache.set(view, selections)
  }
  if (selections.has(selector)) return selections.get(selector) as T
  const selected = selector(view)
  selections.set(selector, selected)
  return selected
}

export function useShoppingCart(): UseShoppingCartReturn
export function useShoppingCart<T>(
  selector: CartSelector<T>,
  isEqual?: (previous: T, next: T) => boolean
): T
export function useShoppingCart<T>(
  selector?: CartSelector<T>,
  isEqual?: (previous: T, next: T) => boolean
): T | UseShoppingCartReturn {
  const cart = useCartContext()
  const lastSelection = useRef<{ value: T } | null>(null)

  const subscribe = useCallback(
    (callback: () => void) => cart.subscribe(callback),
    [cart]
  )

  const snapshotOf = (state: CartState) => {
    const view = getCartView(cart, state)
    if (!selector) return view
    const selected = select(view, selector)
    const last = lastSelection.current
    if (isEqual && last && isEqual(last.value, selected)) return last.value
    lastSelection.current = { value: selected }
    return selected
  }

  return useSyncExternalStore(
    subscribe,
    () => snapshotOf(cart.getState()),
    () => snapshotOf(getServerState(cart))
  )
}
