/**@jsx jsx */
import { jsx, Grid } from 'theme-ui'
import PriceProduct from './price-product'

// products created from the Stripe dashboard that have price ids

const PriceProducts = ({ products }) => {
  return (
    <Grid columns={2}>
      {products.map((product) => (
        <PriceProduct key={product.price_id} {...product} />
      ))}
    </Grid>
  )
}

export default PriceProducts
