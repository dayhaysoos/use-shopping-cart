import { isClient } from '../utilities/SSR'
import type {
  CartState,
  CartConfig,
  CartDetails,
  Product,
  AddItemOptions,
  IncrementOptions,
  SubscribeCallback,
  UnsubscribeFunction
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
import { toCartChange, type CartCall } from './cartCall'

const STORAGE_KEY_PREFIX = 'use-shopping-cart'

export const initialState: CartState = {
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  formattedTotalPrice: '$0.00',
  cartDetails: {}
}

export class ShoppingCart {
  private _state: CartState
  private _subscribers: Set<SubscribeCallback>
  private _persister: CartPersister | null
  private _hasBeenModified: boolean = false
  private _settingsChanged: boolean = false

  constructor(config: CartConfig = {}) {
    const {
      cartDetails = {},
      currency = initialState.currency,
      language = initialState.language
    } = config
    const state: CartState = {
      ...initialState,
      currency,
      language
    }
    this._state = withCartDetails(
      state,
      normalizeCartDetails(cartDetails, currency, language)
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

  private _run(call: CartCall): void {
    this._hasBeenModified = true
    this._apply(toCartChange(call, this._state.cartDetails))
  }

  addItem(product: Product, options: AddItemOptions = {}): void {
    this._run({ action: 'addItem', product, options })
  }

  incrementItem(id: string, options: IncrementOptions = {}): void {
    this._run({ action: 'incrementItem', id, options })
  }

  decrementItem(id: string, options: IncrementOptions = {}): void {
    this._run({ action: 'decrementItem', id, options })
  }

  setItemQuantity(id: string, quantity: number): void {
    this._run({ action: 'setItemQuantity', id, quantity })
  }

  removeItem(id: string): void {
    this._run({ action: 'removeItem', id })
  }

  clearCart(): void {
    this._run({ action: 'clearCart' })
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
}
