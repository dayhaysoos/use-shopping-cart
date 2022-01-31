import { CartActions, CartState, Config, Product } from '../core'
import * as React from 'react'

export { actions, filterCart, formatCurrencyString } from '../core/index.d'

type ProviderProps = Config & {
  children: React.ReactNode
  loading?: React.ReactNode
}

/**
 * Context provider to interact with Stripe API
 */
export const CartProvider: React.FunctionComponent<ProviderProps>

/**
 * Provides several utilities and pieces of data for you to use in your application.
 */
export function useShoppingCart<SelectorResult extends Partial<CartState>>(
  selector?: (state: CartState) => SelectorResult
): SelectorResult & CartActions

/**
 * Displays the values returned by `useShoppingCart()` in a table format.
 */
export const DebugCart: React.FunctionComponent<
  React.DetailedHTMLProps<
    React.TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >
>
