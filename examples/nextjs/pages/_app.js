import Layout from '@/components/Layout'
import '@/styles/globals.css'
import { CartProvider } from 'use-shopping-cart'

export default function App({ Component, pageProps }) {
  return (
    <CartProvider
      mode="payment"
      cartMode="client-only"
      // Connects to our Stripe account (stored in an .env.local file)
      stripe={'test'}
      // Redirected here after successful payments (url stored in .env.local file)
      successUrl={`${process.env.NEXT_PUBLIC_URL}/success`}
      // Redirected here when you click back on Stripe Checkout (url stored in .env.local file)
      cancelUrl={`${process.env.NEXT_PUBLIC_URL}/?success=false`}
      currency="GBP"
      // Only customers from UK will be able to purchase
      // Having this setting means that we will capture shipping address
      allowedCountries={['GB']}
      // Enables local storage
      shouldPersist={false}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  )
}

