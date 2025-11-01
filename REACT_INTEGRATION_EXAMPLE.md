# React Integration Examples

## Using with CartProvider Props

You can now pass all the new Stripe Checkout features directly to `CartProvider`:

```tsx
import { CartProvider } from 'use-shopping-cart'

function App() {
  return (
    <CartProvider
      mode="payment"
      cartMode="checkout-session"
      stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      successUrl="https://example.com/success"
      cancelUrl="https://example.com/cancel"
      currency="USD"
      // NEW - Modern Stripe Checkout features
      collectPhoneNumber={true}
      allowPromotionCodes={true}
      automaticTax={true}
      customerEmail="user@example.com"
      customText={{
        submit: 'Complete your purchase',
        shippingAddress: 'Please provide accurate shipping information'
      }}
      shippingOptions={[
        {
          displayName: 'Standard Shipping',
          amount: 500,
          deliveryEstimate: {
            minimum: { unit: 'day', value: 5 },
            maximum: { unit: 'day', value: 7 }
          }
        },
        {
          displayName: 'Express Shipping',
          amount: 1500,
          deliveryEstimate: {
            minimum: { unit: 'day', value: 1 },
            maximum: { unit: 'day', value: 2 }
          }
        }
      ]}
    >
      <YourApp />
    </CartProvider>
  )
}
```

## Using with useShoppingCart Hook

You can also configure these settings dynamically using the hook methods:

```tsx
import { useShoppingCart } from 'use-shopping-cart'

function CheckoutSettings() {
  const {
    // New methods
    setCustomerEmail,
    toggleAutomaticTax,
    togglePhoneCollection,
    togglePromotionCodes,
    setCustomText,
    setShippingOptions,
    // State
    customerEmail,
    automaticTax,
    collectPhoneNumber,
    allowPromotionCodes
  } = useShoppingCart()

  return (
    <div>
      <h2>Checkout Settings</h2>
      
      <label>
        <input
          type="checkbox"
          checked={automaticTax || false}
          onChange={(e) => toggleAutomaticTax(e.target.checked)}
        />
        Enable Automatic Tax
      </label>

      <label>
        <input
          type="checkbox"
          checked={collectPhoneNumber || false}
          onChange={(e) => togglePhoneCollection(e.target.checked)}
        />
        Collect Phone Number
      </label>

      <label>
        <input
          type="checkbox"
          checked={allowPromotionCodes || false}
          onChange={(e) => togglePromotionCodes(e.target.checked)}
        />
        Allow Promotion Codes
      </label>

      <input
        type="email"
        placeholder="Pre-fill customer email"
        value={customerEmail || ''}
        onChange={(e) => setCustomerEmail(e.target.value)}
      />

      <button
        onClick={() =>
          setCustomText({
            submit: 'Complete Purchase',
            shippingAddress: 'Enter accurate shipping address'
          })
        }
      >
        Set Custom Checkout Text
      </button>
    </div>
  )
}
```

## Embedded Checkout Example

```tsx
import { useShoppingCart } from 'use-shopping-cart'
import { useEffect } from 'react'

function EmbeddedCheckout() {
  const { setUIMode, setCreateSessionEndpoint, initEmbeddedCheckout } =
    useShoppingCart()

  useEffect(() => {
    // Configure for embedded checkout
    setUIMode('embedded')
    setCreateSessionEndpoint('/api/create-checkout-session')

    // Initialize embedded checkout
    initEmbeddedCheckout('#checkout-container')
  }, [])

  return (
    <div>
      <h1>Checkout</h1>
      <div id="checkout-container"></div>
    </div>
  )
}
```

## Custom Fields Example

```tsx
import { useShoppingCart } from 'use-shopping-cart'

function CustomFieldsSetup() {
  const { setCustomFields } = useShoppingCart()

  useEffect(() => {
    setCustomFields([
      {
        key: 'gift_message',
        label: 'Gift Message',
        type: 'text',
        optional: true
      },
      {
        key: 'gift_wrapping',
        label: 'Gift Wrapping',
        type: 'dropdown',
        optional: false,
        dropdown: {
          options: [
            { label: 'No wrapping', value: 'none' },
            { label: 'Standard wrapping', value: 'standard' },
            { label: 'Premium wrapping', value: 'premium' }
          ]
        }
      }
    ])
  }, [])

  return <div>Custom fields configured!</div>
}
```

## All Available New Methods

```tsx
const {
  // Configuration Methods
  setCustomerEmail,           // Pre-fill email
  toggleAutomaticTax,         // Enable/disable auto tax
  togglePhoneCollection,      // Collect phone numbers
  togglePromotionCodes,       // Allow promo codes
  toggleTermsOfService,       // Require ToS acceptance
  setCustomText,              // Custom checkout text
  setCustomFields,            // Custom form fields
  setShippingOptions,         // Shipping options
  setUIMode,                  // 'hosted' or 'embedded'
  setCreateSessionEndpoint,   // Server endpoint for embedded
  
  // Embedded Checkout
  initEmbeddedCheckout,       // Initialize embedded UI
  
  // State (read the current values)
  customerEmail,
  automaticTax,
  collectPhoneNumber,
  allowPromotionCodes,
  requireTermsOfService,
  customText,
  customFields,
  shippingOptions,
  uiMode,
  createSessionEndpoint
} = useShoppingCart()
```

## TypeScript Support

All new methods and state properties are fully typed:

```tsx
import type { CartState } from 'use-shopping-cart/core'

// Custom text type
const customText: CartState['customText'] = {
  submit: 'Buy Now',
  shippingAddress: 'Enter address'
}

// Custom fields type
const customFields: CartState['customFields'] = [
  {
    key: 'notes',
    label: 'Order Notes',
    type: 'text',
    optional: true
  }
]

// Shipping options type
const shippingOptions: CartState['shippingOptions'] = [
  {
    displayName: 'Standard',
    amount: 500,
    deliveryEstimate: {
      minimum: { unit: 'day', value: 3 },
      maximum: { unit: 'day', value: 5 }
    }
  }
]
```

