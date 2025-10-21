import React from 'react'
import { Box, Image, Button, Flex } from 'theme-ui'
import { useCartActions, formatCurrencyString } from 'use-shopping-cart'

// Example: Product card using form actions instead of onClick
const ProductFormAction = (product) => {
  const { addToCartAction, addItemState, isAddingItem } = useCartActions()
  const { name, price, image, currency } = product

  const imageUrl = new URL(image, import.meta.url).href

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

      <form action={addToCartAction}>
        <input type="hidden" name="product" value={JSON.stringify(product)} />
        <input type="hidden" name="count" value="1" />

        <Button
          type="submit"
          backgroundColor={'black'}
          disabled={isAddingItem}
          sx={{
            opacity: isAddingItem ? 0.6 : 1,
            cursor: isAddingItem ? 'not-allowed' : 'pointer'
          }}
        >
          {isAddingItem ? 'Adding...' : 'Add To Cart'}
        </Button>

        {addItemState.status === 'success' && (
          <Box sx={{ fontSize: 12, color: 'green', marginTop: 5 }}>
            ✓ Added!
          </Box>
        )}

        {addItemState.error && (
          <Box sx={{ fontSize: 12, color: 'red', marginTop: 5 }}>
            {addItemState.error}
          </Box>
        )}
      </form>
    </Flex>
  )
}

export default ProductFormAction
