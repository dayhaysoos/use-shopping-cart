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
  private _hasBeenModified: boolean = false
  private _settingsChanged: boolean = false

  constructor(config: CartConfig = {}) {
    const state = { ...initialState, ...config }
    this._state = withCartDetails(
      state,
      normalizeCartDetails(state.cartDetails, state.currency, state.language)
    )
    this._subscribers = new Set()

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

  getState(): Readonly<CartState> {
    return this._state
  }

  subscribe(callback: SubscribeCallback): UnsubscribeFunction {
    this._subscribers.add(callback)
    return () => {
      this._subscribers.delete(callback)
    }
  }

  private _restore(stored: StoredCart): void {
    if (this._hasBeenModified) return

    if (!this._settingsChanged) {
      this._state = {
        ...this._state,
        currency: stored.currency ?? this._state.currency,
        language: stored.language ?? this._state.language
      }
    }
    this._setCartDetails(
      normalizeCartDetails(
        stored.cartDetails,
        this._state.currency,
        this._state.language
      )
    )
  }

  private _setCartDetails(cartDetails: CartDetails): void {
    this._state = withCartDetails(this._state, cartDetails)
    this._notifySubscribers()
  }

  private _apply(change: CartChange): void {
    this._setCartDetails(
      applyCartChange(this._state.cartDetails, change, this._state)
    )
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach((callback) => callback(this._state))
    this._persister?.save(this._state)
  }

  addItem(product: Product, options: AddItemOptions = {}): void {
    this._hasBeenModified = true
    validateProduct(product)

    const count = options.count ?? 1
    validateCount(count, 'addItem')

    this._apply({ type: 'add', product, count, metadata: options })
  }

  incrementItem(id: string, options: IncrementOptions = {}): void {
    this._hasBeenModified = true
    const count = options.count ?? 1
    validateCount(count, 'incrementItem')
    validateItemExists(id, this._state.cartDetails, 'incrementItem')

    this._apply({ type: 'adjust', id, by: count })
  }

  decrementItem(id: string, options: IncrementOptions = {}): void {
    this._hasBeenModified = true
    const count = options.count ?? 1
    validateCount(count, 'decrementItem')
    validateItemExists(id, this._state.cartDetails, 'decrementItem')

    this._apply({ type: 'adjust', id, by: -count })
  }

  setItemQuantity(id: string, quantity: number): void {
    this._hasBeenModified = true
    validateQuantity(quantity, 'setItemQuantity')
    validateItemExists(id, this._state.cartDetails, 'setItemQuantity')

    this._apply({ type: 'set', id, quantity })
  }

  removeItem(id: string): void {
    this._hasBeenModified = true
    validateItemExists(id, this._state.cartDetails, 'removeItem')

    this._apply({ type: 'remove', id })
  }

  clearCart(): void {
    this._hasBeenModified = true
    this._apply({ type: 'clear' })
  }

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

  handleCartHover(): void {
    this._state = { ...this._state, shouldDisplayCart: true }
    this._notifySubscribers()
  }

  handleCartClick(): void {
    this._state = {
      ...this._state,
      shouldDisplayCart: !this._state.shouldDisplayCart
    }
    this._notifySubscribers()
  }

  handleCloseCart(): void {
    this._state = { ...this._state, shouldDisplayCart: false }
    this._notifySubscribers()
  }

  storeLastClicked(id: string): void {
    this._state = { ...this._state, lastClicked: id }
    this._notifySubscribers()
  }

  changeStripeKey(key: string): void {
    this._state = { ...this._state, stripe: key }
    this._notifySubscribers()
  }

  changeLanguage(language: string): void {
    if (language === this._state.language) return

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

  changeCurrency(currency: string): void {
    if (currency === this._state.currency) return

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

  async redirectToCheckout(
    input: RedirectToCheckoutInput
  ): Promise<{ error: any } | undefined> {
    return stripeRedirect(this._state, input)
  }
}
