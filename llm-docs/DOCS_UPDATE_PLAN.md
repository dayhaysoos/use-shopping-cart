# Documentation Update Plan for use-shopping-cart v4.0.0-alpha.1

## Overview

This document outlines all documentation updates needed to reflect the library's modernization:
- Stripe Checkout API updates (phone collection, promotion codes, embedded checkout, etc.)
- Client-only mode deprecation
- New configuration methods
- React 19 features
- Redux removal (now uses native React state)

---

## 1. DEPRECATION WARNINGS

### Client-Only Mode Deprecation

**Files to Update:**
- `docs/content/docs/welcome/getting-started-client-mode.mdx`
- `docs/content/docs/welcome/getting-started.mdx`
- `docs/content/docs/usage/components/CartProvider.mdx`
- `docs/content/docs/usage/actions/checkoutSingleItem.mdx`

**Add Prominent Warning:**
```mdx
> ⚠️ **DEPRECATED:** Client-only mode is deprecated by Stripe and will be removed in a future version.
> Please use `checkout-session` mode instead. See the [migration guide](#migration-from-client-only).
```

**Action Items:**
- Add deprecation banner at top of `getting-started-client-mode.mdx`
- Add migration section showing how to move from client-only to checkout-session
- Mark `checkoutSingleItem()` as deprecated (only works in client-only mode)
- Update `getting-started.mdx` to recommend checkout-session as primary mode
- Remove client-only from CartProvider examples (show as deprecated alternative)

---

## 2. NEW CONFIGURATION PROPERTIES

### Missing Properties Documentation

**Create New Files in `docs/content/docs/usage/properties/`:**

1. **`collectPhoneNumber.mdx`**
   - Description: Enable phone number collection at checkout
   - Type: `boolean`
   - Default: `false`
   - Example: `<CartProvider collectPhoneNumber={true} />`

2. **`allowPromotionCodes.mdx`**
   - Description: Allow customers to enter promotion codes
   - Type: `boolean`
   - Default: `false`
   - Example with screenshot of promo code field

3. **`automaticTax.mdx`**
   - Description: Enable Stripe's automatic tax calculation
   - Type: `boolean`
   - Default: `false`
   - Note: Requires tax settings configured in Stripe Dashboard

4. **`customerEmail.mdx`**
   - Description: Pre-fill customer email at checkout
   - Type: `string`
   - Example: `<CartProvider customerEmail="user@example.com" />`

5. **`requireTermsOfService.mdx`**
   - Description: Require customers to accept terms of service
   - Type: `boolean`
   - Default: `false`

6. **`uiMode.mdx`**
   - Description: Choose between hosted or embedded checkout UI
   - Type: `'hosted' | 'embedded'`
   - Default: `'hosted'`
   - Link to embedded checkout documentation

7. **`customText.mdx`**
   - Description: Custom text to display at checkout
   - Type: `{ shippingAddress?: string; submit?: string; termsOfService?: string }`
   - Example with all three fields

8. **`customFields.mdx`**
   - Description: Custom form fields to collect at checkout
   - Type: Array of field configurations
   - Example with text field and dropdown

9. **`shippingOptions.mdx`**
   - Description: Configure shipping options for checkout
   - Type: Array of shipping option configs
   - Example with both inline rates and existing rate IDs

10. **`createSessionEndpoint.mdx`**
    - Description: Server endpoint for creating checkout sessions (required for embedded checkout)
    - Type: `string`
    - Example: `'/api/create-checkout-session'`

**Update `meta.json`:**
```json
{
  "title": "Properties",
  "pages": [
    "cartCount",
    "totalPrice",
    "formattedTotalPrice",
    "cartDetails",
    "shouldDisplayCart",
    "lastClicked",
    "collectPhoneNumber",
    "allowPromotionCodes",
    "automaticTax",
    "customerEmail",
    "requireTermsOfService",
    "uiMode",
    "customText",
    "customFields",
    "shippingOptions",
    "createSessionEndpoint"
  ]
}
```

