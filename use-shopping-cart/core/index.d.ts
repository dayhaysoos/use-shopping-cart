import { Reducer } from '@reduxjs/toolkit'
import { Persistor } from 'redux-persist/es/types'

interface CommonConfig {
  /**
   * Your public Stripe API key used for checkout.
   */
  stripe: string
  /**
   * The preferred currency, written as an ISO currency code (i.e. USD),
   * used to format price data.
   */
  currency: string
  /**
   * The language, written as an ISO language code (i.e. en-US), to be
   * used format price data.
   */
  language?: string
}

interface ClientOnlyConfig extends CommonConfig {
  /**
   * Determines Stripe mode used for client-only configuration.
   */
  mode: 'subscription' | 'payment'
  /**
   * The cart mode determines whether or not the user will
   * check out directly with Stripe or will create a checkout
   * session via your server/serverless function.
   */
  cartMode: 'client-only'
  /**
   * The redirect url for a successful sale
   */
  successUrl: string
  /**
   * The redirect url for a cancelled sale
   */
  cancelUrl: string
  /**
   * Should the billing address be collected at the checkout. Defaults to false
   */
  billingAddressCollection?: boolean
  /**
   * The allowed countries
   */
  allowedCountries?: null | string[]
}

interface CheckoutSessionConfig extends CommonConfig {
  /**
   * Determines checkout mode
   */
  cartMode: 'checkout-session'
}

export type Config = ClientOnlyConfig | CheckoutSessionConfig

export interface Product {
  /**
   * The name of the product
   */
  name: string
  /**
   * The description of the product
   */
  description?: string
  /**
   * A unique product ID
   */
  id: string
  /**
   * The price of the product
   */
  price: number
  /**
   * A URL to an image of the product
   */
  image?: string
  /**
   * The currency of the product
   */
  currency: string
  /**
   * Values that go into the price_metadata field
   */
  price_data?: object
  /**
   * Values that go into the product_metadata field
   */
  product_data?: object
  /**
   * Any additional properties
   */
  [propName: string]: any
}

export interface CartEntry extends Product {
  /**
   * Amount of this product in the cart
   */
  readonly quantity: number
  /**
   * The total line item value, the `price` multiplied by the `quantity`
   */
  readonly value: number
  /**
   * Currency formatted version of `value`
   */
  readonly formattedValue: string
}

export type CartDetails = {
  [id: string]: CartEntry
}

export interface CartState {
  /**
   * The total price of the items in the cart
   */
  totalPrice: number
  /**
   * Currency formatted version of `totalPrice`
   */
  formattedTotalPrice: string
  /**
   * The number of items in the cart
   */
  cartCount: number
  /**
   * Cart details is an object with IDs of the items in the cart as
   * keys and details of the items as the value.
   */
  cartDetails: CartDetails
  /**
   * Public Stripe key used for checkout.
   */
  stripe: string
  /**
   * The mode used for determining if you will be checking out with Stripe
   * in the client's browser only or instead by creating a checkout session
   * with your server/serverless function.
   */
  cartMode: 'checkout-session' | 'client-only'
  /**
   * The type of payment mode to be used in client-only cart mode.
   */
  mode?: 'subscription' | 'payment'
  /**
   * The redirect url for a successful sale.
   */
  successUrl?: string
  /**
   * The redirect url for a cancelled sale.
   */
  cancelUrl?: string
  /**
   * Should the billing address be collected at the checkout. Defaults to false
   */
  billingAddressCollection?: boolean
  /**
   * The allowed countries
   */
  allowedCountries?: null | string[]
  shouldDisplayCart: boolean
  lastClicked: string
  currency: string
  language: string
}

export type CartReducer = Reducer<CartState>

export interface CartActions {
  /**
   * Add `count` amount of a product to the cart
   * @param product The product to add to the cart
   * @param count The quantity of the product to add
   */
  addItem: (product: Product, options?: {
    count: number
    price_metadata?: { [propName: string]: any }
    product_metadata?: { [propName: string]: any }
  }) => void

