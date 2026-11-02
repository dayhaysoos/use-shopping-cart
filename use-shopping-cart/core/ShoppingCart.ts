import { isClient } from '../utilities/SSR'
import type {
  CartState,
  CartConfig,
  CartDetails,
  CartEntry,
  Product,
  AddItemOptions,
  IncrementOptions,
  SubscribeCallback,
  UnsubscribeFunction,
  StorageAdapter,
  RedirectToCheckoutInput
} from './types'
import { calculateFormattedTotalPrice } from './formatters'
import { createLocalStorage } from './storage'
import {
  getProductId,
  createCartEntry,
  addEntryToCart,
  removeEntryFromCart,
  calculateTotals
} from './Entry'
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
  private _storage: StorageAdapter | null
  private _persistKey: string
  private _hasBeenModified: boolean = false

  constructor(config: CartConfig = {}) {
    // Initialize state
    this._state = { ...initialState, ...config }
    this._subscribers = new Set()
    this._persistKey = config.persistKey ?? STORAGE_KEY_PREFIX

    // Setup storage
    if (config.shouldPersist !== false && isClient) {
      this._storage = config.storage ?? createLocalStorage()
      this._loadFromStorage()
    } else {
      this._storage = null
    }

    // Calculate initial formatted price
    this._state = {
      ...this._state,
      formattedTotalPrice: calculateFormattedTotalPrice(
        this._state.totalPrice,
        this._state.currency,
        this._state.language
      )
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
   * Notify all subscribers of state change.
   * Called after EVERY state update.
   */
  private _notifySubscribers(): void {
    this._subscribers.forEach((callback) => callback(this._state))

    if (this._storage) {
      this._persistToStorage()
    }
  }

  /**
   * Load persisted cart from storage.
   */
  private _loadFromStorage(): void {
    if (!this._storage) return

    try {
      const stored = this._storage.getItem(this._persistKey)

      // Handle async storage
      if (stored instanceof Promise) {
        stored
          .then((data) => {
            // Only load if cart hasn't been modified since initialization
            if (data && !this._hasBeenModified) {
              this._parseAndLoadStoredData(data)
            }
          })
          .catch((err) => {
            console.warn('Failed to load cart from storage:', err)
          })
        return
      }

      if (!stored) return
      this._parseAndLoadStoredData(stored)
    } catch (error) {
      console.warn('Failed to load cart from storage:', error)
    }
  }

  /**
   * Validate that a cart entry has all required fields and valid values.
   */
  private _isValidCartEntry(entry: unknown): entry is CartEntry {
    if (!entry || typeof entry !== 'object') return false

    const e = entry as Record<string, unknown>
    return (
      typeof e.id === 'string' &&
      typeof e.price === 'number' &&
      Number.isFinite(e.price) &&
      typeof e.quantity === 'number' &&
      Number.isFinite(e.quantity) &&
      Number.isInteger(e.quantity) &&
      e.quantity > 0 &&
      typeof e.value === 'number' &&
      Number.isFinite(e.value) &&
      typeof e.name === 'string' &&
      typeof e.currency === 'string'
    )
  }

  private _normalizeCartDetails(
    cartDetails: CartDetails,
    currency: string,
    language: string
  ): CartDetails {
    const normalizedCartDetails: CartDetails = {}

    for (const id in cartDetails) {
      const entry = cartDetails[id]
      const baseEntry = createCartEntry(
        id,
        entry,
        entry.quantity,
        {},
        {},
        currency,
        language
      )

      const normalizedEntry = entry.timestamp
        ? { ...baseEntry, timestamp: entry.timestamp }
        : baseEntry

      normalizedCartDetails[id] = normalizedEntry
    }

    return normalizedCartDetails
  }

  private _parseAndLoadStoredData(stored: string): void {
    try {
      const parsed = JSON.parse(stored)

      // Only restore specific fields
      const { cartDetails, currency, language } = parsed

      if (cartDetails && typeof cartDetails === 'object') {
        // Validate each cart entry before loading
        const validatedCartDetails: CartDetails = {}
        for (const id in cartDetails) {
          const entry = cartDetails[id]
          if (this._isValidCartEntry(entry)) {
            validatedCartDetails[id] = entry
          } else {
            console.warn(`Invalid cart entry "${id}" skipped during load`)
          }
        }

        const nextCurrency =
          typeof currency === 'string' && currency.length > 0
            ? currency
            : this._state.currency
        const nextLanguage =
          typeof language === 'string' && language.length > 0
            ? language
            : this._state.language

        // Recalculate totals from validated entries
        const { totalPrice, cartCount } = calculateTotals(validatedCartDetails)

        this._state = {
          ...this._state,
          currency: nextCurrency,
          language: nextLanguage,
          cartDetails: validatedCartDetails,
          cartCount,
          totalPrice,
          formattedTotalPrice: calculateFormattedTotalPrice(
            totalPrice,
            nextCurrency,
            nextLanguage
          )
        }
        // Notify subscribers so React components re-render with loaded cart data
        this._notifySubscribers()
      }
    } catch (error) {
      console.warn('Failed to parse stored cart data:', error)
    }
  }

  /**
   * Persist cart to storage.
   */
  private _persistToStorage(): void {
    if (!this._storage) return

    try {
      const toPersist = {
        cartDetails: this._state.cartDetails,
        cartCount: this._state.cartCount,
        totalPrice: this._state.totalPrice,
        formattedTotalPrice: this._state.formattedTotalPrice,
        currency: this._state.currency,
        language: this._state.language
      }

      this._storage.setItem(this._persistKey, JSON.stringify(toPersist))
    } catch (error) {
      console.warn('Failed to persist cart to storage:', error)
    }
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

    const price_metadata = options.price_metadata ?? {}
    const product_metadata = options.product_metadata ?? {}

    const id = getProductId(product)

    if (id in this._state.cartDetails) {
      // Update existing entry
      const existingEntry = this._state.cartDetails[id]
      const newQuantity = existingEntry.quantity + count

      const updatedEntry = createCartEntry(
        id,
        existingEntry,
        newQuantity,
        price_metadata,
        product_metadata,
        this._state.currency,
        this._state.language
      )

      const newCartDetails = addEntryToCart(
        this._state.cartDetails,
        updatedEntry
      )
      const { totalPrice, cartCount } = calculateTotals(newCartDetails)

      // ✅ IMMUTABLE - single state update
      this._state = {
        ...this._state,
        cartDetails: newCartDetails,
        totalPrice,
        cartCount,
        formattedTotalPrice: calculateFormattedTotalPrice(
          totalPrice,
          this._state.currency,
          this._state.language
        )
      }
    } else {
      // Create new entry
      const newEntry = createCartEntry(
        id,
        product,
        count,
        price_metadata,
        product_metadata,
        this._state.currency,
        this._state.language
      )

      const newCartDetails = addEntryToCart(this._state.cartDetails, newEntry)
      const newTotalPrice = this._state.totalPrice + newEntry.value
      const newCartCount = this._state.cartCount + count

      // ✅ IMMUTABLE - single state update
      this._state = {
        ...this._state,
        cartDetails: newCartDetails,
        totalPrice: newTotalPrice,
        cartCount: newCartCount,
        formattedTotalPrice: calculateFormattedTotalPrice(
          newTotalPrice,
          this._state.currency,
          this._state.language
        )
      }
    }

    this._notifySubscribers()
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

    const entry = this._state.cartDetails[id]
    const newQuantity = entry.quantity + count

    const updatedEntry = createCartEntry(
      id,
      entry,
      newQuantity,
      {},
      {},
      this._state.currency,
      this._state.language
    )

    const newCartDetails = addEntryToCart(this._state.cartDetails, updatedEntry)
    const newTotalPrice = this._state.totalPrice + entry.price * count
    const newCartCount = this._state.cartCount + count

    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      cartDetails: newCartDetails,
      totalPrice: newTotalPrice,
      cartCount: newCartCount,
      formattedTotalPrice: calculateFormattedTotalPrice(
        newTotalPrice,
        this._state.currency,
        this._state.language
      )
    }

    this._notifySubscribers()
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

    const entry = this._state.cartDetails[id]
    const newQuantity = entry.quantity - count

    // Remove if quantity would be <= 0
    if (newQuantity <= 0) {
      const newCartDetails = removeEntryFromCart(this._state.cartDetails, id)
      const newTotalPrice = this._state.totalPrice - entry.value
      const newCartCount = this._state.cartCount - entry.quantity

      // ✅ IMMUTABLE - single state update
      this._state = {
        ...this._state,
        cartDetails: newCartDetails,
        totalPrice: newTotalPrice,
        cartCount: newCartCount,
        formattedTotalPrice: calculateFormattedTotalPrice(
          newTotalPrice,
          this._state.currency,
          this._state.language
        )
      }
    } else {
      // Decrement quantity
      const updatedEntry = createCartEntry(
        id,
        entry,
        newQuantity,
        {},
        {},
        this._state.currency,
        this._state.language
      )

      const newCartDetails = addEntryToCart(
        this._state.cartDetails,
        updatedEntry
      )
      const newTotalPrice = this._state.totalPrice - entry.price * count
      const newCartCount = this._state.cartCount - count

      // ✅ IMMUTABLE - single state update
      this._state = {
        ...this._state,
        cartDetails: newCartDetails,
        totalPrice: newTotalPrice,
        cartCount: newCartCount,
        formattedTotalPrice: calculateFormattedTotalPrice(
          newTotalPrice,
          this._state.currency,
          this._state.language
        )
      }
    }

    this._notifySubscribers()
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

    // Remove if quantity is 0
    if (quantity === 0) {
      return this.removeItem(id)
    }

    const entry = this._state.cartDetails[id]
    const quantityDiff = quantity - entry.quantity

    const updatedEntry = createCartEntry(
      id,
      entry,
      quantity,
      {},
      {},
      this._state.currency,
      this._state.language
    )

    const newCartDetails = addEntryToCart(this._state.cartDetails, updatedEntry)
    const newTotalPrice = this._state.totalPrice + entry.price * quantityDiff
    const newCartCount = this._state.cartCount + quantityDiff

    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      cartDetails: newCartDetails,
      totalPrice: newTotalPrice,
      cartCount: newCartCount,
      formattedTotalPrice: calculateFormattedTotalPrice(
        newTotalPrice,
        this._state.currency,
        this._state.language
      )
    }

    this._notifySubscribers()
  }

  /**
   * Remove an item from the cart by its product ID
   * @param id The product ID of the item in the cart to remove
   */
  removeItem(id: string): void {
    this._hasBeenModified = true
    validateItemExists(id, this._state.cartDetails, 'removeItem')

    const entry = this._state.cartDetails[id]
    const newCartDetails = removeEntryFromCart(this._state.cartDetails, id)
    const newTotalPrice = this._state.totalPrice - entry.value
    const newCartCount = this._state.cartCount - entry.quantity

    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      cartDetails: newCartDetails,
      totalPrice: newTotalPrice,
      cartCount: newCartCount,
      formattedTotalPrice: calculateFormattedTotalPrice(
        newTotalPrice,
        this._state.currency,
        this._state.language
      )
    }

    this._notifySubscribers()
  }

  /**
   * Totally clears the cart of all items
   */
  clearCart(): void {
    this._hasBeenModified = true
    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      cartDetails: {},
      cartCount: 0,
      totalPrice: 0,
      formattedTotalPrice: calculateFormattedTotalPrice(
        0,
        this._state.currency,
        this._state.language
      )
    }

    this._notifySubscribers()
  }

  /**
   * @param cartDetails The cart cartDetails stored somewhere (e.g. on the server).
   * @param shouldMerge Defaults to true. When false, it replaces cartDetails entirely.
   * @see CartDetails
   */
  loadCart(cartDetails: CartDetails, shouldMerge = true): void {
    this._hasBeenModified = true
    let newCartDetails: CartDetails

    if (shouldMerge) {
      // Merge with existing cart
      newCartDetails = {
        ...this._state.cartDetails,
        ...cartDetails
      }
    } else {
      // Replace existing cart
      newCartDetails = { ...cartDetails }
    }

    const normalizedCartDetails = this._normalizeCartDetails(
      newCartDetails,
      this._state.currency,
      this._state.language
    )
    const { totalPrice, cartCount } = calculateTotals(normalizedCartDetails)

    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      cartDetails: normalizedCartDetails,
      totalPrice,
      cartCount,
      formattedTotalPrice: calculateFormattedTotalPrice(
        totalPrice,
        this._state.currency,
        this._state.language
      )
    }

    this._notifySubscribers()
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

    // Recalculate all formatted prices with new language
    const newCartDetails: CartDetails = {}

    for (const id in this._state.cartDetails) {
      const entry = this._state.cartDetails[id]
      newCartDetails[id] = createCartEntry(
        id,
        entry,
        entry.quantity,
        {},
        {},
        this._state.currency,
        language
      )
    }

    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      language,
      cartDetails: newCartDetails,
      formattedTotalPrice: calculateFormattedTotalPrice(
        this._state.totalPrice,
        this._state.currency,
        language
      )
    }

    this._notifySubscribers()
  }

  /**
   * Given an ISO currency code (e.g. USD), it sets `currency` to that value.
   */
  changeCurrency(currency: string): void {
    // Early return if currency hasn't changed
    if (currency === this._state.currency) return

    // Recalculate all formatted prices with new currency
    const newCartDetails: CartDetails = {}

    for (const id in this._state.cartDetails) {
      const entry = this._state.cartDetails[id]
      newCartDetails[id] = createCartEntry(
        id,
        entry,
        entry.quantity,
        {},
        {},
        currency,
        this._state.language
      )
    }

    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      currency,
      cartDetails: newCartDetails,
      formattedTotalPrice: calculateFormattedTotalPrice(
        this._state.totalPrice,
        currency,
        this._state.language
      )
    }

    this._notifySubscribers()
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
