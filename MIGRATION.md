# Migration Guide

## Upgrading to v4.0.0

Version 4.0.0 is a major update that brings React 19 support and several important improvements. This guide will help you upgrade from v3.x to v4.0.0.

### Breaking Changes

#### React 19 Required

use-shopping-cart v4.0.0 requires React 19 as a peer dependency.

**Before (v3.x):**

```json
{
  "dependencies": {
    "react": "^17.0.0",
    "react-dom": "^17.0.0",
    "use-shopping-cart": "^3.2.0"
  }
}
```

**After (v4.x):**

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "use-shopping-cart": "^4.0.0"
  }
}
```

**If you need to stay on React 18:**
You can continue using use-shopping-cart v3.x, which will receive critical bug fixes but no new features.

#### Node.js Version Requirement

Node.js 22 or higher is now required (previously Node.js 8+).

#### Build File Paths Changed

Import from the package entry points, not from files inside `dist/`:

```js
import { CartProvider, useShoppingCart } from 'use-shopping-cart'
import { ShoppingCart } from 'use-shopping-cart/core'
import { validateCartItems } from 'use-shopping-cart/utilities'
```

These are unchanged. Importing `use-shopping-cart/dist/...` was already blocked by the package's `exports` map, but tooling that bypasses it can still point at a file. If you hard-coded a file path (an absolute path, a Jest `moduleNameMapper`, a bundler alias, or a CDN URL), update it:

| v3                        | v4                                          |
| ------------------------- | ------------------------------------------- |
| `dist/react.es.js`        | `dist/react.mjs`                            |
| `dist/react.js`           | `dist/react.cjs`                            |
| `dist/core.es.js`         | `dist/core.mjs`                             |
| `dist/core.js`            | `dist/core.cjs`                             |
| `utilities/serverless.js` | `dist/utilities.mjs` / `dist/utilities.cjs` |

`dist/react.umd.js` and `dist/core.umd.js` keep their names.

#### Errors Are `CartError`s

Errors thrown by the cart, `useCartActions` forms, `validateCartItems` and `redirectToCheckout` are now `CartError`s with a `code`. Some messages changed (for example invalid count and quantity errors), so match on `code` rather than `message`. If you check `error.name === 'ValidationError'`, switch to the code:

```js
import { isCartError } from 'use-shopping-cart/core'

if (isCartError(error) && error.code === 'ITEM_NOT_IN_CART') {
  // ...
}
```

`useCartActions` states have a new `errorCode` field next to `error`.

#### `CartConfig` Is Its Own Type

`CartProvider` props and the `ShoppingCart` constructor take only `cartDetails`, `currency`, `language`, `shouldPersist`, `persistKey` and `storage`. Passing other state fields (`cartCount`, `shouldDisplayCart`, ...) is now a type error; they were ignored or copied into state before. `shouldPersist` is no longer in the cart state, so read it from your own config instead of `useShoppingCart().shouldPersist`.

#### `validateCartItems` Matches More ID Fields

Inventory is now matched by `id`, `price_id`, `sku_id` and `sku` (first match in `inventory` wins), the same fields the cart uses for item IDs. Carts with items added by `price_id` or `sku_id` alone now validate instead of failing with "not in your inventory". Check your inventory if one product's `price_id` or `sku_id` can equal another product's `id` or `sku`: the earlier product now matches.

#### `CartProvider` Renders on the Server; `loading` Removed

`CartProvider` now renders its children during server rendering. The server and the first client render show the cart from your props (`cartDetails`, formatted with `language`, or `en-US` if you don't set it); the cart saved in storage and the browser's language apply right after hydration. Before, the server rendered the `loading` prop instead, which made hydration fail. Remove `loading` from `<CartProvider>`. `cart.getInitialState()` returns that server-side state, and `initialState.language` is now always `en-US` (it used to be the browser's language in the browser).

#### `useOptimisticCart` Reports Pending Entries in `pendingIds`

`useOptimisticCart()` no longer adds `_optimistic: true` to cart entries; its `cartDetails` hold plain `CartEntry`s. Read the new `pendingIds` set instead: `pendingIds.has(item.id)` replaces `item._optimistic`. The `OptimisticCartEntry` and `OptimisticCartDetails` types are removed; use `CartEntry` and `CartDetails`.

#### `createNoopStorage` Removed

Use `shouldPersist={false}` instead of `storage={createNoopStorage()}`; both store nothing.

#### Item Metadata Moved Under `metadata`

`product_metadata` and `price_metadata` from `addItem` are now stored as the entry's `product_data.metadata` and `price_data.metadata`, instead of being spread into `product_data` and `price_data`. This is what makes `validateCartItems` send `product_metadata` to Stripe Checkout; before, it was silently dropped. `price_metadata` stays in the cart, because Checkout's inline prices can't carry metadata.

```js
// Before
entry.product_data.gift_wrap

