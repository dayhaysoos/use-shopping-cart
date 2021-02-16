# Adding a service other than Stripe to use-shopping-cart

In an effort to make this project ready for contributions that allow other payment services to be utilized with it, we created the `getCheckoutData` methods and the `checkoutHandler` function factory.

This is a guide on how to add another payment service to use-shopping-cart.

## Updating `getCheckoutData` to get your options for your service's API

https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/src/util.js#L46

The idea behind this abstraction is that you can make a function in `util.js`'s `getCheckoutData` object that will take in the `cart` and produce most if not all of the options that the service, such as Stripe, will need to go to or do a checkout. This function you create will need to match the name of your service as it is on the `cart` object, for `stripe` it'll be `stripe(cart) {/* your code */}`

## Updating `checkoutHandler` to recognize your service's API

Then, inside of `checkoutHandler` you'll need to modify it to recognize your provider. Right now we only have one, Stripe, so it looks like this:

https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/src/util.js#L75

When you write yours it might look like this:
```js
if (cart.stripe) serviceProperty = 'stripe'
else if (cart.paypal) serviceProperty = 'paypal'
```

## My oops, necessary fix before it'll work:

Then, as I forgot to do this in development myself, you'll need to change this line:
https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/src/util.js#L97

To say:
```js
if (needsCheckoutData) options = getCheckoutData[serviceProperty](cart)
```

## Updating a "checkout handler" with your service's API

By this, I mean updating or creating a call to `checkoutHandler()` with the appropriate options and function for your service. In this instance, you'll likely just be updating `redirectToCheckout()` and `checkoutSingleItem()`. The format is as follows:

https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/src/index.js#L136-L141

It needs the `cart` as the first as the first argument, then we can get to the options.

In the options, the `mode` property determines what modes should be allowed for use with this function, therefore, if a mode not in this list is used, an error will be thrown. Note: this might be better refactored to be specific to each service but we'll cross that bridge if we get there.

Then below that, you can define a method/function that matches the `serviceProperty` name for your service, _`paypal` most likely._ The parameters for this function are `serviceObject, options, parameters`:

- `serviceObject` - your service itself that you would use to do the checkout (`stripe.redirectToCheckout()`)
- `options` - you created this via `getCheckoutData` and if you're in `checkout-session` mode you'll have a `sessionId` on it as well.
- `parameters` - this is any extra options that you might need from the developer before you can go to the checkout, example below:

https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/src/index.js#L143-L149

### Other things to do:

- Allow the developer to pass in the service object. It can be either the object itself or a promise resolving to that object.
- Update TypeScript type definitions in the `.d.ts` file.
- Update the documentation to explain how to use the added service with this library.

And don't forget to make a Draft PR while you're working on all this so it's easier to track the progress 👍