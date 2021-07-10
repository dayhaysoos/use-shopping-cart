import React from 'react'
import { Box, Image, Button, Flex } from 'theme-ui'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

const Product = (product) => {
  const { addItem, redirectToCheckout } = useShoppingCart()
  const { name, price, image, currency } = product

  async function handleCheckout() {
    const response = await fetch('/.netlify/functions/create-session', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ [product.sku]: { ...product, quantity: 1 } })
    })
      .then((res) => {
        return res.json()
      })
      .catch((error) => console.log(error))

    redirectToCheckout({ sessionId: response.sessionId })
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
      <Button onClick={handleCheckout} backgroundColor={'black'}>
        Buy Now
      </Button>
    </Flex>
  )
}

export default Product
