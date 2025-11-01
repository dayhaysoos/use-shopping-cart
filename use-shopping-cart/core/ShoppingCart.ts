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
  StorageAdapter
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
import {
  redirectToCheckout as stripeRedirect,
  checkoutSingleItem as stripeCheckoutSingle
} from './stripe'

const STORAGE_KEY_PREFIX = 'use-shopping-cart'

export const initialState: CartState = {
  cartMode: 'checkout-session',
  mode: 'payment',
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
            if (data) this._parseAndLoadStoredData(data)
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

  private _parseAndLoadStoredData(stored: string): void {
    try {
      const parsed = JSON.parse(stored)

      // Only restore specific fields
      const { cartDetails, cartCount, totalPrice, formattedTotalPrice } = parsed

      if (cartDetails && typeof cartDetails === 'object') {
        this._state = {
          ...this._state,
          cartDetails,
          cartCount: cartCount ?? 0,
          totalPrice: totalPrice ?? 0,
          formattedTotalPrice: formattedTotalPrice ?? '$0.00'
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
        formattedTotalPrice: this._state.formattedTotalPrice
      }

      this._storage.setItem(this._persistKey, JSON.stringify(toPersist))
    } catch (error) {
      console.warn('Failed to persist cart to storage:', error)
    }
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  addItem(product: Product, options: AddItemOptions = {}): void {
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

  incrementItem(id: string, options: IncrementOptions = {}): void {
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

  decrementItem(id: string, options: IncrementOptions = {}): void {
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

  setItemQuantity(id: string, quantity: number): void {
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

  removeItem(id: string): void {
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

  clearCart(): void {
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

  loadCart(cartDetails: CartDetails, shouldMerge = true): void {
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

    this._notifySubscribers()
  }

  // ============================================================================
  // UI STATE METHODS
  // ============================================================================

  handleCartHover(): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, shouldDisplayCart: true }
    this._notifySubscribers()
  }

  handleCartClick(): void {
    // ✅ IMMUTABLE - single state update
    this._state = {
      ...this._state,
      shouldDisplayCart: !this._state.shouldDisplayCart
    }
    this._notifySubscribers()
  }

  handleCloseCart(): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, shouldDisplayCart: false }
    this._notifySubscribers()
  }

  storeLastClicked(id: string): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, lastClicked: id }
    this._notifySubscribers()
  }

  // ============================================================================
  // CONFIG METHODS
  // ============================================================================

  changeStripeKey(key: string): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, stripe: key }
    this._notifySubscribers()
  }

  changeLanguage(language: string): void {
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

  changeCurrency(currency: string): void {
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
  // NEW CONFIGURATION METHODS (Phase 6)
  // ============================================================================

  setCustomerEmail(email: string): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, customerEmail: email }
    this._notifySubscribers()
  }

  toggleAutomaticTax(enabled: boolean): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, automaticTax: enabled }
    this._notifySubscribers()
  }

  setCustomText(customText: CartState['customText']): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, customText }
    this._notifySubscribers()
  }

  setCustomFields(fields: CartState['customFields']): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, customFields: fields }
    this._notifySubscribers()
  }

  setShippingOptions(options: CartState['shippingOptions']): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, shippingOptions: options }
    this._notifySubscribers()
  }

  setUIMode(mode: 'hosted' | 'embedded'): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, uiMode: mode }
    this._notifySubscribers()
  }

  togglePhoneCollection(enabled: boolean): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, collectPhoneNumber: enabled }
    this._notifySubscribers()
  }

  togglePromotionCodes(enabled: boolean): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, allowPromotionCodes: enabled }
    this._notifySubscribers()
  }

  toggleTermsOfService(required: boolean): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, requireTermsOfService: required }
    this._notifySubscribers()
  }

  setCreateSessionEndpoint(endpoint: string): void {
    // ✅ IMMUTABLE - single state update
    this._state = { ...this._state, createSessionEndpoint: endpoint }
    this._notifySubscribers()
  }

  // ============================================================================
  // STRIPE METHODS
  // ============================================================================

  async redirectToCheckout(
    sessionId?: string
  ): Promise<{ error: any } | undefined> {
    return stripeRedirect(this._state, sessionId)
  }

  async checkoutSingleItem(
    itemOrPriceId: string | { price?: string; sku?: string; quantity?: number }
  ): Promise<{ error: any } | undefined> {
    return stripeCheckoutSingle(this._state, itemOrPriceId)
  }

  async initEmbeddedCheckout(elementSelector: string): Promise<void> {
    if (this._state.uiMode !== 'embedded') {
      throw new Error('uiMode must be "embedded" for embedded checkout')
    }

    if (!this._state.stripe) {
      throw new Error('Stripe key required')
    }

    if (!this._state.createSessionEndpoint) {
      throw new Error('createSessionEndpoint required for embedded checkout')
    }

    // Call server to create session
    const response = await fetch(this._state.createSessionEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartDetails: this._state.cartDetails,
        mode: this._state.mode
      })
    })

    if (!response.ok) {
      throw new Error(
        `Failed to create checkout session: ${response.statusText}`
      )
    }

    const { clientSecret } = await response.json()

    if (!clientSecret) {
      throw new Error('No clientSecret returned from server')
    }

    // Initialize Stripe
    if (typeof window === 'undefined') {
      throw new Error('Embedded checkout can only be initialized on the client')
    }

    // @ts-ignore - Stripe is loaded via script tag
    const stripe = window.Stripe(this._state.stripe)

    // Initialize embedded checkout
    // @ts-expect-error - initEmbeddedCheckout is available in Stripe.js but may not be in type definitions
    const checkout = await stripe.initEmbeddedCheckout({
      clientSecret
    })

    // Mount in page
    checkout.mount(elementSelector)
  }
}
