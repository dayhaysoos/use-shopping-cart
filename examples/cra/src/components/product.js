/**@jsx jsx */
import { jsx, Box, Image, Button, Flex } from 'theme-ui';
import { useShoppingCart } from 'use-shopping-cart';
import { toCurrency } from '../util';

const Product = (products) => {
  const { addItem } = useShoppingCart();
  const { name, sku, price, image, currency } = products;
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image src={image} />
      <Box>
        <p>{name}</p>
        <p>{toCurrency({ price: price, currency })}</p>
      </Box>
      <Button
        onClick={() => addItem({ ...products })}
        backgroundColor={'black'}
      >
        Add To Cart
      </Button>
    </Flex>
  );
};

export default Product;
