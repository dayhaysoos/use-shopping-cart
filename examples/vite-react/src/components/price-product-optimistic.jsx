import React from 'react'
import { Box, Image, Button, Flex } from 'theme-ui'
import { useOptimisticCart, formatCurrencyString } from 'use-shopping-cart'

const PriceProductOptimistic = (product) => {
  const { addItem, cartDetails } = useOptimisticCart()
  const { name, price, image, currency, price_id } = product

  // Check if this specific item is being optimistically updated
  const itemInCart = cartDetails[price_id]
  const isThisItemOptimistic = itemInCart?._optimistic === true

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
        src={image}
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
      </Flex>
    </Flex>
  )
}

export default PriceProductOptimistic