---

## 3. NEW ACTION METHODS

### Missing Methods in `docs/content/docs/usage/actions/`

**Create New Files:**

1. **`setCustomerEmail.mdx`**
   ```typescript
   setCustomerEmail(email: string): void
   ```
   - Description: Set customer email to pre-fill at checkout
   - Example: `cart.setCustomerEmail('user@example.com')`
   - Use case: Pre-fill from logged-in user

2. **`toggleAutomaticTax.mdx`**
   ```typescript
   toggleAutomaticTax(enabled: boolean): void
   ```
   - Description: Enable/disable automatic tax calculation
   - Example: `cart.toggleAutomaticTax(true)`
   - Note: Requires tax configuration in Stripe Dashboard

3. **`setCustomText.mdx`**
   ```typescript
   setCustomText(customText?: { shippingAddress?: string; submit?: string; termsOfService?: string }): void
   ```
   - Description: Set custom text for checkout page
   - Example showing all three text options

4. **`setCustomFields.mdx`**
   ```typescript
   setCustomFields(fields?: Array<CustomField>): void
   ```
   - Description: Configure custom form fields at checkout
   - Example with text field and dropdown
   - Show resulting Stripe UI

5. **`setShippingOptions.mdx`**
   ```typescript
   setShippingOptions(options?: Array<ShippingOption>): void
   ```
   - Description: Set shipping options for checkout
   - Example with multiple shipping tiers
   - Show both inline rates and existing rate IDs

6. **`setUIMode.mdx`**
   ```typescript
   setUIMode(mode: 'hosted' | 'embedded'): void
   ```
   - Description: Switch between hosted and embedded checkout
   - Example: `cart.setUIMode('embedded')`
   - Link to embedded checkout guide

7. **`togglePhoneCollection.mdx`**
   ```typescript
   togglePhoneCollection(enabled: boolean): void
   ```
   - Description: Enable/disable phone number collection
   - Example: `cart.togglePhoneCollection(true)`

8. **`togglePromotionCodes.mdx`**
   ```typescript
   togglePromotionCodes(enabled: boolean): void
   ```
   - Description: Enable/disable promotion code input
   - Example: `cart.togglePromotionCodes(true)`

9. **`toggleTermsOfService.mdx`**
   ```typescript
   toggleTermsOfService(required: boolean): void
   ```
   - Description: Require terms of service acceptance
   - Example: `cart.toggleTermsOfService(true)`

10. **`setCreateSessionEndpoint.mdx`**
    ```typescript
    setCreateSessionEndpoint(endpoint: string): void
    ```
    - Description: Set server endpoint for session creation
    - Required for embedded checkout
    - Example: `cart.setCreateSessionEndpoint('/api/create-session')`

11. **`initEmbeddedCheckout.mdx`**
    ```typescript
    async initEmbeddedCheckout(elementSelector: string): Promise<void>
    ```
    - Description: Initialize Stripe embedded checkout UI
    - Prerequisites: uiMode='embedded', createSessionEndpoint set
    - Full example with server endpoint
    - Show mounted UI in DOM

**Update `meta.json`:**
```json
{
  "title": "Actions",
  "pages": [
    "addItem",
    "incrementItem",
    "decrementItem",
    "setItemQuantity",
    "removeItem",
    "clearCart",
    "loadCart",
    "redirectToCheckout",
    "checkoutSingleItem",
    "handleCartClick",
    "handleCartHover",
    "handleCloseCart",
    "storeLastClicked",
    "setCustomerEmail",
    "toggleAutomaticTax",
    "setCustomText",
    "setCustomFields",
    "setShippingOptions",
    "setUIMode",
    "togglePhoneCollection",
    "togglePromotionCodes",
    "toggleTermsOfService",
    "setCreateSessionEndpoint",
    "initEmbeddedCheckout"
  ]
}
```

