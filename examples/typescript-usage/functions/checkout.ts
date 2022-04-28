import Stripe from 'stripe'
import { validateCartItems } from 'use-shopping-cart/utilities'
import inventory from '../src/data/products.json'

import { CartDetails } from 'use-shopping-cart/core'
import { Handler } from '@netlify/functions'

const stripe = new Stripe(process.env.STRIPE_API_SECRET, {
  apiVersion: '2020-08-27',
  typescript: true
})

export const handler: Handler = async (event) => {
  // Ensure that the request was a POST request.
  if (event.httpMethod.toUpperCase() !== 'POST') {
    // HTTP 405 error: Method not allowed. Specifies that POST is the only method allowed.
    return {
      statusCode: 405,
      headers: {
        Allow: 'POST'
      }
    }
  }

  // Ensure that the request was JSON.
  if (event.headers['content-type'] !== 'application/json') {
    // HTTP 415 error: Unsupported media type. Specifies that application/json is the only media type allowed.
    return {
      statusCode: 415,
      headers: {
        Accept: 'application/json'
      }
    }
  }

  // Parse the body of the request as JSON to get the user's cart.
  let cartDetails: CartDetails
  try {
    cartDetails = JSON.parse(event.body)
  } catch (error) {
    // HTTP 400 error: Bad request. The syntax, JSON in this case, was malformed.
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Received malformed JSON.',
        error: error.message
      })
    }
  }

  // Validate the items in the user's cart against our inventory.
  let line_items
  try {
    line_items = validateCartItems(inventory, cartDetails)
  } catch (error) {
    // HTTP 422 error: Unprocessable entity. While the syntax is correct, the data contained was unprocessable.
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: 'Some of the items in your cart are invalid.',
        error: error.message
      })
    }
  }

  // Create a session with Stripe with the user's cart.
  let session
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      mode: 'payment',
      success_url: `${process.env.URL}/success.html`,
      cancel_url: process.env.URL,
      line_items
    })
  } catch (error) {
    // HTTP 500 error: Internal server error. An unknown error occurred with Stripe.
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'While communicating with Stripe, we encountered an error.',
        error: error.message
      })
    }
  }

  // We did it! Time to give the user their session ID.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain'
    },
    body: session.id
  }
}
