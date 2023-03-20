import React from 'react'
import { Box, Image, Button, Flex } from 'theme-ui'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

const Product = (product) => {
  const { addItem, redirectToCheckout } = useShoppingCart()
  const { name, price, image, currency } = product

  const imageUrl = new URL(image, import.meta.url).href

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
      <Image
        src={imageUrl}
        sx={{ width: 200, height: 200, objectFit: 'contain' }}
      />
      <Box>
        <h3>{name}</h3>
        <p>{formatCurrencyString({ value: price, currency })}</p>
      </Box>
      <Flex sx={{ flexDirection: 'column' }}>
        <Button
          onClick={() => addItem(product)}
          backgroundColor={'black'}
          marginBottom={10}
        >
          Add To Cart
        </Button>
        <Button onClick={handleCheckout} backgroundColor={'black'}>
          Buy Now
        </Button>
      </Flex>
    </Flex>
  )
}

export default Product