// After
entry.product_data.metadata.gift_wrap
```

#### `redirectToCheckout` Is a Standalone Function

Import it instead of reading it from the cart, and pass the Checkout Session URL. Session IDs, the `stripe` prop, `changeStripeKey` and the `RedirectToCheckoutInput` type are gone: Stripe removed `redirectToCheckout({ sessionId })` from Stripe.js, and a session URL needs no publishable key.

```jsx
// Before
const { redirectToCheckout } = useShoppingCart()
await redirectToCheckout(sessionId)

// After: return session.url from your server
import { redirectToCheckout } from 'use-shopping-cart'
redirectToCheckout(sessionUrl)
```

#### `useShoppingCart(selector)` Is Back

As in v3, `useShoppingCart` takes an optional selector, and the component re-renders only when the selected value changes:

```js
const cartCount = useShoppingCart((cart) => cart.cartCount)
```

### Improvements and Bug Fixes

#### Fixed: CartProvider Store Recreation Bug

In v3.x, the `CartProvider` would recreate the Redux store every time props changed, which could cause unexpected behavior. This has been fixed in v4.0.0.

**What this means for you:**

- Your cart state should be more stable
- No action required on your part - this fix is automatic

#### Updated Dependencies

All dependencies have been updated to their latest versions:

- TypeScript 5.3
- Jest 29
- ESLint 9
- Testing Library 14
- And more...

### TypeScript Changes

If you're using TypeScript, you'll need to update your type imports:

```bash
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0
```

The `RemoveItemState` and `UpdateQuantityState` types are removed; they were aliases, so use `ItemState` and `QuantityState`.

### Migration Steps

#### 1. Update React

```bash
npm install react@^19.0.0 react-dom@^19.0.0
# or
pnpm add react@^19.0.0 react-dom@^19.0.0
# or
yarn add react@^19.0.0 react-dom@^19.0.0
```

#### 2. Update use-shopping-cart

```bash
npm install use-shopping-cart@rc
# or
pnpm add use-shopping-cart@rc
# or
yarn add use-shopping-cart@rc
```

#### 3. Run React 19 Codemods (Optional)

React provides codemods to help migrate your code to React 19:

```bash
npx codemod@latest react/19/migration-recipe
```

This will automatically update deprecated APIs like:

- `ReactDOM.render` → `ReactDOM.createRoot`
- String refs → Ref callbacks
- And more...

#### 4. Update TypeScript Types (If Using TypeScript)

```bash
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0
```

Then run the TypeScript codemods:

```bash
npx types-react-codemod@latest preset-19 ./src
```

#### 5. Test Your Application

Run your test suite to ensure everything works correctly:

```bash
npm test
```

### Common Issues and Solutions

#### Issue: Type errors with refs

**Error:**

```
Cannot assign to 'current' because it is a read-only property
```

**Solution:**
Update your ref usage. In React 19, `useRef` requires an argument:

```typescript
// Before
const ref = useRef<HTMLDivElement>()

// After
const ref = useRef<HTMLDivElement>(null)
```

#### Issue: Test failures with `act`

**Error:**

```
Cannot find module 'react-dom/test-utils'
```

**Solution:**
Import `act` from `react` instead:

```javascript
// Before
import { act } from 'react-dom/test-utils'

// After
import { act } from 'react'
```

#### Issue: ESLint errors

If you're using ESLint 7 or 8, you may need to update to ESLint 9:

```bash
npm install --save-dev eslint@^9.0.0
```

Note: ESLint 9 uses a new flat config format. See [ESLint's migration guide](https://eslint.org/docs/latest/use/configure/migration-guide) for details.

### New Features in v4.0.0

While v4.0.0 is primarily focused on React 19 compatibility, it includes several improvements:

1. **Fixed CartProvider Bug**: Store is now created only once, not on every prop change
2. **Better Testing**: Updated to Jest 29 with modern jsdom environment
3. **Modern Dependencies**: All dependencies updated to latest stable versions
4. **Improved TypeScript**: Better type definitions and React 19 compatibility

### Release Status

`v4.0.0-rc.1` is the current release candidate.

Completed v4 work includes:

- React 19 support
- Redux removal in favor of a class-based cart core
- TypeScript migration across the core and React bindings
- Updated tests, tooling, and docs for the new architecture

The final v4.0.0 release is focused on release hardening, CI validation, and documentation polish.

### Getting Help

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/dayhaysoos/use-shopping-cart/issues)
2. Join our [Discord community](https://useshoppingcart.com/discord)
3. Review the [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

### Rollback Instructions

If you need to rollback to v3.x:

```bash
npm install use-shopping-cart@^3.2.0 react@^18.2.0 react-dom@^18.2.0
# or
pnpm add use-shopping-cart@^3.2.0 react@^18.2.0 react-dom@^18.2.0
# or
yarn add use-shopping-cart@^3.2.0 react@^18.2.0 react-dom@^18.2.0
```

---

**Last Updated:** February 2026
**Version:** 4.0.0-rc.1
