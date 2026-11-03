import { isClient } from '../utilities/SSR'
import type {
  CartState,
  CartConfig,
  CartDetails,
  Product,
  AddItemOptions,
  IncrementOptions,
  SubscribeCallback,
  UnsubscribeFunction,
  RedirectToCheckoutInput
} from './types'
import { createLocalStorage } from './storage'
import {
  createCartPersister,
  type CartPersister,
  type StoredCart
} from './persistence'
import {
  withCartDetails,
  normalizeCartDetails,
  applyCartChange,
  type CartChange
} from './cartState'
import {
  validateProduct,
  validateCount,
  validateItemExists,
  validateQuantity
} from './validation'
import { redirectToCheckout as stripeRedirect } from './stripe'

const STORAGE_KEY_PREFIX = 'use-shopping-cart'

export const initialState: CartState = {
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  formattedTotalPrice: '$0.00',
  cartDetails: {},
  shouldPersist: true
}

export class ShoppingCart {
  private _state: CartState
  private _subscribers: Set<SubscribeCallback>
  private _persister: CartPersister | null
  // Set once the user changes the cart / currency or language, so a late
  // async storage load doesn't overwrite those changes
  private _hasBeenModified: boolean = false
  private _settingsChanged: boolean = false

  constructor(config: CartConfig = {}) {
    // Initialize state; totals are always derived from cartDetails
    const state = { ...initialState, ...config }
    this._state = withCartDetails(
      state,
      normalizeCartDetails(state.cartDetails, state.currency, state.language)
    )
    this._subscribers = new Set()

    // Setup storage
    if (config.shouldPersist !== false && isClient) {
      this._persister = createCartPersister(
        config.storage ?? createLocalStorage(),
        config.persistKey ?? STORAGE_KEY_PREFIX,
        this._state
      )
      this._persister.load((stored) => this._restore(stored))
    } else {
      this._persister = null
    }
  }

  // ============================================================================
  // STATE ACCESS
  // ============================================================================

  /**
   * Get current cart state (readonly).
   * Used by useSyncExternalStore.
   */
  getState(): Readonly<CartState> {
    return this._state
  }

