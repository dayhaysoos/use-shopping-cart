/**@jsx jsx */
import { jsx, Box, Image, Button, Flex } from 'theme-ui'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

const Product = (product) => {
  const { addItem, checkoutSingleItem } = useShoppingCart()
  const { name, price, image, currency } = product

  const handleSubmit = async (product) => {
    const response = await fetch(
      '/.netlify/functions/one-click-create-session',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [product.sku]: { ...product, quantity: 10 } })
      }
    )
      .then((res) => {
        return res.json()
      })
      .catch((error) => console.log(error))

    checkoutSingleItem({ sessionId: response.sessionId })
  }

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
        <p>{formatCurrencyString({ value: price, currency })}</p>
      </Box>
      <Button onClick={() => addItem(product)} backgroundColor={'black'}>
        Add To Cart
      </Button>
      <Button onClick={() => handleSubmit(product)} backgroundColor={'black'}>
        Checkout
      </Button>
    </Flex>
  )
}

export default Product
