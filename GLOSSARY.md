# use-shopping-cart

A shopping cart for React apps that check out with Stripe. The cart lives in the browser; prices are checked against the store's own inventory on the server before checkout.

## Products

**Product**:
Something the store sells, as handed to the cart: a name, a price in the smallest currency unit, a currency, and a product id.
_Avoid_: SKU, item

**Product id**:
The value that identifies a product in the cart: the first of `id`, `price_id`, `sku_id` or `sku` that is set, or a generated one when none is.
_Avoid_: SKU, key

**Inventory**:
The store's own list of products, kept where the shopper can't change it. Checkout prices come from here, never from the cart.
_Avoid_: catalog

**Product metadata**:
Extra data about a product in the cart that goes to Stripe with the line item, such as a size or an engraving.

**Price metadata**:
Extra data about a product's price that stays in the cart, because Stripe can't attach it to an inline price.

## The cart

**Cart**:
One shopper's cart entries, together with the currency and language its prices are shown in.
_Avoid_: basket, store

**Cart entry**:
One product in a cart, with its quantity, value, metadata and when it was first added. Action names shorten it to "item".
_Avoid_: line item, cart item

**Cart entry input**:
A cart entry as handed to the cart from outside, such as from a server or the cart config, before the cart works out its value, formatted prices and when it was first added.

**Quantity**:
How many of a product a cart entry holds; always a whole number of at least 1.

**Count**:
How many an action adds or removes at once, as in "add 3".
_Avoid_: amount, quantity (for the change itself)

**Value**:
A cart entry's price times its quantity.
_Avoid_: subtotal, line total

**Cart count**:
The total quantity across all cart entries.
_Avoid_: item count, number of items

**Total price**:
The sum of every cart entry's value.

**Language**:
The locale a cart formats prices in, such as `en-US`.
_Avoid_: locale

**Display state**:
Whether the cart panel is open and which product was last clicked. Not part of the cart's contents and never saved.
_Avoid_: UI state

## State over time

**Cart config**:
What a cart is created from: its starting cart entries, currency, language, and how it's saved.

**Initial state**:
The cart as built from its cart config alone, before a saved cart or the browser's language is applied. It is the same on the server and in the browser, so it is what a server-rendered page shows.
_Avoid_: server state, default state

**Saved cart**:
The copy of a cart kept in storage between visits.
_Avoid_: stored cart, persisted state

**Restore**:
Applying a saved cart to a cart once it has been read from storage. Changes the shopper made before that finish win over the saved cart.

**Storage adapter**:
Where a saved cart is kept: local storage, session storage, memory, or one the store provides.
_Avoid_: persister, storage backend

## Changing the cart

**Cart change**:
One change to a cart's entries: add, adjust, set, remove or clear.
_Avoid_: mutation, update

**Optimistic change**:
A cart change shown to the shopper while the store's backend confirms it; it is applied to the cart when confirmed and rolled back when rejected.
_Avoid_: pending update

## Checkout

**Checkout session**:
A Stripe Checkout session the store's server creates from the cart, priced from the inventory.

**Line item**:
Stripe's record for one product in a checkout session, built from a cart entry and the inventory.
_Avoid_: cart entry (that's the cart's side)
