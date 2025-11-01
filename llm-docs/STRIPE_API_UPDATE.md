# Stripe Checkout API Modernization

## Current State

**Works but outdated:**
- Client-only mode (deprecated by Stripe)
- Missing modern features (embedded UI, phone collection, etc.)
- Partial type safety in stripe.ts

**What needs updating:**
- Add new Checkout Session features
- Deprecate client-only mode
- Full TypeScript type safety
- Support embedded checkout

## Phase 1: Add New Fields to CartState

Update `core/types.ts`:

```typescript
export interface CartState {
  // Existing (keep all)
  billingAddressCollection?: boolean
  allowedCountries?: string[]
  
  // NEW - Easy additions
  collectPhoneNumber?: boolean
  allowPromotionCodes?: boolean
  automaticTax?: boolean
  customerEmail?: string
  requireTermsOfService?: boolean
  
  // NEW - Advanced
  uiMode?: 'hosted' | 'embedded'
  customText?: {
    shippingAddress?: string
    submit?: string
    termsOfService?: string
  }
  customFields?: Array<{
    key: string
    label: string
    type: 'text' | 'dropdown' | 'numeric'
    optional?: boolean
    dropdown?: { options: Array<{ label: string; value: string }> }
  }>
  shippingOptions?: Array<{
    shippingRateId?: string  // Existing rate
    displayName?: string     // Or create inline
    amount?: number
    deliveryEstimate?: {
      minimum: { unit: 'day' | 'week'; value: number }
      maximum: { unit: 'day' | 'week'; value: number }
    }
  }>
}
```

**Test:** Verify types compile, update existing tests.

## Phase 2: Update getCheckoutData()

In `core/stripe.ts`:

```typescript
export interface CheckoutData {
  mode: 'payment' | 'subscription' | 'setup'
  line_items: Array<{ price: string; quantity: number }>
  success_url: string
  cancel_url: string
  
  // Existing
  billing_address_collection?: 'auto' | 'required'
  shipping_address_collection?: { allowed_countries: string[] }
  submit_type?: 'auto' | 'pay' | 'book' | 'donate'
  
  // NEW
  phone_number_collection?: { enabled: boolean }
  allow_promotion_codes?: boolean
  automatic_tax?: { enabled: boolean }
  customer_email?: string
  consent_collection?: {
    terms_of_service?: 'required'
    promotions?: 'auto'
  }
  custom_text?: Record<string, { message: string }>
  custom_fields?: Array<any>
  shipping_options?: Array<any>
}

export function getCheckoutData(state: CartState): CheckoutData {
  const lineItems: Array<{ price: string; quantity: number }> = []
  
  for (const sku in state.cartDetails) {
    lineItems.push({
      price: sku,
      quantity: state.cartDetails[sku].quantity
    })
  }

  const options: CheckoutData = {
    mode: state.mode,
    line_items: lineItems,
    success_url: state.successUrl!,
    cancel_url: state.cancelUrl!,
    submit_type: 'auto'
  }

  // Existing
  if (state.billingAddressCollection) {
    options.billing_address_collection = 'required'
  }

  if (state.allowedCountries?.length) {
    options.shipping_address_collection = {
      allowed_countries: state.allowedCountries
    }
  }

  // NEW - Phone number
  if (state.collectPhoneNumber) {
    options.phone_number_collection = { enabled: true }
  }

  // NEW - Promotion codes
  if (state.allowPromotionCodes) {
    options.allow_promotion_codes = true
  }

  // NEW - Automatic tax
  if (state.automaticTax) {
    options.automatic_tax = { enabled: true }
  }

  // NEW - Customer email
  if (state.customerEmail) {
    options.customer_email = state.customerEmail
  }

  // NEW - Terms of service
  if (state.requireTermsOfService) {
    options.consent_collection = {
      terms_of_service: 'required'
    }
  }

  // NEW - Custom text
  if (state.customText) {
    const customText: Record<string, { message: string }> = {}
    if (state.customText.shippingAddress) {
      customText.shipping_address = { message: state.customText.shippingAddress }
    }
    if (state.customText.submit) {
      customText.submit = { message: state.customText.submit }
    }
    if (state.customText.termsOfService) {
      customText.terms_of_service_acceptance = { message: state.customText.termsOfService }
    }
    options.custom_text = customText
  }

  // NEW - Custom fields
  if (state.customFields?.length) {
    options.custom_fields = state.customFields.map(field => ({
      key: field.key,
      label: { type: 'custom', custom: field.label },
      type: field.type,
      optional: field.optional ?? false,
      ...(field.dropdown && { dropdown: field.dropdown })
    }))
  }

  // NEW - Shipping options
  if (state.shippingOptions?.length) {
    options.shipping_options = state.shippingOptions.map(opt => {
      if (opt.shippingRateId) {
        return { shipping_rate: opt.shippingRateId }
      } else {
        return {
          shipping_rate_data: {
            display_name: opt.displayName!,
            type: 'fixed_amount',
            fixed_amount: {
              amount: opt.amount!,
              currency: state.currency
            },
            delivery_estimate: opt.deliveryEstimate
          }
        }
      }
    })
  }

  return options
}
```

