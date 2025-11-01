# Redux Removal Plan - TypeScript ShoppingCart Class

## Overview

Replace Redux Toolkit + Redux Persist with a standalone TypeScript `ShoppingCart` class that uses the pub/sub pattern for state management. React integration via `useSyncExternalStore`.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ShoppingCart Class (TS)                   │
│  - Immutable state updates                                   │
│  - Pub/sub for subscriptions                                 │
│  - Storage persistence                                       │
│  - Validation logic                                          │
│  - Stripe integration                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          React Integration (useSyncExternalStore)            │
│  - CartProvider (Context with class instance)                │
│  - useShoppingCart (subscribe + getState)                    │
│  - useOptimisticCart (wraps class methods)                   │
│  - useCartActions (React 19 form actions)                    │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

**Co-located Tests** (like React's codebase - tests live next to source files):

```
use-shopping-cart/core/
├── ShoppingCart.ts          # NEW - Main class implementation
├── ShoppingCart.test.ts     # NEW - Co-located tests (port from slice.test.js)
├── types.ts                 # NEW - Extract types from index.d.ts
├── validation.ts            # NEW - Input validation (from warnings middleware)
├── validation.test.ts       # NEW - Co-located tests
├── stripe.ts                # NEW - Stripe integration (from stripe middleware)
├── stripe.test.ts           # NEW - Co-located tests
├── Entry.ts                 # CONVERT - Entry.js → TypeScript
├── Entry.test.ts            # NEW - Co-located tests
├── formatters.ts            # NEW - Extract formatting logic
├── formatters.test.ts       # NEW - Co-located tests
├── storage.ts               # NEW - Storage adapters
├── storage.test.ts          # NEW - Co-located tests
├── index.ts                 # REPLACE - New entry point
├── index.d.ts               # UPDATE - Export new types
└── [DELETE]
    ├── slice.js
    ├── slice.test.js
    ├── index.js
    ├── index.test.js
    ├── __tests__/           # Remove this directory
    └── middleware/
        ├── stripe.js
        ├── warnings.js
        └── helpers.js

use-shopping-cart/react/
├── CartProvider.tsx         # NEW
├── CartProvider.test.tsx    # NEW - Co-located tests
├── useShoppingCart.ts       # NEW
├── useShoppingCart.test.ts  # NEW - Co-located tests
├── useOptimisticCart.js     # UPDATE - existing file
├── useOptimisticCart.test.js # KEEP - co-located
├── useCartActions.js        # KEEP - existing file
├── useCartActions.test.js   # KEEP - already co-located
├── index.ts                 # UPDATE - new exports
└── [DELETE]
    ├── __tests__/           # Remove this directory
    └── test/                # Remove this directory
```

**Benefits of Co-location:**
- Tests are immediately visible next to source
- Easy to find and update tests when changing code
- Clear 1:1 mapping between modules and test files
- Matches React's testing philosophy
- Encourages writing tests (they're right there!)

## Step-by-Step Implementation

### Phase 1: TypeScript Types & Utilities

#### 1.1 Create `core/types.ts`

Extract and consolidate types from `index.d.ts`:

```typescript
// use-shopping-cart/core/types.ts

export interface ProductAttributes {
  name: string
  description?: string
  price: number
  image?: string
  currency: string
  price_data?: Record<string, any>
  product_data?: Record<string, any>
}

export type Product = {
  id?: string
  price_id?: string
  sku_id?: string
  sku?: string
} & ProductAttributes

export interface CartEntry extends ProductAttributes {
  id: string
  quantity: number
  value: number
  formattedValue: string
  formattedPrice: string
  timestamp: string
}

export type CartDetails = {
  [productId: string]: CartEntry
}

export interface CartState {
  cartMode: 'checkout-session' | 'client-only'
  mode: 'payment' | 'setup' | 'subscription'
  currency: string
  language: string
  lastClicked: string
  shouldDisplayCart: boolean
  cartCount: number
  totalPrice: number
  formattedTotalPrice: string
  cartDetails: CartDetails
  stripe?: string
  successUrl?: string
  cancelUrl?: string
  billingAddressCollection?: boolean
  allowedCountries?: string[]
  shouldPersist: boolean
}

export interface CartConfig extends Partial<CartState> {
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
```

**Verify (types don't need runtime tests, just compile check):**
```bash
cd use-shopping-cart && pnpm tsc --noEmit core/types.ts
```

---

#### 1.2 Create `core/formatters.ts`

Extract formatting logic from `Entry.js`:

```typescript
// use-shopping-cart/core/formatters.ts

import { isClient } from '../utilities/SSR'

export interface FormatCurrencyOptions {
  value: number
  currency: string
  language?: string
}

export function formatCurrencyString({
  value,
  currency,
  language = isClient ? navigator.language : 'en-US'
}: FormatCurrencyOptions): string {
  const numberFormat = new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  })
  
  const parts = numberFormat.formatToParts(value)
  let zeroDecimalCurrency = true

  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
      break
    }
  }

  const adjustedValue = zeroDecimalCurrency 
    ? value 
    : parseFloat((value / 100).toFixed(2))
    
  return numberFormat.format(adjustedValue)
}

export function calculateFormattedTotalPrice(
  totalPrice: number,
  currency: string,
  language: string
): string {
  return formatCurrencyString({ value: totalPrice, currency, language })
}
```

**Test (co-located):**
```typescript
// use-shopping-cart/core/formatters.test.ts
import { formatCurrencyString } from './formatters'

describe('formatCurrencyString', () => {
  it('formats USD correctly', () => {
    expect(formatCurrencyString({ value: 1000, currency: 'USD' }))
      .toBe('$10.00')
  })
  
  it('formats zero-decimal currency correctly', () => {
    expect(formatCurrencyString({ value: 1000, currency: 'JPY' }))
      .toBe('¥1,000')
  })
})
```

**Run:**
```bash
cd use-shopping-cart && pnpm test formatters.test.ts
```

---

#### 1.3 Create `core/validation.ts`

Port validation from `warnings` middleware:

```typescript
// use-shopping-cart/core/validation.ts

import { CartDetails } from './types'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateCount(count: unknown, actionName: string): void {
  if (typeof count !== 'number') {
    const error = `Invalid count in ${actionName}: must be number, got ${typeof count}`
    console.warn(error)
    throw new ValidationError(error)
  }
  
  if (count <= 0) {
    const error = `Invalid count in ${actionName}: must be > 0, got ${count}`
    console.warn(error)
    throw new ValidationError(error)
  }
}

export function validateQuantity(quantity: unknown, actionName: string): void {
  if (typeof quantity !== 'number') {
    const error = `Invalid quantity in ${actionName}: must be number, got ${typeof quantity}`
    console.warn(error)
    throw new ValidationError(error)
  }
  
  if (quantity < 0) {
    const error = `Invalid quantity in ${actionName}: must be >= 0, got ${quantity}`
    console.warn(error)
    throw new ValidationError(error)
  }
}

export function validateItemExists(
  id: string,
  cartDetails: CartDetails,
  actionName: string
): void {
  if (!(id in cartDetails)) {
    const error = `Invalid ID in ${actionName}: item "${id}" not in cart`
    console.warn(error)
    throw new ValidationError(error)
  }
}

export function validateProduct(product: unknown): void {
  if (!product || typeof product !== 'object') {
    throw new ValidationError('Product must be an object')
  }
  
  const p = product as any
  
  if (typeof p.price !== 'number') {
    throw new ValidationError('Product.price must be a number')
  }
  
  if (!p.currency || typeof p.currency !== 'string') {
    throw new ValidationError('Product.currency must be a string')
  }
}
```

**Test (co-located):**
```typescript
// use-shopping-cart/core/validation.test.ts
import { validateCount, ValidationError } from './validation'

describe('validateCount', () => {
  it('throws on non-number', () => {
    expect(() => validateCount('5', 'addItem'))
      .toThrow(ValidationError)
  })
  
  it('throws on negative', () => {
    expect(() => validateCount(-1, 'addItem'))
      .toThrow(ValidationError)
  })
  
  it('accepts valid count', () => {
    expect(() => validateCount(5, 'addItem')).not.toThrow()
  })
})
```

**Run:**
```bash
cd use-shopping-cart && pnpm test validation.test.ts
```

---

#### 1.4 Create `core/storage.ts`

Storage adapter implementations:

```typescript
// use-shopping-cart/core/storage.ts

import { StorageAdapter } from './types'

export function createLocalStorage(): StorageAdapter {
  return {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key)
  }
}

export function createNoopStorage(): StorageAdapter {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
}

export function createMemoryStorage(): StorageAdapter {
  const store = new Map<string, string>()
  
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) }
  }
}
```

---

### Phase 2: Entry Management

#### 2.1 Create `core/Entry.ts`

Convert `Entry.js` to TypeScript with immutable helpers:

```typescript
// use-shopping-cart/core/Entry.ts

import { formatISO } from 'date-fns'
import { Product, CartEntry, CartDetails, CartState } from './types'
import { formatCurrencyString } from './formatters'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getProductId(product: Product): string {
  return (
    product.id ||
    product.price_id ||
    product.sku_id ||
    product.sku ||
    generateUUID()
  )
}

export function createCartEntry(
  id: string,
  product: Product,
  quantity: number,
  price_metadata: Record<string, any> = {},
  product_metadata: Record<string, any> = {},
  currency: string,
  language: string
): CartEntry {
  const value = product.price * quantity
  
  return {
    ...product,
    id,
    quantity,
    value,
    formattedValue: formatCurrencyString({ value, currency, language }),
    formattedPrice: formatCurrencyString({ 
      value: product.price, 
      currency, 
      language 
    }),
    timestamp: formatISO(new Date()),
    price_data: {
      ...product.price_data,
      ...price_metadata
    },
    product_data: {
      ...product.product_data,
      ...product_metadata
    }
  }
}

/**
 * Immutably add an entry to cartDetails.
 * Returns new cartDetails object.
 */
export function addEntryToCart(
  cartDetails: CartDetails,
  entry: CartEntry
): CartDetails {
  return {
    ...cartDetails,
    [entry.id]: entry
  }
}

/**
 * Immutably remove an entry from cartDetails.
 * Returns new cartDetails object.
 */
export function removeEntryFromCart(
  cartDetails: CartDetails,
  id: string
): CartDetails {
  const { [id]: removed, ...rest } = cartDetails
  return rest
}

/**
 * Calculate total values from cartDetails.
 */
export function calculateTotals(cartDetails: CartDetails) {
  let totalPrice = 0
  let cartCount = 0
  
  for (const id in cartDetails) {
    const entry = cartDetails[id]
    totalPrice += entry.value
    cartCount += entry.quantity
  }
  
  return { totalPrice, cartCount }
}
```

**Test (co-located):**
```typescript
// use-shopping-cart/core/Entry.test.ts
import { createCartEntry, calculateTotals } from './Entry'

describe('createCartEntry', () => {
  it('creates valid cart entry', () => {
    const product = {
      id: 'test',
      name: 'Test',
      price: 100,
      currency: 'USD'
    }
    
    const entry = createCartEntry('test', product, 2, {}, {}, 'USD', 'en-US')
    
    expect(entry.id).toBe('test')
    expect(entry.quantity).toBe(2)
    expect(entry.value).toBe(200)
    expect(entry.formattedValue).toBe('$2.00')
  })
})
```

**Run:**
```bash
cd use-shopping-cart && pnpm test Entry.test.ts
```

---

### Phase 3: ShoppingCart Class Core

#### 3.1 Create `core/ShoppingCart.ts` - Part 1 (Structure)

```typescript
// use-shopping-cart/core/ShoppingCart.ts

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
import {
  getProductId,
  createCartEntry,
  addEntryToCart,
  removeEntryFromCart,
  calculateTotals
} from './Entry'
import { calculateFormattedTotalPrice } from './formatters'
import { 
  validateCount, 
  validateQuantity, 
  validateItemExists,
  validateProduct 
} from './validation'
import { createLocalStorage, createNoopStorage } from './storage'

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
    this._state.formattedTotalPrice = calculateFormattedTotalPrice(
      this._state.totalPrice,
      this._state.currency,
      this._state.language
    )
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
      if (!stored) return
      
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
      }
    } catch (error) {
      console.warn('Failed to load cart from storage:', error)
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
  // CART OPERATIONS (to be implemented in Part 2)
  // ============================================================================

  addItem(product: Product, options: AddItemOptions = {}): void {
    // TODO: Implement
  }

  incrementItem(id: string, options: IncrementOptions = {}): void {
    // TODO: Implement
  }

  decrementItem(id: string, options: IncrementOptions = {}): void {
    // TODO: Implement
  }

  setItemQuantity(id: string, quantity: number): void {
    // TODO: Implement
  }

  removeItem(id: string): void {
    // TODO: Implement
  }

  clearCart(): void {
    // TODO: Implement
  }

  loadCart(cartDetails: CartDetails, shouldMerge = true): void {
    // TODO: Implement
  }

  // UI state methods
  handleCartHover(): void {
    // TODO: Implement
  }

  handleCartClick(): void {
    // TODO: Implement
  }

  handleCloseCart(): void {
    // TODO: Implement
  }

  storeLastClicked(id: string): void {
    // TODO: Implement
  }

  // Config methods
  changeStripeKey(key: string): void {
    // TODO: Implement
  }

  changeLanguage(language: string): void {
    // TODO: Implement
  }

  changeCurrency(currency: string): void {
    // TODO: Implement
  }
}
```

**Test basic structure (co-located):**
```typescript
// use-shopping-cart/core/ShoppingCart.test.ts
import { ShoppingCart, initialState } from './ShoppingCart'

describe('ShoppingCart', () => {
  describe('constructor', () => {
    it('initializes with default state', () => {
      const cart = new ShoppingCart()
      expect(cart.getState()).toMatchObject(initialState)
    })

    it('merges config with initial state', () => {
      const cart = new ShoppingCart({ 
        currency: 'EUR',
        mode: 'subscription' 
      })
      
      const state = cart.getState()
      expect(state.currency).toBe('EUR')
      expect(state.mode).toBe('subscription')
    })
  })

  describe('subscribe', () => {
    it('calls subscriber on state change', () => {
      const cart = new ShoppingCart()
      const callback = jest.fn()
      
      cart.subscribe(callback)
      
      // Will test when we implement methods
    })

    it('unsubscribe works', () => {
      const cart = new ShoppingCart()
      const callback = jest.fn()
      
      const unsubscribe = cart.subscribe(callback)
      unsubscribe()
      
      // Callback should not be called after unsubscribe
    })
  })
})
```

**Run:**
```bash
cd use-shopping-cart && pnpm test ShoppingCart.test.ts
```

---

### Phase 4: Implement Cart Methods (Test-Driven)

For EACH method below, follow this process:
1. Port tests from `slice.test.js`
2. Implement method with **immutable state updates**
3. Run tests - all must pass before moving to next method
4. Commit

#### 4.1 Implement `addItem()`

```typescript
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
    
    const newCartDetails = addEntryToCart(this._state.cartDetails, updatedEntry)
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
```

**Tests (port from slice.test.js):**
```typescript
describe('addItem', () => {
  it('adds an entry to the cart', () => {
    const cart = new ShoppingCart()
    const product = {
      id: 'test-123',
      name: 'Test Product',
      price: 100,
      currency: 'USD'
    }
    
    cart.addItem(product)
    
    const state = cart.getState()
    expect(state.cartDetails['test-123']).toMatchObject(product)
    expect(state.totalPrice).toBe(100)
    expect(state.cartCount).toBe(1)
  })

  it('retains entries when adding to cart with existing products', () => {
    // Port test from slice.test.js
  })

  it('attaches price_metadata to the cart entry', () => {
    // Port test from slice.test.js
  })

  it('attaches product_metadata to the cart entry', () => {
    // Port test from slice.test.js
  })

  it('updates cart entry when adding same product again', () => {
    // Port test from slice.test.js
  })
})
```

**Run:**
```bash
cd use-shopping-cart && pnpm test ShoppingCart.test.ts
```

All `addItem` tests MUST pass before continuing.

---

#### 4.2 Implement `incrementItem()`

```typescript
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
  const newTotalPrice = this._state.totalPrice + (entry.price * count)
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
```

**Port tests from slice.test.js, make them all pass.**

---

#### 4.3 Implement `decrementItem()`

```typescript
decrementItem(id: string, options: IncrementOptions = {}): void {
  const count = options.count ?? 1
  validateCount(count, 'decrementItem')
  validateItemExists(id, this._state.cartDetails, 'decrementItem')
  
  const entry = this._state.cartDetails[id]
  const newQuantity = entry.quantity - count
  
  // Remove if quantity would be <= 0
  if (newQuantity <= 0) {
    return this.removeItem(id)
  }
  
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
  const newTotalPrice = this._state.totalPrice - (entry.price * count)
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
  
  this._notifySubscribers()
}
```

**Port tests from slice.test.js, make them all pass.**

---

#### 4.4 Implement remaining methods

Continue pattern for:
- `setItemQuantity(id, quantity)`
- `removeItem(id)`
- `clearCart()`
- `loadCart(cartDetails, shouldMerge)`
- `handleCartHover()`
- `handleCartClick()`
- `handleCloseCart()`
- `storeLastClicked(id)`
- `changeStripeKey(key)`
- `changeLanguage(language)` - must recalculate all formatted prices
- `changeCurrency(currency)` - must recalculate all formatted prices

Each follows same pattern:
1. Validate inputs
2. Calculate new values
3. **Single immutable state update** `this._state = { ...this._state, changes }`
4. `this._notifySubscribers()`

---

### Phase 5: Stripe Integration

#### 5.1 Create `core/stripe.ts`

```typescript
// use-shopping-cart/core/stripe.ts

import type { CartState } from './types'

export interface CheckoutData {
  mode: 'payment' | 'setup' | 'subscription'
  lineItems: Array<{ price: string; quantity: number }>
  successUrl: string
  cancelUrl: string
  billingAddressCollection?: 'auto' | 'required'
  shippingAddressCollection?: { allowedCountries: string[] }
  submitType?: 'auto' | 'pay' | 'book' | 'donate'
}

export function getCheckoutData(state: CartState): CheckoutData {
  const lineItems = []
  
  for (const sku in state.cartDetails) {
    lineItems.push({ 
      price: sku, 
      quantity: state.cartDetails[sku].quantity 
    })
  }

  const options: CheckoutData = {
    mode: state.mode,
    lineItems,
    successUrl: state.successUrl!,
    cancelUrl: state.cancelUrl!,
    submitType: 'auto'
  }

  if (state.billingAddressCollection) {
    options.billingAddressCollection = 'required'
  }

  if (state.allowedCountries?.length) {
    options.shippingAddressCollection = {
      allowedCountries: state.allowedCountries
    }
  }

  return options
}

function initializeStripe(publicKey: string) {
  if (typeof window === 'undefined') {
    throw new Error('Stripe can only be initialized on client')
  }
  
  // @ts-ignore - Stripe is loaded via script tag
  const stripe = window.Stripe(publicKey)
  
  stripe.registerAppInfo({
    name: 'use-shopping-cart',
    version: process.env.__buildVersion__,
    url: 'https://useshoppingcart.com',
    partner_id: 'pp_partner_H8MLmI3e9Oc3IK'
  })
  
  return stripe
}

export async function redirectToCheckout(
  state: CartState,
  sessionId?: string
): Promise<void> {
  if (!state.stripe) {
    throw new Error('Stripe public key not configured')
  }
  
  const stripe = initializeStripe(state.stripe)
  
  if (state.cartMode === 'checkout-session') {
    if (!sessionId) {
      throw new Error('sessionId required for checkout-session mode')
    }
    return stripe.redirectToCheckout({ sessionId })
  } else if (state.cartMode === 'client-only') {
    const checkoutData = getCheckoutData(state)
    return stripe.redirectToCheckout(checkoutData)
  } else {
    throw new Error(`Invalid cartMode: ${state.cartMode}`)
  }
}

export async function checkoutSingleItem(
  state: CartState,
  itemOrPriceId: string | { price?: string; sku?: string; quantity?: number }
): Promise<void> {
  if (!state.stripe) {
    throw new Error('Stripe public key not configured')
  }
  
  if (state.cartMode !== 'client-only') {
    throw new Error('checkoutSingleItem only works in client-only mode')
  }
  
  const stripe = initializeStripe(state.stripe)
  const quantity = typeof itemOrPriceId === 'object' ? itemOrPriceId.quantity ?? 1 : 1

  let checkoutData: any = {
    mode: state.mode,
    successUrl: state.successUrl,
    cancelUrl: state.cancelUrl
  }

  if (typeof itemOrPriceId === 'string') {
    checkoutData.lineItems = [{ price: itemOrPriceId, quantity }]
  } else if (itemOrPriceId.price) {
    checkoutData.lineItems = [{ price: itemOrPriceId.price, quantity }]
  } else if (itemOrPriceId.sku) {
    checkoutData.items = [{ sku: itemOrPriceId.sku, quantity }]
  }

  return stripe.redirectToCheckout(checkoutData)
}
```

#### 5.2 Add Stripe methods to ShoppingCart class

```typescript
// In ShoppingCart.ts, add:

import { redirectToCheckout as stripeRedirect, checkoutSingleItem as stripeCheckoutSingle } from './stripe'

// Add to ShoppingCart class:

async redirectToCheckout(sessionId?: string): Promise<void> {
  return stripeRedirect(this._state, sessionId)
}

async checkoutSingleItem(
  itemOrPriceId: string | { price?: string; sku?: string; quantity?: number }
): Promise<void> {
  return stripeCheckoutSingle(this._state, itemOrPriceId)
}
```

---

### Phase 6: React Integration

#### 6.1 Create `react/CartProvider.tsx`

**Implementation:**
```typescript
// use-shopping-cart/react/CartProvider.tsx

'use client'

import * as React from 'react'
import { ShoppingCart } from '../core/ShoppingCart'
import type { CartConfig } from '../core/types'

const CartContext = React.createContext<ShoppingCart | null>(null)

export interface CartProviderProps extends CartConfig {
  children: React.ReactNode
  loading?: React.ReactNode
}

export function CartProvider({ 
  children, 
  loading = null, 
  ...config 
}: CartProviderProps) {
  const cartRef = React.useRef<ShoppingCart>()
  
  if (!cartRef.current) {
    cartRef.current = new ShoppingCart(config)
  }
  
  // Server-side rendering guard
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (config.shouldPersist && !isClient) {
    return <>{loading}</>
  }
  
  return (
    <CartContext.Provider value={cartRef.current}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext(): ShoppingCart {
  const cart = React.useContext(CartContext)
  
  if (!cart) {
    throw new Error('useCartContext must be used within CartProvider')
  }
  
  return cart
}
```

**Test (co-located):**
```typescript
// use-shopping-cart/react/CartProvider.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CartProvider, useCartContext } from './CartProvider'

describe('CartProvider', () => {
  it('provides ShoppingCart instance to children', () => {
    function TestComponent() {
      const cart = useCartContext()
      return <div>{cart ? 'has cart' : 'no cart'}</div>
    }
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    )
    
    expect(screen.getByText('has cart')).toBeInTheDocument()
  })
  
  it('throws when used outside provider', () => {
    function TestComponent() {
      useCartContext()
      return null
    }
    
    expect(() => render(<TestComponent />)).toThrow(
      'useCartContext must be used within CartProvider'
    )
  })
})
```

#### 6.2 Create `react/useShoppingCart.ts`

```typescript
// use-shopping-cart/react/useShoppingCart.ts

'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { useCartContext } from './CartProvider'
import type { CartState } from '../core/types'

export interface UseShoppingCartReturn extends CartState {
  addItem: typeof ShoppingCart.prototype.addItem
  incrementItem: typeof ShoppingCart.prototype.incrementItem
  decrementItem: typeof ShoppingCart.prototype.decrementItem
  setItemQuantity: typeof ShoppingCart.prototype.setItemQuantity
  removeItem: typeof ShoppingCart.prototype.removeItem
  clearCart: typeof ShoppingCart.prototype.clearCart
  loadCart: typeof ShoppingCart.prototype.loadCart
  handleCartHover: typeof ShoppingCart.prototype.handleCartHover
  handleCartClick: typeof ShoppingCart.prototype.handleCartClick
  handleCloseCart: typeof ShoppingCart.prototype.handleCloseCart
  storeLastClicked: typeof ShoppingCart.prototype.storeLastClicked
  changeStripeKey: typeof ShoppingCart.prototype.changeStripeKey
  changeLanguage: typeof ShoppingCart.prototype.changeLanguage
  changeCurrency: typeof ShoppingCart.prototype.changeCurrency
  redirectToCheckout: typeof ShoppingCart.prototype.redirectToCheckout
  checkoutSingleItem: typeof ShoppingCart.prototype.checkoutSingleItem
}

export function useShoppingCart<T = CartState>(
  selector?: (state: CartState) => T
): T & Omit<UseShoppingCartReturn, keyof CartState> {
  const cart = useCartContext()
  
  // Subscribe to cart state with useSyncExternalStore
  const state = useSyncExternalStore(
    (callback) => cart.subscribe(callback),
    () => {
      const currentState = cart.getState()
      return selector ? selector(currentState) : currentState
    }
  )
  
  // Memoize methods to prevent re-creating on every render
  const methods = useMemo(() => ({
    addItem: cart.addItem.bind(cart),
    incrementItem: cart.incrementItem.bind(cart),
    decrementItem: cart.decrementItem.bind(cart),
    setItemQuantity: cart.setItemQuantity.bind(cart),
    removeItem: cart.removeItem.bind(cart),
    clearCart: cart.clearCart.bind(cart),
    loadCart: cart.loadCart.bind(cart),
    handleCartHover: cart.handleCartHover.bind(cart),
    handleCartClick: cart.handleCartClick.bind(cart),
    handleCloseCart: cart.handleCloseCart.bind(cart),
    storeLastClicked: cart.storeLastClicked.bind(cart),
    changeStripeKey: cart.changeStripeKey.bind(cart),
    changeLanguage: cart.changeLanguage.bind(cart),
    changeCurrency: cart.changeCurrency.bind(cart),
    redirectToCheckout: cart.redirectToCheckout.bind(cart),
    checkoutSingleItem: cart.checkoutSingleItem.bind(cart)
  }), [cart])
  
  return { ...state, ...methods } as any
}
```

**Test (co-located):**
```typescript
// use-shopping-cart/react/useShoppingCart.test.tsx
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { CartProvider } from './CartProvider'
import { useShoppingCart } from './useShoppingCart'

describe('useShoppingCart', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  )
  
  it('returns cart state and methods', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })
    
    expect(result.current).toHaveProperty('cartCount')
    expect(result.current).toHaveProperty('addItem')
    expect(result.current).toHaveProperty('removeItem')
  })
  
  it('updates when cart state changes', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })
    
    act(() => {
      result.current.addItem({
        id: 'test',
        name: 'Test',
        price: 100,
        currency: 'USD'
      })
    })
    
    expect(result.current.cartCount).toBe(1)
  })
  
  it('supports custom selector', () => {
    const { result } = renderHook(
      () => useShoppingCart(state => state.cartCount),
      { wrapper }
    )
    
    expect(typeof result.current).toBe('number')
  })
})
```

#### 6.3 Update `react/useOptimisticCart.js`

Keep existing file, just update to use new hooks:
```typescript
// Change imports:
import { useShoppingCart } from './useShoppingCart'
// Rest stays the same
```

#### 6.4 Update `react/useCartActions.js`

Keep existing file, just update to use new hooks:
```typescript
// Change imports:
import { useShoppingCart } from './useShoppingCart'
// Rest stays the same
```

---

### Phase 7: Migration & Cleanup

#### 7.1 Update exports

```typescript
// use-shopping-cart/core/index.ts
export { ShoppingCart, initialState } from './ShoppingCart'
export { formatCurrencyString } from './formatters'
export { createLocalStorage, createNoopStorage, createMemoryStorage } from './storage'
export * from './types'

// use-shopping-cart/react/index.ts
export { CartProvider } from './CartProvider'
export { useShoppingCart } from './useShoppingCart'
export { useOptimisticCart } from './useOptimisticCart'
export { useCartActions } from './useCartActions'
export { formatCurrencyString } from '../core/formatters'
```

#### 7.2 Delete Redux files & old test directories

```bash
# Delete Redux implementation
rm use-shopping-cart/core/slice.js
rm use-shopping-cart/core/slice.test.js
rm use-shopping-cart/core/index.js
rm use-shopping-cart/core/index.test.js
rm -rf use-shopping-cart/core/middleware

# Delete old test directories (tests now co-located)
rm -rf use-shopping-cart/core/__tests__
rm -rf use-shopping-cart/react/__tests__
rm -rf use-shopping-cart/react/test
```

#### 7.3 Update package.json

Remove dependencies:
```json
{
  "dependencies": {
    // DELETE these:
    "@reduxjs/toolkit": "...",
    "react-redux": "...",
    "redux": "...",
    "redux-persist": "..."
  }
}
```

---

## Testing Strategy

### Test Execution Order

All tests are **co-located** with source files (like React's codebase).

1. **Unit tests** - Each utility in isolation (run after creating each file)
   - `core/formatters.test.ts` (next to `formatters.ts`)
   - `core/validation.test.ts` (next to `validation.ts`)
   - `core/Entry.test.ts` (next to `Entry.ts`)
   - `core/storage.test.ts` (next to `storage.ts`)

2. **Class tests** - ShoppingCart methods one-by-one
   - `core/ShoppingCart.test.ts` (next to `ShoppingCart.ts`)
   - Port ALL tests from `slice.test.js`
   - Each method tested in isolation
   - All tests must pass before moving to next

3. **Integration tests** - React hooks (co-located)
   - `react/CartProvider.test.tsx` (next to `CartProvider.tsx`)
   - `react/useShoppingCart.test.ts` (next to `useShoppingCart.ts`)
   - Test subscription/re-render behavior
   - Test SSR scenarios

4. **E2E tests** - Full app flows
   - Add to cart → checkout
   - Persistence across page reloads
   - Multiple tabs syncing

### Running Tests

```bash
# Run specific test file (co-located, so just use filename)
pnpm --filter use-shopping-cart test ShoppingCart.test.ts
pnpm --filter use-shopping-cart test formatters.test.ts

# Run all core tests
pnpm --filter use-shopping-cart test core/

# Run all react tests
pnpm --filter use-shopping-cart test react/

# Run all tests
pnpm --filter use-shopping-cart test

# Watch mode during development (recommended)
pnpm --filter use-shopping-cart test --watch

# Run tests for changed files only
pnpm --filter use-shopping-cart test --onlyChanged
```

**Co-location Benefits:**
- See test file immediately next to source in file explorer
- Easier to find and update tests when changing code
- Clear naming: `formatters.ts` → `formatters.test.ts`
- Matches React, Jest, and modern library patterns

---

## Migration Checklist

- [ ] Phase 1: Types & Utilities (4 files)
  - [ ] `types.ts` - compiles
  - [ ] `formatters.ts` - tests pass
  - [ ] `validation.ts` - tests pass
  - [ ] `storage.ts` - works

- [ ] Phase 2: Entry Management
  - [ ] `Entry.ts` - tests pass

- [ ] Phase 3: ShoppingCart Core
  - [ ] Constructor - tests pass
  - [ ] Subscribe/getState - tests pass
  - [ ] Storage - tests pass

- [ ] Phase 4: Cart Methods (test each before next)
  - [ ] `addItem` - all tests pass
  - [ ] `incrementItem` - all tests pass
  - [ ] `decrementItem` - all tests pass
  - [ ] `setItemQuantity` - all tests pass
  - [ ] `removeItem` - all tests pass
  - [ ] `clearCart` - all tests pass
  - [ ] `loadCart` - all tests pass
  - [ ] UI methods - all tests pass
  - [ ] Config methods - all tests pass

- [ ] Phase 5: Stripe Integration
  - [ ] `stripe.ts` - works
  - [ ] Methods added to class - tests pass

- [ ] Phase 6: React Integration
  - [ ] `CartProvider` - works
  - [ ] `useShoppingCart` - tests pass
  - [ ] `useOptimisticCart` - updated, works
  - [ ] `useCartActions` - updated, works

- [ ] Phase 7: Cleanup
  - [ ] Old files deleted
  - [ ] Exports updated
  - [ ] Dependencies removed
  - [ ] All examples updated
  - [ ] Docs updated

---

## Success Criteria

✅ All existing tests pass (ported to new class)
✅ No Redux dependencies in package.json
✅ Bundle size reduced
✅ Examples work with new implementation
✅ SSR still works
✅ Persistence still works
✅ Type safety maintained/improved

---

## Notes

- **Immutability is CRITICAL** - every state update must be `this._state = { ...this._state, changes }`
- **Test before moving on** - don't implement next method until current one's tests all pass
- **Port tests exactly** - slice.test.js has the right expectations
- **Bind methods** - in React hooks, always `.bind(cart)` to preserve `this` context
- **Co-locate tests** - every `.ts` file should have a `.test.ts` next to it (React pattern)
- **No test directories** - delete `__tests__/` and `test/` folders, move tests to co-located files

