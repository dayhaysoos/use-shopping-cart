// Type definitions for use-shopping-cart

export interface ProductAttributes {
  /**
   * The name of the product
   */
  name: string
  /**
   * The description of the product
   */
  description?: string
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
   * Values that go into the price_data field
   */
  price_data?: Record<string, any>
  /**
   * Values that go into the product_metadata field
   */
  product_data?: Record<string, any>
  [extraProperties: string]: any
}

export type Product = ProductAttributes & {
  id?: string
  price_id?: string
  sku_id?: string
  sku?: string
}

export interface CartEntryAttributes extends ProductAttributes {
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
  /**
   * Currency formatted version of `price`
   */
  readonly formattedPrice: string
  /**
   * Timestamp of when entry was added to cart
   */
  readonly timestamp: string
}

export type CartEntry = { id: string } & CartEntryAttributes

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
  stripe?: string
  /**
   * The mode used for determining if you will be checking out with Stripe
   * in the client's browser only or instead by creating a checkout session
   * with your server/serverless function.
   */
  cartMode: 'checkout-session' | 'client-only'
  /**
   * The type of payment mode to be used in client-only cart mode.
   */
  mode: 'subscription' | 'payment' | 'setup'
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
  /**
   * Determines if cart data should be persisted in local storage or not
   */
  shouldPersist: boolean
}

export interface CartConfig extends Partial<CartState> {
  /**
   * String value to append after 'persist:' as the storage key when cart persistence is enabled. defaults to 'root'
   * (thus creating the full storage key 'persist:root')
   */
  persistKey?: string
  /**
   * Custom storage adapter (defaults to localStorage)
   */
  storage?: StorageAdapter
}

export interface AddItemOptions {
  /**
   * The quantity of the product to add, defaults to 1
   */
  count?: number
  /**
   * Metadata to attach to the price
   */
  price_metadata?: Record<string, any>
  /**
   * Metadata to attach to the product
   */
  product_metadata?: Record<string, any>
}

export interface IncrementOptions {
  /**
   * The quantity to increment by, defaults to 1
   */
  count?: number
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null
  setItem(key: string, value: string): Promise<void> | void
  removeItem(key: string): Promise<void> | void
}

export type SubscribeCallback = (state: Readonly<CartState>) => void
export type UnsubscribeFunction = () => void

export interface FormatCurrencyStringOptions {
  /**
   * The value to convert (e.g. 2599 in USD is $25.99)
   */
  value: number
  /**
   * The currency format (e.g. USD, CAD, GBP)
   */
  currency: string
  /**
   * The language to be used (e.g. en-US, fr-BE)
   */
  language?: string
}
