import React from 'react'
import { Box, Flex, Image, Button, Input } from 'theme-ui'
import { useShoppingCart } from 'use-shopping-cart'

const CartDisplay = () => {
  const {
    cartDetails,
    cartCount,
    formattedTotalPrice,
    redirectToCheckout,
    clearCart,
    setItemQuantity
  } = useShoppingCart()

  const handleSubmit = async (event) => {
    event.preventDefault()

    const response = await fetch('/.netlify/functions/create-session', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cartDetails)
    })
      .then((res) => res.json())
      .catch((error) => console.log(error))

    redirectToCheckout({ sessionId: response.sessionId })
  }

  if (cartCount === 0) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <h2>Shopping Cart Display Panel</h2>
        <h3>No items in cart</h3>
      </Box>
    )
  } else {
    return (
      <Flex
        sx={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <h2>Shopping Cart Display Panel</h2>
        {Object.keys(cartDetails).map((sku) => {
          const { name, quantity, image } = cartDetails[sku]
          return (
            <Flex
              key={sku}
              sx={{
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image sx={{ width: 100 }} src={image} />
                <p>{name}</p>
              </Flex>
              <Input
                type={'number'}
                max={99}
                sx={{ width: 60 }}
                value={quantity}
                onChange={(event) => {
                  setItemQuantity(sku, event.target.valueAsNumber)
                }}
              />
            </Flex>
          )
        })}
        <h3>Total Items in Cart: {cartCount}</h3>
        <h3>Total Price: {formattedTotalPrice}</h3>
        <Box
          as={'form'}
          action={'/.netlify/functions/create-session'}
          method="POST"
        >
          <Button sx={{ backgroundColor: 'black' }} onClick={handleSubmit}>
            Checkout
          </Button>
        </Box>
        <Button sx={{ backgroundColor: 'black' }} onClick={() => clearCart()}>
          Clear Cart Items
        </Button>
      </Flex>
    )
  }
}

export default CartDisplay
