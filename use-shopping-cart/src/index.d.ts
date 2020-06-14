declare module 'use-shopping-cart' {
  interface CommonProviderProps {
    children: JSX.Element
    /**
     * The stripe instance or a Promise that resolves with a Stripe instance
     */
    stripe:
      | import('@stripe/stripe-js').Stripe
      | Promise<import('@stripe/stripe-js').Stripe | null>
    /**
     * The preferred currency used to format price data
     */
    currency: string
    /**
     * The language to be used format price data
     */
    language?: string
  }
  interface ClientOnlyProviderProps extends CommonProviderProps {
    /**
     * Determines checkout mode
     */
    mode: 'client-only'
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
  interface CheckoutSessionProviderProps extends CommonProviderProps {
    /**
     * Determines checkout mode
     */
    mode: 'checkout-session'
  }

  export type ProviderProps =
    | ClientOnlyProviderProps
    | CheckoutSessionProviderProps

  /**
   * Context provider to interact with Stripe API
   */
  export const CartProvider: (props: ProviderProps) => JSX.Element

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
     * A unique product SKU
     */
    sku: string
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
    [sku: string]: CartEntry
  }

  export interface ShoppingCartUtilities {
    /**
     * Add `count` amount of a product to the cart
     * @param product The product to add to the cart
     * @param count The quantity of the product to add
     */
    addItem: (product: Product, count?: number) => void
    /**
     * Remove an item from the cart by its SKU
     * @param sku The SKU of the item in the cart to remove
     */
    removeItem: (sku: string) => void
    /**
     * Reduce the quantity of an item in the cart by `count`
     * @param sku The SKU of the item to reduce in quantity
     * @param count The quantity to reduce by
     */
    decrementItem: (sku: string, count?: number) => void
    /**
     * Increase the quantity of an item in the cart by `count`
     * @param sku The SKU of the item to increase in quantity
     * @param count The quantity to increase by
     */
    incrementItem: (sku: string, count?: number) => void
    /**
     * Set the quantity of an item in the cart to a specific value
     * @param sku The SKU of the item to change in quantity
     * @param quantity The quantity to set the item to
     */
    setItemQuantity: (sku: string, quantity: number) => void
    /**
     * The total price of the items in the cart
     */
    readonly totalPrice: number
    /**
     * Currency formatted version of `totalPrice`
     */
    readonly formattedTotalPrice: string
    /**
     * The number of items in the cart
     */
    readonly cartCount: number
    /**
     * Cart details is an object with SKUs of the items in the cart as
     * keys and details of the items as the value.
     */
    readonly cartDetails: CartDetails
    /**
     * Redirects customers to the Stripe checkout
     * @param options {{ sessionId: string }} only used in CheckoutSession mode
     * @returns Nothing or an error wrapped in a promise if an error occurred
     */
    redirectToCheckout: (options?: {
      sessionId: string
    }) => Promise<undefined | Error>
    /**
     * Redirects customers to the Stripe checkout
     * @param options {{ sku: string, quantity?: number }} only used in CheckoutSession mode
     * @returns Nothing or an error wrapped in a promise if an error occurred
     */
    checkoutSingleItem: (options: {
      sku: string
      quantity?: number
    }) => Promise<undefined | Error>
    /**
     * Totally clears the cart of all items
     */
    clearCart: () => void
  }

  /**
   * Provides several utilities and pieces of data for you to use in your application.
   */
  export function useShoppingCart(): ShoppingCartUtilities

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
}
