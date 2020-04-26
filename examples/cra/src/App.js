/**@jsx jsx */
import { jsx } from 'theme-ui';
import { Flex } from 'theme-ui';
import Products from './components/products';
import CartDisplay from './components/cart-display';
import { toCurrency } from './util';

const fakeData = [
  {
    name: 'Bananas',
    sku: 'sku_GBJ2Ep8246qeeT',
    price: 400,
    image: 'https://www.fillmurray.com/300/300',
    currency: 'USD',
  },
  {
    name: 'Tangerines',
    sku: 'sku_GBJ2WWfMaGNC2Z',
    price: 100,
    image: 'https://www.fillmurray.com/300/300',
    currency: 'USD',
  },
];

const App = () => {
  return (
    <Flex sx={{ justifyContent: 'space-evenly' }}>
      <Products products={fakeData} />
      <CartDisplay />
    </Flex>
  );
};
export default App;
