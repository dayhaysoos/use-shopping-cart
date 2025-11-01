# Vite React Example - Setup

This example uses **use-shopping-cart v4.0.0-alpha.1** from the workspace.

## Quick Start

1. **Create a `.env.local` file** in this directory:
   ```bash
   VITE_STRIPE_API_PUBLIC=pk_test_your_stripe_publishable_key_here
   ```
   Get your test key from: https://dashboard.stripe.com/test/apikeys

2. **Install dependencies** (from root):
   ```bash
   cd /Users/nickdejesus/Code/use-shopping-cart
   pnpm install
   ```

3. **Start the dev server**:
   ```bash
   cd examples/vite-react
   npm run dev
   ```

4. **Open** http://localhost:5173/

## What's Included

The example demonstrates:
- ✅ Basic cart functionality (add, remove, increment, decrement)
- ✅ Optimistic UI updates (`useOptimisticCart`)
- ✅ React 19 features
- 🔜 New Stripe API features (ready to add!)

## Current CartProvider Config

```jsx
<CartProvider
  mode="payment"
  cartMode="checkout-session"
  stripe={import.meta.env.VITE_STRIPE_API_PUBLIC}
  billingAddressCollection={false}
  successUrl="https://stripe.com"
  cancelUrl="https://twitter.com/dayhaysoos"
  currency="USD"
>
```

## Try New Features

You can now add any of the new Stripe features:

```jsx
<CartProvider
  // ... existing props
  collectPhoneNumber={true}
  allowPromotionCodes={true}
  automaticTax={true}
  customText={{
    submit: 'Complete your purchase'
  }}
>
```

Or use the hook methods:

```jsx
const { 
  toggleAutomaticTax,
  setCustomerEmail,
  togglePhoneCollection 
} = useShoppingCart()
```

## Notes

- Using `workspace:*` for use-shopping-cart (points to local `../../use-shopping-cart`)
- Example uses `App-optimistic.jsx` by default (shows optimistic UI)
- Regular version available in `App.jsx`