---

## 4. UPDATE EXISTING DOCUMENTATION

### CartProvider Configuration

**File:** `docs/content/docs/usage/components/CartProvider.mdx`

**Updates Needed:**

1. **Add all new props to examples:**
   ```tsx
   <CartProvider
     mode="payment"
     cartMode="checkout-session"
     stripe={process.env.STRIPE_KEY}
     currency="USD"
     
     // NEW - Modern Stripe Features
     collectPhoneNumber={true}
     allowPromotionCodes={true}
     automaticTax={true}
     customerEmail="user@example.com"
     customText={{
       submit: 'Complete your purchase',
       shippingAddress: 'Enter accurate shipping address'
     }}
     shippingOptions={[
       {
         displayName: 'Standard Shipping',
         amount: 500,
         deliveryEstimate: {
           minimum: { unit: 'day', value: 5 },
           maximum: { unit: 'day', value: 7 }
         }
       }
     ]}
   >
     <App />
   </CartProvider>
   ```

2. **Add props table** with all available configuration options

3. **Remove or deprecate client-only examples**

---

### Getting Started Guides

**File:** `docs/content/docs/welcome/getting-started-serverless.mdx`

**Updates:**
- Show new CartProvider props in examples
- Add section on new Stripe features
- Link to individual property documentation

**File:** `docs/content/docs/welcome/getting-started.mdx`

**Updates:**
- Emphasize checkout-session mode as primary/recommended
- Add warning about client-only deprecation
- Show brief overview of new features

---

### Embedded Checkout Guide

**Create New:** `docs/content/docs/welcome/embedded-checkout.mdx`

**Content:**
- What is embedded checkout
- When to use it vs hosted checkout
- Complete setup guide:
  1. Set `uiMode="embedded"`
  2. Configure `createSessionEndpoint`
  3. Create server endpoint to generate session
  4. Call `initEmbeddedCheckout(selector)`
- Full working example
- Server-side code example (Node.js/Next.js)

**Add to welcome/meta.json:**
```json
{
  "title": "Welcome",
  "pages": [
    "introduction",
    "getting-started",
    "getting-started-serverless",
    "getting-started-client-mode",
    "embedded-checkout",
    "typescript",
    "discord"
  ]
}
```

---

## 5. NEW FEATURES DOCUMENTATION

### Modern Stripe Features Guide

**Create New:** `docs/content/docs/usage/stripe-features.mdx`

**Sections:**

1. **Phone Number Collection**
   - How to enable
   - Why collect phone numbers
   - Example

2. **Promotion Codes**
   - Enabling promo code input
   - Creating codes in Stripe Dashboard
   - Example with screenshot

3. **Automatic Tax**
   - What is automatic tax
   - Configuration requirements
   - Enable via prop or method
   - Example

4. **Custom Checkout Text**
   - Customize button text
   - Customize field labels
   - All available text fields
   - Examples

5. **Custom Form Fields**
   - Text fields
   - Dropdowns
   - Numeric fields
   - Validation (optional vs required)
   - Full examples

6. **Shipping Options**
   - Inline shipping rates
   - Existing rate IDs
   - Delivery estimates
   - Multiple shipping tiers example

7. **Terms of Service**
   - Require acceptance
   - Custom text
   - Example

---

## 6. HOOKS DOCUMENTATION UPDATES

### useShoppingCart

**File:** `docs/content/docs/usage/hooks/useShoppingCart.mdx` (CREATE NEW)

**Content:**
- Main hook for accessing cart state and methods
- Returns all cart properties + all methods
- Type signature
- Examples:
  ```tsx
  const {
    // State
    cartCount,
    totalPrice,
    cartDetails,
    
    // Cart methods
    addItem,
    removeItem,
    incrementItem,
    
    // New Stripe methods
    setCustomerEmail,
    toggleAutomaticTax,
    initEmbeddedCheckout,
    
    // ... all other methods
  } = useShoppingCart()
  ```

