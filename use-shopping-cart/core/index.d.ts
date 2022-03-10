import { EnhancedStore, AnyAction, Reducer, Action } from '@reduxjs/toolkit'

interface CommonConfig {
  /**
   * Your public Stripe API key used for checkout.
   */
  stripe: string
  /**
   * The preferred currency, written as an ISO currency code (e.g. USD),
   * used to format price data.
   */
  currency: string
  /**
   * The language, written as an ISO language code (e.g. en-US), to be
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
  [extraProperties: string]: any
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

export type CartReducer = Reducer<CartState, CartAction>

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
  ) => AddItemAction

  /**
   * Remove an item from the cart by its product ID
   * @param id The product ID of the item in the cart to remove
   */
  removeItem: (id: string) => RemoveItemAction

  /**
   * Reduce the quantity of an item in the cart by `count`
   * @param id The product ID of the item to reduce in quantity
   * @param options.count The quantity to decrease by, defaults to 1
   */
  decrementItem: (
    id: string,
    options?: { count: number }
  ) => DecrementItemAction

  /**
   * Increase the quantity of an item in the cart by `count`
   * @param id The product ID of the item to increase in quantity
   * @param options.count The quantity to increase by, defaults to 1
   */
  incrementItem: (
    id: string,
    options?: { count: number }
  ) => IncrementItemAction

  /**
   * Set the quantity of an item in the cart to a specific value
   * @param id The product ID of the item whose quantity you wish to change
   * @param quantity The quantity to set the item to
   */
  setItemQuantity: (id: string, quantity: number) => SetItemQuantityAction

  /**
   * Redirects customers to the Stripe checkout. Works in both
   * CheckoutSession and ClientOnly mode.
   * @param sessionId Used in CheckoutSession mode, it is the ID of the
   *                  checkout session created by your server/serverless function.
   * @returns Nothing or an error wrapped in a promise if an error occurred
   */
  redirectToCheckout: (sessionId?: string) => RedirectToCheckoutAction

  /**
   * Redirects customers to the Stripe checkout with a single product.
   * Only works in ClientOnly mode.
   * @param productId The ID of the product to buy one of.
   * @returns Nothing or an error wrapped in a promise if an error occurred
   */
  checkoutSingleItem: (productId: string) => CheckoutSingleItemAction

  /**
   * Totally clears the cart of all items
   */
  clearCart: () => ClearCartAction

  /**
   * @param cartDetails The cart cartDetails stored somewhere (e.g. on the server).
   * @param shouldMerge Defaults to true. When false, it replaces cartDetails entirely.
   * @see CartDetails
   */
  loadCart: (cartDetails: CartDetails, shouldMerge?: boolean) => LoadCartAction

  /**
   * Sets `shouldDisplayCart` to `true`.
   */
  handleCartHover: () => HandleCartHoverAction

  /**
   * Toggles `shouldDisplayCart` between `true` and `false`.
   */
  handleCartClick: () => HandleCartClickAction

  /**
   * Sets `shouldDisplayCart` to `false`.
   */
  handleCloseCart: () => HandleCloseCartAction

  /**
   * Given a product ID, it sets `lastClicked` to that value.
   */
  storeLastClicked: (lastClicked: string) => StoreLastClickedAction

  /**
   * Given a public Stripe key string, it sets `stripe` to that value.
   */
  changeStripeKey: (stripeKey: string) => ChangeStripeKeyAction

  /**
   * Given an ISO language code (e.g. en-US), it sets `language` to that value.
   */
  changeLanguage: (language: string) => ChangeLanguageAction

  /**
   * Given an ISO currency code (e.g. USD), it sets `currency` to that value.
   */
  changeCurrency: (currency: string) => ChangeCurrencyAction
}

export const reducer: CartReducer
export const actions: CartActions
export function filterCart(
  cartDetails: CartDetails,
  filter: (entry: CartEntry) => Promise<boolean> | boolean
): Promise<CartDetails>

interface FormatCurrencyStringProps {
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

/**
 * Formats the value to a currency string
 */
export function formatCurrencyString(props: FormatCurrencyStringProps): string

/* Start of Cart Actions */
interface AddItemAction extends Action {
  type: 'cart/addItem'
  payload: {
    product: Product
    options: { count: number }
  }
}

interface IncrementItemAction extends Action {
  type: 'cart/incrementItem'
  payload: {
    id: string
    options: { count: number }
  }
}

interface DecrementItemAction extends Action {
  type: 'cart/decrementItem'
  payload: {
    id: string
    options: { count: number }
  }
}

interface SetItemQuantityAction extends Action {
  type: 'cart/setItemQuantity'
  payload: {
    id: string
    quantity: number
  }
}

interface RemoveItemAction extends Action {
  type: 'cart/removeItem'
  payload: {
    id: string
  }
}

interface LoadCartAction extends Action {
  type: 'cart/loadCart'
  payload: {
    cartDetails: CartDetails
    shouldMerge: boolean
  }
}

interface StoreLastClickedAction extends Action {
  type: 'cart/storeLastClicked'
  payload: CartState['lastClicked']
}

interface ChangeStripeKeyAction extends Action {
  type: 'cart/changeStripeKey'
  payload: CartState['stripe']
}

interface ChangeLanguageAction extends Action {
  type: 'cart/changeLanguage'
  payload: CartState['language']
}

interface ChangeCurrencyAction extends Action {
  type: 'cart/changeCurrency'
  payload: CartState['currency']
}

interface RedirectToCheckoutAction extends Action {
  type: 'cart/redirectToCheckout'
  payload: string
}

interface CheckoutSingleItemAction extends Action {
  type: 'cart/checkoutSingleItem'
  payload: {
    cartItems: {
      lineItems: (
        | { price: string; quantity: number }
        | { sku: string; quantity: number }
      )[]
    }
  }
}

interface ClearCartAction extends Action {
  type: 'cart/clearCart'
}

interface HandleCartHoverAction extends Action {
  type: 'cart/handleCartHover'
}

interface HandleCartClickAction extends Action {
  type: 'cart/handleCartClick'
}

interface HandleCloseCartAction extends Action {
  type: 'cart/handleCloseCart'
}

export type CartAction =
  | AddItemAction
  | IncrementItemAction
  | DecrementItemAction
  | SetItemQuantityAction
  | RemoveItemAction
  | LoadCartAction
  | StoreLastClickedAction
  | ChangeStripeKeyAction
  | ChangeLanguageAction
  | ChangeCurrencyAction
  | RedirectToCheckoutAction
  | CheckoutSingleItemAction
  | ClearCartAction
  | HandleCartHoverAction
  | HandleCartClickAction
  | HandleCloseCartAction
  | AnyAction
/* End of Cart Actions */

export type CartStore = EnhancedStore<CartState, CartAction>

/**
 * Utility for creating redux store
 * @param options
 * @returns persisted redux store
 */
export function createShoppingCartStore(options: Config): CartStore

export { persistStore as createPersistedStore } from 'redux-persist'
