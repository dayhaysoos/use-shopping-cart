import React from 'react'
import { Grid } from 'theme-ui'
import Product from './product'

const Products = ({ products }) => {
  return (
    <Grid columns={2}>
      {products.map((product) => (
        <Product key={product.name} {...product} />
      ))}
    </Grid>
  )
}

export default Products
