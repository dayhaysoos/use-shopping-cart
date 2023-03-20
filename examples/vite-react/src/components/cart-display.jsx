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

  async function handleSubmit(event) {
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

    redirectToCheckout(response.sessionId)
  }

  async function handleCheckout(event) {
    event.preventDefault()

    const response = await fetch('/.netlify/functions/redirect-to-checkout', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cartDetails)
    })
      .then((res) => res.json())
      .catch((error) => console.log(error))

    console.log('Checkout result:', response)
  }

  if (cartCount === 0) {
    return (
      <Flex
        sx={{
          textAlign: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h2>Shopping Cart Display Panel</h2>
        <p style={{ maxWidth: 300 }}>
          You haven't added any items to your cart yet. That's a shame.
        </p>
      </Flex>
    )
  } else {
    return (
      <Flex
        sx={{
          flexDirection: 'column'
        }}
      >
        <h2>Shopping Cart Display Panel</h2>
        {Object.keys(cartDetails).map((sku, index) => {
          const { name, quantity, image } = cartDetails[sku]
          return (
            <Flex
              key={sku}
              sx={{
                flexDirection: 'column',
                width: '100%',
                marginBottom: 25,
                paddingLeft: 20
              }}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <Image
                  sx={{ width: 50, height: 'auto', marginRight: 10 }}
                  src={image}
                />
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
        <Box>
          <p aria-live="polite" aria-atomic="true">
            Total Item Count: {cartCount}
          </p>
          <p aria-live="polite" aria-atomic="true">
            Total Price: {formattedTotalPrice}
          </p>
        </Box>
        <Button
          sx={{ backgroundColor: 'black' }}
          marginBottom={10}
          onClick={handleSubmit}
        >
          Checkout
        </Button>
        <Button
          sx={{ backgroundColor: 'black' }}
          marginBottom={10}
          onClick={() => clearCart()}
        >
          Clear Cart Items
        </Button>
        <Button sx={{ backgroundColor: 'black' }} onClick={handleCheckout}>
          Redirect To Checkout
        </Button>
      </Flex>
    )
  }
}

export default CartDisplay
