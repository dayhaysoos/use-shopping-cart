import { CartDetails, CartState, Config, Product } from '../core'
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

export interface CartActions {
  /**
   * Add `count` amount of a product to the cart
   * @param product The product to add to the cart
   * @param count The quantity of the product to add
   */
  addItem: (
    product: Product,
    options?: {
      count: number
      price_metadata?: { [propName: string]: any }
      product_metadata?: { [propName: string]: any }
    }
  ) => undefined

  /**
   * Remove an item from the cart by its product ID
   * @param id The product ID of the item in the cart to remove
   */
  removeItem: (id: string) => undefined

  /**
   * Reduce the quantity of an item in the cart by `count`
   * @param id The product ID of the item to reduce in quantity
   * @param options.count The quantity to decrease by, defaults to 1
   */
  decrementItem: (id: string, options?: { count: number }) => undefined

  /**
   * Increase the quantity of an item in the cart by `count`
   * @param id The product ID of the item to increase in quantity
   * @param options.count The quantity to increase by, defaults to 1
   */
  incrementItem: (id: string, options?: { count: number }) => undefined

  /**
   * Set the quantity of an item in the cart to a specific value
   * @param id The product ID of the item whose quantity you wish to change
   * @param quantity The quantity to set the item to
   */
  setItemQuantity: (id: string, quantity: number) => undefined

  /**
   * Redirects customers to the Stripe checkout. Works in both
   * CheckoutSession and ClientOnly mode.
   * @param sessionId Used in CheckoutSession mode, it is the ID of the
   *                  checkout session created by your server/serverless function.
   * @returns Nothing or an error wrapped in a promise if an error occurred
   */
  redirectToCheckout: (sessionId?: string) => Promise<any>

  /**
   * Redirects customers to the Stripe checkout with a single product.
   * Only works in ClientOnly mode.
   * @param productId The ID of the product to buy one of.
   * @returns Nothing or an error wrapped in a promise if an error occurred
   */
  checkoutSingleItem: (productId: string) => Promise<any>

  /**
   * Totally clears the cart of all items
   */
  clearCart: () => undefined

  /**
   * @param cartDetails The cart cartDetails stored somewhere (e.g. on the server).
   * @param shouldMerge Defaults to true. When false, it replaces cartDetails entirely.
   * @see CartDetails
   */
  loadCart: (cartDetails: CartDetails, shouldMerge?: boolean) => undefined

  /**
   * Sets `shouldDisplayCart` to `true`.
   */
  handleCartHover: () => undefined

  /**
   * Toggles `shouldDisplayCart` between `true` and `false`.
   */
  handleCartClick: () => undefined

  /**
   * Sets `shouldDisplayCart` to `false`.
   */
  handleCloseCart: () => undefined

  /**
   * Given a product ID, it sets `lastClicked` to that value.
   */
  storeLastClicked: (lastClicked: string) => undefined

  /**
   * Given a public Stripe key string, it sets `stripe` to that value.
   */
  changeStripeKey: (stripeKey: string) => undefined

  /**
   * Given an ISO language code (e.g. en-US), it sets `language` to that value.
   */
  changeLanguage: (language: string) => undefined

  /**
   * Given an ISO currency code (e.g. USD), it sets `currency` to that value.
   */
  changeCurrency: (currency: string) => undefined
}

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
