import React from 'react'
import { Box, Image, Button, Flex } from 'theme-ui'
import { useOptimisticCart, formatCurrencyString } from 'use-shopping-cart'

const ProductOptimistic = (product) => {
  const { addItem, redirectToCheckout, cartDetails, isOptimistic } =
    useOptimisticCart()
  const { name, price, image, currency } = product

  const imageUrl = new URL(image, import.meta.url).href

  // Check if this specific item is being optimistically updated
  const itemInCart = cartDetails[product.id]
  const isThisItemOptimistic = itemInCart?._optimistic === true

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
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Image
        src={imageUrl}
        sx={{ width: 200, height: 200, objectFit: 'contain' }}
      />
      <Box>
        <h3>{name}</h3>
        <p>{formatCurrencyString({ value: price, currency })}</p>
        {itemInCart && (
          <Box
            sx={{
              fontSize: 12,
              color: isThisItemOptimistic ? 'blue' : 'green',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            In cart: {itemInCart.quantity}
            {isThisItemOptimistic && ' (updating...)'}
          </Box>
        )}
      </Box>
      <Flex sx={{ flexDirection: 'column' }}>
        <Button
          onClick={() => addItem(product)}
          backgroundColor={'black'}
          marginBottom={10}
          disabled={isThisItemOptimistic}
          sx={{
            opacity: isThisItemOptimistic ? 0.6 : 1,
            cursor: isThisItemOptimistic ? 'not-allowed' : 'pointer'
          }}
        >
          {isThisItemOptimistic ? 'Adding...' : 'Add To Cart'}
        </Button>
        <Button
          onClick={handleCheckout}
          backgroundColor={'black'}
          disabled={isOptimistic}
        >
          Buy Now
        </Button>
      </Flex>
    </Flex>
  )
}

export default ProductOptimistic
