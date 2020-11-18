/**@jsx jsx */
import { jsx } from 'theme-ui'
import { Flex } from 'theme-ui'
import Products from './components/products'
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

const App = () => {
  return (
    <Flex sx={{ justifyContent: 'space-evenly' }}>
      <Products products={fakeData} />
      <CartDisplay />
    </Flex>
  )
}
export default App
