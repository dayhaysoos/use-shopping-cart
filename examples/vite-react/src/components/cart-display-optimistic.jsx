import React from 'react'
import { Box, Flex, Image, Button, Input } from 'theme-ui'
import { useOptimisticCart } from 'use-shopping-cart'

const CartDisplayOptimistic = () => {
  const {
    cartDetails,
    cartCount,
    formattedTotalPrice,
    redirectToCheckout,
    clearCart,
    setItemQuantity,
    isOptimistic
  } = useOptimisticCart()

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
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Shopping Cart Display Panel</h2>
          {isOptimistic && (
            <Box
              sx={{
                fontSize: 12,
                color: 'gray',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span>🔄</span>
              Syncing...
            </Box>
          )}
        </Flex>

        {Object.keys(cartDetails).map((sku, index) => {
          const { name, quantity, image, _optimistic } = cartDetails[sku]
          return (
            <Flex
              key={sku}
              sx={{
                flexDirection: 'column',
                width: '100%',
                marginBottom: 25,
                paddingLeft: 20,
                opacity: _optimistic ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <Flex
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Flex sx={{ alignItems: 'center' }}>
                  <Image
                    sx={{ width: 50, height: 'auto', marginRight: 10 }}
                    src={image}
                  />
                  <p>{name}</p>
                </Flex>
                {_optimistic && (
                  <Box
                    sx={{
                      fontSize: 11,
                      color: 'blue',
                      fontStyle: 'italic'
                    }}
                  >
                    updating...
                  </Box>
                )}
              </Flex>
              <Input
                type={'number'}
                max={99}
                sx={{ width: 60 }}
                value={quantity}
                disabled={isOptimistic}
                onChange={(event) => {
                  setItemQuantity(sku, event.target.valueAsNumber)
                }}
              />
            </Flex>
          )
        })}
        <Box>
          <p aria-live="polite" aria-atomic="true">
            Total Item Count:{' '}
            <span style={{ opacity: isOptimistic ? 0.7 : 1 }}>{cartCount}</span>
          </p>
          <p aria-live="polite" aria-atomic="true">
            Total Price:{' '}
            <span style={{ opacity: isOptimistic ? 0.7 : 1 }}>
              {formattedTotalPrice}
            </span>
          </p>
        </Box>
        <Button
          sx={{ backgroundColor: 'black' }}
          marginBottom={10}
          onClick={handleSubmit}
          disabled={isOptimistic}
        >
          Checkout
        </Button>
        <Button
          sx={{ backgroundColor: 'black' }}
          marginBottom={10}
          onClick={() => clearCart()}
          disabled={isOptimistic}
        >
          {isOptimistic ? 'Clearing...' : 'Clear Cart Items'}
        </Button>
        <Button
          sx={{ backgroundColor: 'black' }}
          onClick={handleCheckout}
          disabled={isOptimistic}
        >
          Redirect To Checkout
        </Button>
      </Flex>
    )
  }
}

export default CartDisplayOptimistic