### Update hooks/meta.json

```json
{
  "title": "Hooks",
  "pages": [
    "useShoppingCart",
    "useOptimisticCart",
    "useCartActions"
  ]
}
```

---

## 7. ARCHITECTURE CHANGES

### Redux Removal

**Create New:** `docs/content/docs/welcome/architecture.mdx`

**Content:**
- Library no longer uses Redux
- Now uses native React `useSyncExternalStore`
- ShoppingCart class with pub/sub pattern
- Benefits:
  - Smaller bundle size
  - No Redux dependency
  - Simpler mental model
  - Better TypeScript support
  - Works with React 19
- Migration notes (should be seamless for users)

---

## 8. REACT 19 FEATURES

### Update Existing Docs

**File:** `docs/content/docs/usage/hooks/useOptimisticCart.mdx`

**Updates:**
- Mention uses React 19's `useOptimistic`
- Requires React 19+
- Note about instant UI feedback

**File:** `docs/content/docs/usage/hooks/useCartActions.mdx`

**Updates:**
- Mention uses React 19's `useActionState`
- Requires React 19+
- Form integration examples

---

## 9. CONFIGURATION SECTION UPDATES

### New Configuration Options

**Create:** `docs/content/docs/usage/configuration/storage.mdx`

**Content:**
- Custom storage adapters
- `createLocalStorage()`, `createNoopStorage()`, `createMemoryStorage()`
- Custom adapter implementation
- Examples for different storage backends

**Update configuration/meta.json:**
```json
{
  "title": "Configuration",
  "pages": [
    "shouldPersist",
    "persistKey",
    "storage"
  ]
}
```

---

## 10. EXAMPLES & INTERACTIVE DEMOS

### Add Interactive Components for New Methods

**Create Components in `docs/src/components/`:**

1. **`IncrementItemDemo.tsx`** - for incrementItem docs
2. **`DecrementItemDemo.tsx`** - for decrementItem docs
3. **`RemoveItemDemo.tsx`** - for removeItem docs
4. **`ClearCartDemo.tsx`** - for clearCart docs
5. **`StripeConfigDemo.tsx`** - for new Stripe features
6. **`EmbeddedCheckoutDemo.tsx`** - for embedded checkout

**Pattern:**
- Each component uses `useShoppingCart()` directly
- Shows buttons for the specific action
- Includes `<CartDisplay />` to show results
- Can be imported into any doc page

**Example Structure:**
```tsx
// IncrementItemDemo.tsx
export function IncrementItemDemo() {
  const { incrementItem } = useShoppingCart()
  
  return (
    <div>
      {/* Product with increment buttons */}
      <button onClick={() => incrementItem('banana_001')}>
        Increment
      </button>
      <CartDisplay />
    </div>
  )
}
```

---

## 11. MIGRATION GUIDES

### Create Migration Documentation

**File:** `docs/content/docs/welcome/migration-v4.mdx`

**Sections:**

1. **Redux Removal**
   - No user action required
   - Smaller bundle size
   - Improved performance

2. **Client-Only Mode Deprecation**
   - Why it's deprecated
   - How to migrate to checkout-session
   - Code examples before/after
   - Server endpoint setup

3. **New Features Available**
   - Overview of new Stripe features
   - How to adopt incrementally
   - Examples

4. **Breaking Changes**
   - None! (100% backward compatible)

5. **TypeScript Improvements**
   - Better type inference
   - New exported types
   - Type-safe custom fields

---

## 12. API REFERENCE UPDATES

### useShoppingCart Return Type

**Create:** `docs/content/docs/api-reference/use-shopping-cart-return.mdx`

**Content:**
Complete reference table of all returned properties and methods:

