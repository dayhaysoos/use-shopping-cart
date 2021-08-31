import * as React from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"
import DebugCart from "../components/debugCart"
import Product from "../components/product"
import { useStripeProducts } from "../hooks/useStripeProducts"

const Store = () => {
  const products = useStripeProducts()
  return (
    <Layout>
      <Seo title="Store" />
      <h1>Store</h1>
      <p>
        This is an example of a "client-only" implementation of
        use-shopping-cart where products are stored directly in Stripe and
        Stripe handles the price validation when the user attempts to make a
        purchase.
      </p>
      <div className="productsWrapper">
        {products.map(product => (
          <Product product={product} key={product.name} />
        ))}
      </div>
      <DebugCart />
    </Layout>
  )
}

export default Store
