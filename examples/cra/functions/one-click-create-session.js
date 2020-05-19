/*
 * This function creates a Stripe Checkout session and returns the session ID
 * for use with Stripe.js (specifically the redirectToCheckout method).
 *
 * @see https://stripe.com/docs/payments/checkout/one-time
 */

const stripe = require('stripe')(process.env.REACT_APP_STRIPE_API_SECRET)
const validateCartItems = require('use-shopping-cart/src/serverUtil')
  .validateCartItems

/*
 * Product data can be loaded from anywhere. In this case, we’re loading it from
 * a local JSON file, but this could also come from an async call to your
 * inventory management service, a database query, or some other API call.
 *
 * The important thing is that the product info is loaded from somewhere trusted
 * so you know the pricing information is accurate.
 */
const inventory = require('./data/products.json')

exports.handler = async (event) => {
  try {
    const productJSON = JSON.parse(event.body)

    const line_items = validateCartItems(inventory, productJSON)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },

      /*
       * This env var is set by Netlify and inserts the live site URL. If you want
       * to use a different URL, you can hard-code it here or check out the
       * other environment variables Netlify exposes:
       * https://docs.netlify.com/configure-builds/environment-variables/
       */
      success_url: `${process.env.URL}/success.html`,
      cancel_url: process.env.URL,
      line_items
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id })
    }
  } catch (error) {
    console.error(error)
  }
}