| Property/Method | Type | Description |
|----------------|------|-------------|
| cartCount | number | Total number of items |
| totalPrice | number | Total price in smallest currency unit |
| ... | ... | ... |
| setCustomerEmail | (email: string) => void | Pre-fill customer email |
| toggleAutomaticTax | (enabled: boolean) => void | Enable automatic tax |
| ... | ... | ... |

---

## 13. COMPLETE CARTPROVIDER PROPS REFERENCE

### Update CartProvider Documentation

**File:** `docs/content/docs/usage/components/CartProvider.mdx`

**Add Complete Props Table:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| mode | 'payment' \| 'subscription' \| 'setup' | Yes | - | Stripe payment mode |
| cartMode | 'checkout-session' \| 'client-only' | Yes | 'checkout-session' | Integration mode (client-only deprecated) |
| stripe | string | Yes | - | Stripe publishable key |
| currency | string | Yes | 'USD' | ISO currency code |
| successUrl | string | No | - | Redirect URL after successful payment |
| cancelUrl | string | No | - | Redirect URL if payment canceled |
| billingAddressCollection | boolean | No | false | Collect billing address |
| allowedCountries | string[] | No | - | Countries for shipping |
| shouldPersist | boolean | No | true | Enable cart persistence |
| persistKey | string | No | 'use-shopping-cart' | Storage key |
| **collectPhoneNumber** | boolean | No | false | Collect phone at checkout |
| **allowPromotionCodes** | boolean | No | false | Enable promo codes |
| **automaticTax** | boolean | No | false | Enable automatic tax |
| **customerEmail** | string | No | - | Pre-fill customer email |
| **requireTermsOfService** | boolean | No | false | Require ToS acceptance |
| **uiMode** | 'hosted' \| 'embedded' | No | 'hosted' | Checkout UI mode |
| **customText** | object | No | - | Custom checkout text |
| **customFields** | array | No | - | Custom form fields |
| **shippingOptions** | array | No | - | Shipping options |
| **createSessionEndpoint** | string | No | - | Session creation endpoint |

---

## 14. EXAMPLES SECTION

### Create New Examples

**File:** `docs/content/docs/examples/basic-setup.mdx`
- Simple cart with add/remove
- Uses new CartProvider props
- Interactive demo

**File:** `docs/content/docs/examples/embedded-checkout.mdx`
- Complete embedded checkout example
- Client + server code
- Live demo if possible

**File:** `docs/content/docs/examples/advanced-features.mdx`
- Custom fields
- Shipping options
- Promotion codes
- Automatic tax
- All together

**File:** `docs/content/docs/examples/metadata.mdx`
- price_metadata examples
- product_metadata examples
- How to access on server

---

## 15. REMOVE OR UPDATE OUTDATED CONTENT

### Files to Review and Update

1. **Remove client-only focus:**
   - `docs/content/docs/welcome/getting-started-client-mode.mdx` - Add deprecation, show migration
   
2. **Update Redux references:**
   - Any mention of Redux should be removed/updated to explain new architecture
   - Look for "Redux", "reducer", "slice", "dispatch" mentions

3. **Update installation guides:**
   - Show current version (4.0.0-alpha.1)
   - React 19 requirement
   - No Redux peer dependencies

---

## 16. CONTENT STRUCTURE ADDITIONS

### New Top-Level Sections

**Add to `docs/content/docs/meta.json`:**
```json
{
  "title": "Documentation",
  "pages": [
    "index",
    "welcome",
    "usage",
    "examples",
    "api-reference",
    "migration"
  ]
}
```

**Create Directories:**
- `docs/content/docs/examples/` - Practical examples
- `docs/content/docs/api-reference/` - Complete API docs
- `docs/content/docs/migration/` - Migration guides

---

## 17. QUICK START GUIDE UPDATE

### Update Introduction

**File:** `docs/content/docs/welcome/introduction.mdx`

