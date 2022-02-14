# Payment Providers

Providers supported by use-shopping-cart are listed below. This library supports these providers in the sense that use-shopping-cart will do its best to format the items in the cart into an acceptable format for use with that provider. That being said, for use-shopping-cart to be able to, or even need to, support a payment provider, the provider needs to allow the usage of individual line items (like on a receipt) as opposed to a single payment sum (see WeChat's payment API for an example of that).

## Potentially Supported Providers

### Stripe

#### Modes

- `payment` - Accept one-time payments for cards, iDEAL, and more.
- `setup` - Save payment details to charge your customers later.
- `subscription` - Use Stripe Billing to set up fixed-price subscriptions.

#### Shape

```json5
{
  mode: 'payment' | 'setup' | 'subscription',
  success_url: string,
  cancel_url: string,

  // https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-line_items
  line_items: [
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
      adjustable_quantity?: { enabled: bool, minimum?: number, maximum?: number, },
    },
  ],
  automatic_tax?: unknown,

  // Unique ID to reference the Checkout Session (e.g. customer ID, cart ID, etc.). Can be used to reconcile the session with your internal systems.
  client_reference_id?: string,
  // ID of an existing Customer, if one exists. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-customer
  customer?: string,
  // Used when creating the Customer object in Stripe. https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-customer_email
  customer_email?: string,
  // Key-value pairs attached to a line-item, can be useful for storing additional information.
  metadata?: { [key: string]: string, },

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

  after_expiration?: unknown,
  customer_creation?: unknown,
  customer_update?: unknown,
  discounts?: unknown,
  expires_at?: unknown,
  locale?: unknown,
  payment_intent_data?: unknown,
  payment_method_options?: unknown,
  phone_number_collection?: unknown,
  setup_intent_data?: unknown,
  tax_id_collection?: unknown,
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