  /**
   * Remove an item from the cart by its product ID
   * @param id The product ID of the item in the cart to remove
   */
  removeItem: (id: string) => void

  /**
   * Reduce the quantity of an item in the cart by `count`
   * @param id The product ID of the item to reduce in quantity
   * @param options.count The quantity to decrease by, defaults to 1
   */
  decrementItem: (id: string, options?: { count: number }) => void

  /**
   * Increase the quantity of an item in the cart by `count`
   * @param id The product ID of the item to increase in quantity
   * @param options.count The quantity to increase by, defaults to 1
   */
  incrementItem: (id: string, options?: { count: number }) => void

  /**
   * Set the quantity of an item in the cart to a specific value
   * @param id The product ID of the item whose quantity you wish to change
   * @param quantity The quantity to set the item to
   */
  setItemQuantity: (id: string, quantity: number) => void

  /**
   * Redirects customers to the Stripe checkout. Works in both
   * CheckoutSession and ClientOnly mode.
   * @param sessionId Used in CheckoutSession mode, it is the ID of the
   *                  checkout session created by your server/serverless function.
   * @returns Nothing or an error wrapped in a promise if an error occurred
   */
  redirectToCheckout: (sessionId?: string) => Promise<undefined | Error>

  /**
   * Redirects customers to the Stripe checkout with a single product.
   * Only works in ClientOnly mode.
   * @param productId The ID of the product to buy one of.
   * @returns Nothing or an error wrapped in a promise if an error occurred
   */
  checkoutSingleItem: (productId: string) => Promise<undefined | Error>

  /**
   * Totally clears the cart of all items
   */
  clearCart: () => void

  /**
   * @param cartDetails The cart cartDetails stored somewhere (i.e. on the server).
   * @param shouldMerge Defaults to true. When false, it replaces cartDetails entirely.
   * @see CartDetails
   */
  loadCart: (cartDetails: CartDetails, shouldMerge?: boolean) => void

  /**
   * Sets `shouldDisplayCart` to `true`.
   */
  handleCartHover: () => void

  /**
   * Toggles `shouldDisplayCart` between `true` and `false`.
   */
  handleCartClick: () => void

  /**
   * Sets `shouldDisplayCart` to `false`.
   */
  handleCloseCart: () => void

  /**
   * Given a product ID, it sets `lastClicked` to that value.
   */
  storeLastClicked: (lastClicked: string) => void

  /**
   * Given a public Stripe key string, it sets `stripe` to that value.
   */
  changeStripeKey: (stripeKey: string) => void

  /**
   * Given an ISO language code (i.e. en-US), it sets `language` to that value.
   */
  changeLanguage: (language: string) => void

  /**
   * Given an ISO currency code (i.e. USD), it sets `currency` to that value.
   */
  changeCurrency: (currency: string) => void
}

export const reducer: CartReducer
export const actions: CartActions
export function filterCart(options: {
  value: number
  currency: string
  language: string
}): string

interface FormatCurrencyStringProps {
  /**
   * The value to convert (i.e. 2599 in USD is $25.99)
   */
  value: number
  /**
   * The currency format (i.e. USD, CAD, GBP)
   */
  currency: string
  /**
   * The language to be used (i.e. en-US, fr-BE)
   */
  language?: string
}

/**
 * Formats the value to a currency string
 */
export function formatCurrencyString(props: FormatCurrencyStringProps): string

/**
 * @name createShoppingCartStore
 * @param options {Config}
 * @description Utility for creating redux store
 * @returns persisted redux store
 */
export function createShoppingCartStore(options: Config): Persistor

/**
 * @name createPersistedStore
 * @param store redux store
 * @returns persisted redux store
 * @description This is for persisted stores in non-react apps
 */
export function createPersistedStore(store: Config): Persistor