**Test:** Update stripe.test.ts with tests for each new field.

## Phase 3: Embedded Checkout Support

Add new method to ShoppingCart:

```typescript
// In ShoppingCart.ts
async initEmbeddedCheckout(elementSelector: string): Promise<void> {
  if (this._state.uiMode !== 'embedded') {
    throw new Error('uiMode must be "embedded" for embedded checkout')
  }
  
  if (!this._state.stripe) {
    throw new Error('Stripe key required')
  }
  
  // User must provide server endpoint
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
  
  const { clientSecret } = await response.json()
  
  // Initialize embedded checkout
  const stripe = initializeStripe(this._state.stripe)
  const checkout = await stripe.initEmbeddedCheckout({
    clientSecret
  })
  
  // Mount in page
  checkout.mount(elementSelector)
}
```

**Test:** Mock fetch, verify mount called.

## Phase 4: Deprecate Client-Only Mode

In `core/stripe.ts`:

```typescript
export async function redirectToCheckout(
  state: CartState,
  sessionId?: string
): Promise<{ error: any } | undefined> {
  // ... validation ...
  
  if (state.cartMode === 'client-only') {
    console.warn(
      '⚠️ DEPRECATED: client-only mode is deprecated by Stripe. ' +
      'Use checkout-session mode instead. ' +
      'See: https://docs.stripe.com/payments/checkout/how-checkout-works'
    )
    // Still works, just warn
  }
  
  // ... rest of logic ...
}
```

**Update docs:** Add migration guide from client-only to checkout-session.

## Phase 5: Type Safety for Stripe

Replace `as any` casts:

```typescript
// Import Stripe types
import type { Stripe } from '@stripe/stripe-js'

// Use proper types
return stripe.redirectToCheckout(checkoutData as Stripe.RedirectToCheckoutOptions)
```

**OR** add `@ts-expect-error` with explanation:

```typescript
// @ts-expect-error - Our CheckoutData extends Stripe's types with additional fields
return stripe.redirectToCheckout(checkoutData)
```

## Phase 6: Update ShoppingCart Methods

Add config methods for new fields:

```typescript
// In ShoppingCart.ts
setCustomerEmail(email: string): void {
  this._state = { ...this._state, customerEmail: email }
  this._notifySubscribers()
}

toggleAutomaticTax(enabled: boolean): void {
  this._state = { ...this._state, automaticTax: enabled }
  this._notifySubscribers()
}

setCustomText(customText: CartState['customText']): void {
  this._state = { ...this._state, customText }
  this._notifySubscribers()
}

// etc.
```

**Test:** Add tests for each new method.

## Testing Checklist

- [ ] All new CartState fields have tests
- [ ] getCheckoutData() generates correct format for each field
- [ ] Phone number collection works
- [ ] Promotion codes works
- [ ] Automatic tax works
- [ ] Customer email pre-fill works
- [ ] Terms of service consent works
- [ ] Custom text works
- [ ] Custom fields work
- [ ] Shipping options work
- [ ] Embedded checkout works (if implemented)
- [ ] Client-only mode shows deprecation warning
- [ ] Backward compatibility maintained

## Migration for Users

Users upgrade by adding optional new fields:

```typescript
<CartProvider
  // Existing (keep working)
  stripe="pk_..."
  mode="payment"
  successUrl="..."
  cancelUrl="..."
  
  // NEW - Optional
  collectPhoneNumber={true}
  allowPromotionCodes={true}
  automaticTax={true}
  customerEmail="user@example.com"
  customText={{
    submit: "Complete your order"
  }}
/>
```

**No breaking changes** - all new fields optional.

## Reference

- Stripe Checkout Docs: https://stripe.com/docs/payments/checkout
- Embedded Checkout: https://stripe.com/docs/payments/checkout/embedded
- Session API: https://stripe.com/docs/api/checkout/sessions/create

