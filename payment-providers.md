# Payment Providers

Providers supported by use-shopping-cart are listed below. This library supports these providers in the sense that use-shopping-cart will do its best to format the items in the cart into an acceptable format for use with that provider. That being said, for use-shopping-cart to be able to, or even need to, support a payment provider, the provider needs to allow the usage of individual line items (like on a receipt) as opposed to a single payment sum (see WeChat's payment API for an example of that).

## Potentially Supported Providers

### Stripe

#### Checkout Session

The Checkout Session mode is characterized by needing the web page or app to send the data to your server to create a Checkout Session that allows your customer to go to a checkout page with the items that were in their cart.

##### Payment Modes

These are the three different modes of payment that a Checkout Session can have.

- `payment` - Accept one-time payments for cards, iDEAL, and more.
- `setup` - Save payment details to charge your customers later.
- `subscription` - Use Stripe Billing to set up fixed-price subscriptions.
  - It should be noted that you can also create a [Payment Link](https://stripe.com/docs/payments/payment-links) to create a hyperlink to Stripe's checkout for a cart that you created for them (no code solution). Would be useful for things like subscriptions.

##### Shape

```json5
{
  mode: 'payment' | 'setup' | 'subscription',
  success_url: string,
  cancel_url: string,

  // https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-line_items
  line_items: Array<
    {
      // The ID of the Price or Plan object. Use this or price_data but not both.
      price: string,
      // Used to create generate a new Price object inline. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-line_items-price_data
      price_data: Price,
      quantity: number,
      description?: string,
      // See the following page for more on tax_rates: https://stripe.com/docs/api/tax_rates/object
      tax_rates?: TaxRate[],
      // Tax rates applied depending on the customer's billing/shipping country. TODO: figure out the shape of this object.
      dynamic_tax_rate?: unknown,
      // Allows the customer to adjust the quantity of this item during checkout.
      adjustable_quantity?: { enabled: boolean, minimum?: number, maximum?: number, },
    },
  >,
  automatic_tax?: unknown,

  // Unique ID to reference the Checkout Session (e.g. customer ID, cart ID, etc.). Can be used to reconcile the session with your internal systems.
  client_reference_id?: string,
  // ID of an existing Customer, if one exists. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-customer
  customer?: string,
  // Used when creating the Customer object in Stripe. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-customer_email
  customer_email?: string,
  // Key-value pairs attached to a line-item, can be useful for storing additional information.
  metadata?: object,

  // Accepted payment methods for this Checkout Session.
  payment_method_types?: Array<'card' | 'acss_debit' | 'afterpay_clearpay' | 'alipay' | 'au_becs_debit' | 'bacs_debit' | 'bancontact' | 'boleto' | 'eps' | 'fpx' | 'giropay' | 'grabpay' | 'ideal' | 'klarna' | 'oxxo' | 'p24' | 'sepa_debit' | 'sofort' | 'wechat_pay'>,
  allow_promotion_codes?: unknown,
  // Auto means they will only collect the billing address when necessary. Auto is default.
  billing_address_collection?: 'auto' | 'required',
  // Array of two-letter ISO country codes representing which countries to show as options for shipping at checkout.
  shipping_address_collection?: { allowed_countries: string[], },
  shipping_options?: {
    // ID of the shipping rate in Stripe. Use this or shipping_rate_data but not both.
    shipping_rate: string,
    // Used to generate a Shipping Rate object inline. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-shipping_options-shipping_rate_data
    shipping_rate_data: ShippingRate,
  }

  // Used to generate a Subscription (subscription mode only). https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-subscription_data
  subscription_data?: Subscription,

  // Describes the type of transaction being performed so that Stripe can customize relevant text on the checkout page (payment mode only).
  submit_type?: 'auto' | 'pay' | 'book' | 'donate',
  // Allows collection of customer consent for promotional communications (U.S. only).
  consent_collection?: { promotions?: 'auto' },

  after_expiration?: { recovery: { enabled: boolean, allow_promotion_codes?: boolean, }, },
  customer_creation?: 'if_required' | 'always',
  customer_update?: { address?: 'auto' | 'never', name?: 'auto' | 'never', shipping?: 'auto' | 'never', },
  discounts?: { coupon?: string, promotion_code?: string, },
  // Format is the epoch time in seconds??? Defaults to 24 hours from creation.
  expires_at?: unknown,
  // IETF language tag used to localize Stripe's checkout page. Default is auto.
  locale?: string,
  // https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-payment_intent_data
  payment_intent_data?: PaymentIntent,
  // Payment-method-specific configuration. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-payment_method_options
  payment_method_options?: { acss_debit?: AcssDebitOptions, boleto?: BoletoOptions, oxxo?: OxxoOptions, wechat_pay?: WeChatPayOptions, },
  phone_number_collection?: { enabled: boolean, },
  setup_intent_data?: { description?: string, metadata?: object, on_behalf_of?: string, },
  tax_id_collection?: { enabled: boolean, },
}
```

#### Client-Only

The Client-Only mode is characterized by defining your products directly in the Stripe Dashboard and then referencing them by ID on the client-side, where you'll send the checkout options through `stripe.redirectToCheckout(options)`. Has [several limitations listed on the Stripe Docs](https://stripe.com/docs/payments/checkout/client).

This mode only allows two payment modes, `payment` or `subscription`.

##### Shape

```json5
{
  mode: 'payment' | 'subscription'
  lineItems: Array<{
    // The ID of the price to purchase or subscribe to (may also be SKU or plan).
    price: string,
    quantity: number,
  }>,
  successUrl: string,
  cancelUrl: string,
  // Unique ID to reference the Checkout Session (e.g. customer ID, cart ID, etc.). Can be used to reconcile the session with your internal systems.
  client_reference_id?: string,
  // Used when creating the Customer object in Stripe. https://stripe.com/docs/js/checkout/redirect_to_checkout#stripe_checkout_redirect_to_checkout-options-customerEmail
  customer_email?: string,
  // Auto means they will only collect the billing address when necessary. Auto is default.
  billing_address_collection?: 'auto' | 'required',
  // Array of two-letter ISO country codes representing which countries to show as options for shipping at checkout.
  shipping_address_collection?: { allowed_countries: string[], },
  // IETF language tag used to localize Stripe's checkout page. Default is auto.
  locale: string,
  // Describes the type of transaction being performed so that Stripe can customize relevant text on the checkout page (payment mode only).
  submitType?: 'auto' | 'pay' | 'book' | 'donate',
}
```

### PayU

Right-side under .order.line_items

https://developers.paymentsos.com/docs/apis/payments/1.3.0/#operation/create-a-payment

### PayPal

Listed as purchase_units and purchase_unit_request

https://developer.paypal.com/api/orders/v2/#definition-purchase_unit_request

### Klarna

### AfterPay

Under example order details object, listed as .items

https://developers.afterpay.com/afterpay-online/reference/order-details-object

### Square

Right-side under response JSON, listed as .checkout.order.line_items

https://developer.squareup.com/reference/square/checkout-api/create-checkout

## Yet to be Checked Providers

- Authorize.net
- PayWay
- Blockonomics
- Adyen
- Zip
- Instore payments
- Paystack
- RavePay

## Unsupported Providers

### WeChat Pay

No way to help here. They do not appear to support a cart system, only direct amounts. I would suggest using the use-shopping-cart without a provider. Stripe actually supports WeChat Pay as a payment option though.