**Update Feature List:**
```mdx
## Features

- 🛍 Modern Stripe Checkout Integration
- 🛒 Fundamental Shopping Cart Logic
- ⚛️ React 19 Native State (no Redux!)
- 🗃 Local Storage Support
- ☁️ Serverless Utilities
- 📱 Phone Number Collection
- 🎟️ Promotion Codes Support
- 💰 Automatic Tax Calculation
- 📝 Custom Checkout Fields
- 🚚 Shipping Options
- 🔗 Embedded Checkout
- 🧾 Easy-To-Access Cart Info
- 💳 SSR Compatible
```

---

## 18. TYPESCRIPT DOCUMENTATION

### Update TypeScript Guide

**File:** `docs/content/docs/welcome/typescript.mdx`

**Add Sections:**

1. **New Type Exports:**
   ```typescript
   import type { 
     CartState,
     CartConfig,
     Product,
     CartEntry,
     CartDetails
   } from 'use-shopping-cart/core'
   ```

2. **Type-Safe Custom Fields:**
   ```typescript
   const customFields: CartState['customFields'] = [...]
   ```

3. **Type-Safe Shipping Options:**
   ```typescript
   const shippingOptions: CartState['shippingOptions'] = [...]
   ```

4. **Full UseShoppingCartReturn type:**
   - All properties with types
   - All methods with signatures

---

## 19. SEARCH & DISCOVERABILITY

### Add Keywords/Tags

For each new feature page, add metadata:
```mdx
---
title: Automatic Tax
description: Enable Stripe's automatic tax calculation for your checkout
keywords: tax, automatic tax, stripe tax, vat, gst
---
```

---

## 20. CONTENT GAPS TO FILL

### Missing Core Concepts

**Create:** `docs/content/docs/concepts/`

1. **`shopping-cart-class.mdx`**
   - How the ShoppingCart class works
   - Pub/sub pattern
   - State immutability
   - When to use methods vs props

2. **`checkout-modes.mdx`**
   - checkout-session (recommended)
   - client-only (deprecated)
   - Comparison table
   - When to use which

3. **`persistence.mdx`**
   - How cart persistence works
   - Storage adapters
   - Custom storage
   - Cross-tab syncing

---

## PRIORITY ORDER

### Phase 1: Critical Updates (Do First)
1. Add deprecation warnings to client-only docs
2. Update CartProvider with all new props
3. Update getting-started guides

### Phase 2: New Features (High Priority)
1. Create all new property docs (10 files)
2. Create all new action method docs (11 files)
3. Create embedded checkout guide

### Phase 3: Examples & Guides (Medium Priority)
1. Create interactive demos for new methods
2. Create migration guide
3. Create examples section

### Phase 4: Polish (Lower Priority)
1. Architecture doc
2. Concepts section
3. Complete API reference
4. Search keywords

---

## NOTES

- All new features are **optional** and backward compatible
- Client-only mode still works (just deprecated)
- Focus on showing practical examples, not just API docs
- Interactive components make docs much better (keep adding these!)
- Link related docs together (e.g. customFields property → setCustomFields action)

---

## SUMMARY OF GAPS

### Missing from Current Docs:
- ✅ 10 new properties (not documented)
- ✅ 11 new action methods (not documented)
- ✅ Embedded checkout guide (doesn't exist)
- ✅ Client-only deprecation warnings (not present)
- ✅ Modern Stripe features overview (not present)
- ✅ Updated CartProvider props reference (incomplete)
- ✅ Migration guide for v4 (doesn't exist)
- ✅ React 19 requirements (not mentioned)
- ✅ Redux removal notes (not explained)
- ✅ useShoppingCart hook documentation (doesn't exist)

### Total New/Updated Files Needed:
- **21 new property/method docs**
- **3 new guides** (embedded checkout, migration, Stripe features)
- **1 new hook doc** (useShoppingCart)
- **5+ interactive demo components**
- **Update 6 existing files** (CartProvider, getting-started, etc.)

**Estimated:** ~30 files to create/update

