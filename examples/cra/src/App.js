/**@jsx jsx */
import { jsx } from 'theme-ui'
import { Flex, Box } from 'theme-ui'
import Products from './components/products'
import PriceProducts from './components/price-products'
import CartDisplay from './components/cart-display'

const fakeData = [
  {
    name: 'Bananas',
    sku: 'test1',
    // price_id: 'price_id_test1',
    // sku_id: 'sku_id_test1',
    price: 400,
    image: 'https://i.imgur.com/AUJQtJC.jpg',
    currency: 'USD'
  },
  {
    name: 'Tangerines',
    sku: 'test2',
    // price_id: 'price_id_test2',
    // sku_id: 'sku_id_test2',
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
    <Flex sx={{ justifyContent: 'space-evenly' }}>
      <Box>
        <h2>Products not created in the Stripe Dashboard</h2>
        <Products products={fakeData} />
        <h2>Products made on Stripe Dashboard using Price API</h2>
        <PriceProducts products={priceProducts} />
      </Box>
      <CartDisplay />
    </Flex>
  )
}
export default App
