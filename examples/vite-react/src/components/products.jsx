import React from 'react'
import { Grid } from 'theme-ui'
import Product from './product'
import ProductOptimistic from './product-optimistic'

const Products = ({ products, useOptimistic = false }) => {
  const ProductComponent = useOptimistic ? ProductOptimistic : Product

  return (
    <Grid columns={2}>
      {products.map((product) => (
        <ProductComponent key={product.name} {...product} />
      ))}
    </Grid>
  )
}

export default Products
