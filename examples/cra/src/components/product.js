/**@jsx jsx */
import { jsx, Box, Image, Button, Flex } from 'theme-ui'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

const Product = (product) => {
  const { addItem } = useShoppingCart()
  const { name, price, image, currency } = product
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Image src={image} />
      <Box>
        <p>{name}</p>
        <p>{formatCurrencyString({ price: price, currency })}</p>
      </Box>
      <Button onClick={() => addItem(product)} backgroundColor={'black'}>
        Add To Cart
      </Button>
    </Flex>
  )
}

export default Product
