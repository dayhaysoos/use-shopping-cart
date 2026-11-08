export interface ProductAttributes {
  name: string
  description?: string
  price: number
  image?: string
  currency: string
  price_data?: Record<string, any>
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
  readonly quantity: number
  readonly value: number
  readonly formattedValue: string
  readonly formattedPrice: string
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
  count?: number
  price_metadata?: Record<string, any>
  product_metadata?: Record<string, any>
}

export interface IncrementOptions {
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
  value: number
  currency: string
  language?: string
}
