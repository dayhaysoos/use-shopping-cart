import React from 'react'
import { Flex, Box } from 'theme-ui'
import Products from './components/products'
import PriceProducts from './components/price-products'
import CartDisplay from './components/cart-display'

const fakeData = [
  {
    name: 'Bananas',
    id: 'test1',
    price: 400,
    image: 'https://i.imgur.com/AUJQtJC.jpg',
    currency: 'USD'
  },
  {
    name: 'Tangerines',
    id: 'test2',
    price: 100,
    image: 'https://i.imgur.com/4rVhatT.jpg',
    currency: 'USD'
  }
]

const priceProducts = [
  {
    name: 'Sunglasses',
    price_id: 'price_1GwzfVCNNrtKkPVCh2MVxRkO',
    price: 100,
    image: 'https://files.stripe.com/links/fl_test_FR8EZTS7UDXE0uljMfT7hwmH',
    currency: 'USD'
  }
]

const App = () => {
  return (
    <Flex
      sx={{
        maxWidth: 1400,
        margin: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 20
      }}
    >
      <h1>Store</h1>
      <Flex sx={{ justifyContent: 'space-evenly', gap: 80 }}>
        <Box>
          <h2>Products not created in the Stripe Dashboard</h2>
          <Products products={fakeData} />
          <br />
          <br />
          <h2>Products made on Stripe Dashboard using Price API</h2>
          <PriceProducts products={priceProducts} />
        </Box>
        <CartDisplay />
      </Flex>
    </Flex>
  )
}
export default App
