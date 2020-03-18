/**@jsx jsx */
import { jsx } from 'theme-ui';
import { useStripeCart } from 'use-stripe-cart';
import { Box, Flex, Button } from 'theme-ui';

const App = () => {
  const {
    cartCount,
    addItem,
    deleteItem,
    totalPrice,
    redirectToCheckout,
  } = useStripeCart();

  return (
    <Box>
      <Box>Total items in cart: {cartCount}</Box>
      <Box>Total price: {totalPrice()}</Box>
      <Flex>
        <Flex sx={{ flexDirection: 'column' }}>
          <Button
            sx={{ backgroundColor: 'blue' }}
            onClick={() =>
              addItem({
                sku: 'sku_GBJ2WWfMaGNC2Z',
                price: 200,
                image: '',
                currency: 'usd',
              })
            }
          >
            Add Orange
          </Button>
          <Button
            sx={{ backgroundColor: 'blue' }}
            onClick={() => deleteItem('sku_GBJ2WWfMaGNC2Z')}
          >
            Remove Orange
          </Button>
        </Flex>
        <Box>
          <Button
            sx={{ backgroundColor: 'blue' }}
            onClick={() =>
              addItem({
                sku: 'sku_GBJ2Ep8246qeeT',
                price: 400,
                image: '',
                currency: 'usd',
              })
            }
          >
            Bananas
          </Button>
        </Box>
      </Flex>
      <Button sx={{ backgroundColor: 'blue' }} onClick={redirectToCheckout}>
        Checkout
      </Button>
    </Box>
  );
};
export default App;
