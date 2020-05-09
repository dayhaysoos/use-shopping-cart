declare module 'use-shopping-cart' {
  interface CommonProviderProps {
    /**
     * JSX.Element The Entry point to your app
     */
    children: JSX.Element
    /**
     * The stripe object
     */
    stripe: stripe.Stripe
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
  interface ServerCheckoutProviderProps extends CommonProviderProps {
    /**
     * Determines checkout mode
     */
    mode: 'server-checkout'
  }

  export type ProviderProps =
    | ClientOnlyProviderProps
    | ServerCheckoutProviderProps

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
     * An image of the product
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
    quantity: number
    /**
     * The total line item value, the price multiplied by the quantity
     */
    value: number
    /**
     * Currency formatted version of value
     */
    formattedValue: string
  }

  export type CartDetails = {
    [sku: string]: CartEntry
  }

  export interface ShoppingCartUtilities {
    /**
     * Add an item to the cart
     * @param product The product to add to the cart
     */
    incrementItem: (product: Product) => void
    /**
     * Remove a cart item
     * @param sku The item to remove sku
     */
    removeCartItem: (sku: string) => void
    /**
     * Reduce the quantity of items by one in the cart
     * @param sku The sku of the item to reduce quantity by one
     */
    decrementItem: (sku: string) => void
    /**
     * Calculates the total price of the cart items
     */
    totalPrice: () => string
    /**
     * The number of items in the cart
     */
    cartCount: number
    /**
     * Cart details is an object with skus of the items in the cart as keys and details of the items as the value,
     */
    cartDetails: CartDetails
    /**
     * Redirects customers to the Stripe checkout
     * @returns result object || error message
     */
    redirectToCheckout: (sessionId?: string) => Promise<undefined | Error>
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
     * The value to convert
     */
    value: number
    /**
     * The currency format. For example US
     */
    currency: string
    /**
     * The language
     */
    language: string
  }

  /**
   * Formats the the currency to a string value
   */
  export function formatCurrencyString(props: FormatCurrencyStringProps): string
}
