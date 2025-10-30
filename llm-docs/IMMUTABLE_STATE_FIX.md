# Immutable State Updates - Critical Fix for useSyncExternalStore

## Problem Identified

`ShoppingCart` class currently **mutates** `this._state` properties instead of creating new state objects. This breaks `useSyncExternalStore` because React detects changes via **reference equality** - same object reference = no change detected.

### Current (BROKEN) Pattern
```typescript
// ❌ MUTATION - same object reference
this._state.cartDetails = { ...this._state.cartDetails, [id]: newEntry }
this._state.totalPrice += newEntry.value
this._state.cartCount += count
this._updateFormattedTotalPrice()  // Creates ANOTHER state mutation
this._notifySubscribers()
```

**Problems:**
- Multiple mutations per update
- `this._state` object ref never changes
- Calling `_updateFormattedTotalPrice()` separately mutates again
- `useSyncExternalStore` can't detect changes

### Solution (IMMUTABLE) Pattern
```typescript
// ✅ IMMUTABLE - new object reference
const newTotalPrice = this._state.totalPrice + newEntry.value
const newCartCount = this._state.cartCount + count

this._state = {
  ...this._state,
  cartDetails: { ...this._state.cartDetails, [id]: newEntry },
  totalPrice: newTotalPrice,
  cartCount: newCartCount,
  formattedTotalPrice: calculateFormattedTotalPrice(
    newTotalPrice,
    this._state.currency,
    this._state.language
  )
}
this._notifySubscribers()
```

**Benefits:**
- Single state update per action
- New `this._state` object reference every time
- `useSyncExternalStore` detects changes via `===` check
- `formattedTotalPrice` included inline (no separate mutation)

## Methods That Need Fixing

All in `use-shopping-cart/core/ShoppingCart.ts`:

1. **`addItem()`** - lines ~230-272
2. **`incrementItem()`** - lines ~278-296  
3. **`decrementItem()`** - lines ~303-330
4. **`setItemQuantity()`** - lines ~336-365
5. **`removeItem()`** - lines ~371-393
6. **`clearCart()`** - lines ~399-412
7. **`loadCart()`** - lines ~418-448
8. **`handleCartHover()`** - lines ~454-457
9. **`handleCartClick()`** - lines ~463-466
10. **`handleCloseCart()`** - lines ~471-474
11. **`storeLastClicked()`** - lines ~479-482
12. **`changeStripeKey()`** - lines ~487-490
13. **`changeLanguage()`** - lines ~495-518
14. **`changeCurrency()`** - lines ~524-547
15. **`_loadFromStorage()`** - lines ~123-152 (loads from localStorage)

## Pattern to Apply

For each method, follow this template:

### Simple property updates:
```typescript
// Before
handleCartHover(): void {
  this._state.shouldDisplayCart = true
  this._notifySubscribers()
}

// After
handleCartHover(): void {
  this._state = { ...this._state, shouldDisplayCart: true }
  this._notifySubscribers()
}
```

### Complex updates with calculations:
```typescript
// Before
incrementItem(id: string, options = {}): void {
  const entry = this._state.cartDetails[id]
  const newQuantity = entry.quantity + count
  const updatedEntry = this._createEntry(id, entry, newQuantity)
  
  this._state.cartDetails = { ...this._state.cartDetails, [id]: updatedEntry }
  this._state.totalPrice += entry.price * count
  this._state.cartCount += count
  this._updateFormattedTotalPrice()
  this._notifySubscribers()
}

// After
incrementItem(id: string, options = {}): void {
  const entry = this._state.cartDetails[id]
  const newQuantity = entry.quantity + count
  const updatedEntry = this._createEntry(id, entry, newQuantity)
  
  const newTotalPrice = this._state.totalPrice + entry.price * count
  const newCartCount = this._state.cartCount + count
  
  this._state = {
    ...this._state,
    cartDetails: { ...this._state.cartDetails, [id]: updatedEntry },
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

## What NOT to Do

### ❌ DON'T add `_cachedSnapshot` or `_cachedState`
You considered adding caching mechanisms - **NOT NEEDED**. The immutable pattern naturally creates new refs when state changes and keeps same ref when unchanged.

### ❌ DON'T call `_updateFormattedTotalPrice()` separately  
Include `formattedTotalPrice` directly in the state update to avoid multiple mutations.

### ❌ DON'T use `Object.freeze()`
Not necessary. Just return `this._state` from `getState()`.

### ❌ DON'T modify `getState()` or `_notifySubscribers()`
They're fine as-is:
```typescript
getState(): Readonly<CartState> {
  return this._state  // Just return it
}

private _notifySubscribers(): void {
  this._subscribers.forEach((callback) => callback(this._state))
}
```

## Verification

After applying fixes:
```bash
pnpm --filter use-shopping-cart run test
```

**Expected:** Core tests pass (67-68 tests)

## React Layer (DO LATER)

React integration has separate issues with `useSyncExternalStore` - **tackle AFTER core is immutable**.

Issues identified:
- Default selector `(state) => ({ ...state })` creates new object every call
- Return object `{ ...selectedState, ...actions }` recreates on every render
- Need to cache actions separately from state

**Fix approach:**
1. Get core immutable working first
2. Then address React hook memoization issues
3. Consider removing/simplifying `loading` and `isClient` logic

## Summary

**Single rule:** Every state update must be `this._state = { ...this._state, changes }`

This ensures:
- New object reference = React detects change
- Single update per action = no loops
- `useSyncExternalStore` works correctly

