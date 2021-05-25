declare module 'use-shopping-cart' {
  interface CommonProviderProps {
    /**
     * Your Publishable Stripe API key
     */
    stripe: string
    /**
     * The preferred currency used to format price data
     */
    currency: string
    /**
     * The language to be used format price data
     */
    language?: string
  }

  interface ReactProviderProps extends CommonProviderProps {
    children: JSX.Element
  }
  interface ClientOnlyProviderProps extends CommonProviderProps {
    /**
     * Determines Stripe mode. Options are subscription or payment
     */
    mode: 'payment'
    /**
     * Determines cart mode. Options are client-only or checkout-session
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
    price_data: object
    /**
     * Values that go into the product_metadata field
     */
    product_data: object
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

  export interface CartOptions {
    count?: number
    price_metadata?: { [propName: string]: any }
    product_metadata?: { [propName: string]: any }
  }

  export interface ShoppingCartUtilities {
    /**
     * Add `count` amount of a product to the cart
     * @param product The product to add to the cart
     * @param count The quantity of the product to add
     */
    addItem: (product: Product, options?: CartOptions) => void
    /**
     * Remove an item from the cart by its id
     * @param id The id of the item in the cart to remove
     */
    removeItem: (id: string) => void
    /**
     * Reduce the quantity of an item in the cart by `count`
     * @param id The ID of the item to reduce in quantity
     * @param count The quantity to reduce by
     */
    decrementItem: (id: string, count?: number) => void
    /**
     * Increase the quantity of an item in the cart by `count`
     * @param id The ID of the item to increase in quantity
     * @param count The quantity to increase by
     */
    incrementItem: (id: string, count?: number) => void
    /**
     * Set the quantity of an item in the cart to a specific value
     * @param id The ID of the item to change in quantity
     * @param quantity The quantity to set the item to
     */
    setItemQuantity: (id: string, quantity: number) => void
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
     * Cart details is an object with IDs of the items in the cart as
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
     * @param options {{ id: string, quantity?: number }} only used in CheckoutSession mode
     * @returns Nothing or an error wrapped in a promise if an error occurred
     */
    checkoutSingleItem: (options: {
      id: string
      quantity?: number
    }) => Promise<undefined | Error>
    /**
     * Totally clears the cart of all items
     */
    clearCart: () => void
    /**
     * @param cartDetails cartDetails: [product.id]: {...}
     * @param shouldMerge Boolean, defaults to true. If false, it would replace cartDetails
     */
    loadCart: (cartDetails: CartDetails, shouldMerge?: Boolean) => void
  }

  /**
   * Provides several utilities and pieces of data for you to use in your application.
   */
  export function useShoppingCart(): ShoppingCartUtilities

  /**
   * Displays the values returned by `useShoppingCart()` in a table format.
   */
  export const DebugCart: React.FunctionComponent<React.DetailedHTMLProps<
    React.TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >>

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
   * Utitlity for validating that the prices are what they should be server-side
   * */
  export function validateCartItems(
    inventorySrc: [Product],
    cartDetails: CartDetails
  )
}
