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
  totalPrice: number
  formattedTotalPrice: string
  cartCount: number
  cartDetails: CartDetails
  currency: string
  language: string
  shouldDisplayCart: boolean
  lastClicked: string
}

export interface CartConfig {
  cartDetails?: CartDetails
  currency?: string
  language?: string
  shouldPersist?: boolean
  persistKey?: string
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