  /**
   * Subscribe to cart state changes.
   * Returns unsubscribe function.
   */
  subscribe(callback: SubscribeCallback): UnsubscribeFunction {
    this._subscribers.add(callback)
    return () => {
      this._subscribers.delete(callback)
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Restore a stored cart. Ignored if the cart was changed before an async
   * load finished; a currency or language set meanwhile is kept.
   */
  private _restore(stored: StoredCart): void {
    if (this._hasBeenModified) return

    if (!this._settingsChanged) {
      this._state = {
        ...this._state,
        currency: stored.currency ?? this._state.currency,
        language: stored.language ?? this._state.language
      }
    }
    // Stored values and formatting are not trusted; rebuild from price × quantity
    this._setCartDetails(
      normalizeCartDetails(
        stored.cartDetails,
        this._state.currency,
        this._state.language
      )
    )
  }

  /**
   * Replace cartDetails (recomputing totals) and notify subscribers.
   */
  private _setCartDetails(cartDetails: CartDetails): void {
    this._state = withCartDetails(this._state, cartDetails)
    this._notifySubscribers()
  }

  /**
   * Apply a change to cartDetails (shared with useOptimisticCart).
   */
  private _apply(change: CartChange): void {
    this._setCartDetails(
      applyCartChange(this._state.cartDetails, change, {
        currency: this._state.currency,
        language: this._state.language
      })
    )
  }

  /**
   * Notify all subscribers of state change.
   * Called after EVERY state update.
   */
  private _notifySubscribers(): void {
    this._subscribers.forEach((callback) => callback(this._state))
    this._persister?.save(this._state)
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  /**
   * Add `count` amount of a product to the cart
   * @param product The product to add to the cart
   * @param options.count The quantity of the product to add, defaults to 1
   */
  addItem(product: Product, options: AddItemOptions = {}): void {
    this._hasBeenModified = true
    validateProduct(product)

    const count = options.count ?? 1
    validateCount(count, 'addItem')

    this._apply({
      type: 'add',
      product,
      count,
      metadata: options
    })
  }

  /**
   * Increase the quantity of an item in the cart by `count`
   * @param id The product ID of the item to increase in quantity
   * @param options.count The quantity to increase by, defaults to 1
   */
  incrementItem(id: string, options: IncrementOptions = {}): void {
    this._hasBeenModified = true
    const count = options.count ?? 1
    validateCount(count, 'incrementItem')
    validateItemExists(id, this._state.cartDetails, 'incrementItem')

    this._apply({ type: 'adjust', id, by: count })
  }

  /**
   * Reduce the quantity of an item in the cart by `count`
   * @param id The product ID of the item to reduce in quantity
   * @param options.count The quantity to decrease by, defaults to 1
   */
  decrementItem(id: string, options: IncrementOptions = {}): void {
    this._hasBeenModified = true
    const count = options.count ?? 1
    validateCount(count, 'decrementItem')
    validateItemExists(id, this._state.cartDetails, 'decrementItem')

    // Removes the item if its quantity would reach 0 or below
    this._apply({ type: 'adjust', id, by: -count })
  }

  /**
   * Set the quantity of an item in the cart to a specific value
   * @param id The product ID of the item whose quantity you wish to change
   * @param quantity The quantity to set the item to
   */
  setItemQuantity(id: string, quantity: number): void {
    this._hasBeenModified = true
    validateQuantity(quantity, 'setItemQuantity')
    validateItemExists(id, this._state.cartDetails, 'setItemQuantity')

    // Removes the item if quantity is 0
    this._apply({ type: 'set', id, quantity })
  }

  /**
   * Remove an item from the cart by its product ID
   * @param id The product ID of the item in the cart to remove
   */
  removeItem(id: string): void {
    this._hasBeenModified = true
    validateItemExists(id, this._state.cartDetails, 'removeItem')

    this._apply({ type: 'remove', id })
  }

  /**
   * Totally clears the cart of all items
   */
  clearCart(): void {
    this._hasBeenModified = true
    this._apply({ type: 'clear' })
  }

  /**
   * Load cart details into the cart, merging with the current items by default.
   * @param cartDetails The cart cartDetails stored somewhere (e.g. on the server).
   * @param shouldMerge Defaults to true. When false, it replaces cartDetails entirely.
   * @see CartDetails
   */
  loadCart(cartDetails: CartDetails, shouldMerge = true): void {
    this._hasBeenModified = true
    const newCartDetails = shouldMerge
      ? { ...this._state.cartDetails, ...cartDetails }
      : cartDetails

    this._setCartDetails(
      normalizeCartDetails(
        newCartDetails,
        this._state.currency,
        this._state.language
      )
    )
  }

  // ============================================================================
  // UI STATE METHODS
  // ============================================================================

  /**
   * Sets `shouldDisplayCart` to `true`.
   */
  handleCartHover(): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, shouldDisplayCart: true }
    this._notifySubscribers()
  }

  /**
   * Toggles `shouldDisplayCart` between `true` and `false`.
   */
  handleCartClick(): void {
    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      shouldDisplayCart: !this._state.shouldDisplayCart
    }
    this._notifySubscribers()
  }

  /**
   * Sets `shouldDisplayCart` to `false`.
   */
  handleCloseCart(): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, shouldDisplayCart: false }
    this._notifySubscribers()
  }

  /**
   * Given a product ID, it sets `lastClicked` to that value.
   */
  storeLastClicked(id: string): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, lastClicked: id }
    this._notifySubscribers()
  }

  // ============================================================================
  // CONFIG METHODS
  // ============================================================================

  /**
   * Given a public Stripe key string, it sets `stripe` to that value.
   */
  changeStripeKey(key: string): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, stripe: key }
    this._notifySubscribers()
  }

  /**
   * Given an ISO language code (e.g. en-US), it sets `language` to that value.
   */
  changeLanguage(language: string): void {
    // Early return if language hasn't changed
    if (language === this._state.language) return

    // Reformat all prices with the new language
    this._settingsChanged = true
    this._state = { ...this._state, language }
    this._setCartDetails(
      normalizeCartDetails(
        this._state.cartDetails,
        this._state.currency,
        language
      )
    )
  }

  /**
   * Given an ISO currency code (e.g. USD), it sets `currency` to that value.
   */
  changeCurrency(currency: string): void {
    // Early return if currency hasn't changed
    if (currency === this._state.currency) return

    // Reformat all prices with the new currency
    this._settingsChanged = true
    this._state = { ...this._state, currency }
    this._setCartDetails(
      normalizeCartDetails(
        this._state.cartDetails,
        currency,
        this._state.language
      )
    )
  }

  // ============================================================================
  // STRIPE METHODS
  // ============================================================================

  /**
   * Redirects to Stripe checkout with a session URL (preferred) or session ID.
   *
   * @param input - Session URL (session.url) or a legacy session ID
   * @returns Promise that resolves when redirect starts, or an error object
   */
  async redirectToCheckout(
    input: RedirectToCheckoutInput
  ): Promise<{ error: any } | undefined> {
    return stripeRedirect(this._state, input)
  }
}
