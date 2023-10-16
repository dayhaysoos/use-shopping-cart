import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2023-08-16',
  appInfo: {
    name: 'projectname',
    url: 'http://localhost:3000/'
  }
})
