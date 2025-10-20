# Vite React Example with Optimistic Updates

This example demonstrates the new `useOptimisticCart()` hook from use-shopping-cart v4.0.0.

## What's New

### useOptimisticCart Hook

The `useOptimisticCart()` hook provides instant UI feedback using React 19's `useOptimistic` feature:

- ✅ **Instant cart updates** - No waiting for localStorage sync
- ✅ **Better UX** - Users see changes immediately
- ✅ **Automatic rollback** - If operations fail, UI reverts
- ✅ **Loading states** - Built-in `isOptimistic` flag

## Files to Check Out

### Optimistic Components

- `src/components/cart-display-optimistic.jsx` - Cart with optimistic updates
- `src/components/product-optimistic.jsx` - Product card with optimistic updates
- `src/App-optimistic.jsx` - Demo app with toggle between standard and optimistic

### Standard Components (for comparison)

- `src/components/cart-display.jsx` - Standard cart
- `src/components/product.jsx` - Standard product card
- `src/App.jsx` - Standard app

## Running the Demo

```bash
# Install dependencies
pnpm install

# Run the optimistic demo
pnpm dev
```

Then open http://localhost:5173

## Key Differences

### Standard Version

```jsx
import { useShoppingCart } from 'use-shopping-cart'

function Product({ product }) {
  const { addItem } = useShoppingCart()
  
  return (
    <button onClick={() => addItem(product)}>
      Add to Cart
    </button>
  )
}
```

### Optimistic Version

```jsx
import { useOptimisticCart } from 'use-shopping-cart'

function Product({ product }) {
  const { addItem, isOptimistic, cartDetails } = useOptimisticCart()
  
  const itemInCart = cartDetails[product.id]
  const isThisItemOptimistic = itemInCart?._optimistic === true
  
  return (
    <div>
      {itemInCart && (
        <span>
          In cart: {itemInCart.quantity}
          {isThisItemOptimistic && ' (updating...)'}
        </span>
      )}
      <button 
        onClick={() => addItem(product)}
        disabled={isThisItemOptimistic}
      >
        {isThisItemOptimistic ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  )
}
```

## Features Demonstrated

1. **Instant feedback** - Item appears in cart immediately
2. **Loading states** - Shows "Adding..." while syncing
3. **Per-item optimistic state** - Track which items are updating
4. **Global optimistic state** - `isOptimistic` for cart-wide loading
5. **Disabled buttons** - Prevents double-clicks during updates
6. **Visual feedback** - Opacity changes, status badges

## Try It Out

1. Click "Add to Cart" on a product
2. Notice it appears instantly in the cart (no lag)
3. Watch for the "updating..." indicator
4. Try rapidly clicking - buttons disable during updates
5. Toggle between optimistic and standard modes to compare

## Benefits

- **Better perceived performance** - Feels instant even with slow storage
- **Improved UX** - Users get immediate feedback
- **Cleaner code** - No manual loading state management
- **Automatic rollback** - Failed operations revert automatically

## React 19 Required

This demo requires React 19 or higher. The `useOptimistic` hook is a new React 19 feature.

