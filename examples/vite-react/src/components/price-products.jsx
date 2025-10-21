import React from 'react'
import { Grid } from 'theme-ui'
import PriceProduct from './price-product'
import PriceProductOptimistic from './price-product-optimistic'

// products created from the Stripe dashboard that have price ids

const PriceProducts = ({ products, useOptimistic = false }) => {
  const ProductComponent = useOptimistic ? PriceProductOptimistic : PriceProduct

  return (
    <Grid columns={2}>
      {products.map((product) => (
        <ProductComponent key={product.price_id} {...product} />
      ))}
    </Grid>
  )
}

export default PriceProducts
