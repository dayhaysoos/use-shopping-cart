/**@jsx jsx */
import { jsx, Box, Flex, Image, Button } from 'theme-ui';
import { useShoppingCart } from 'use-shopping-cart';

const CartDisplay = () => {
  const {
    cartDetails,
    cartItems,
    cartCount,
    addItem,
    removeCartItem,
    totalPrice,
    redirectToCheckout,
    reduceItemByOne,
    clearCart,
  } = useShoppingCart();

    console.log(clearCart)
    
  const handleSubmit = async (event) => {
    event.preventDefault();


    const response = await fetch('/.netlify/functions/create-session', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartDetails),
    })
      .then((res) => {
        return res.json();
      })
      .catch((error) => console.log(error));

    redirectToCheckout({ sessionId: response.sessionId });
  };

  if (Object.keys(cartDetails).length === 0) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <h2>Shopping Cart Display Panel</h2>
        <h3>No items in cart</h3>
      </Box>
    );
  } else {
    return (
      <Flex
        sx={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2>Shopping Cart Display Panel</h2>
        {Object.keys(cartDetails).map((item) => {
          const cartItem = cartDetails[item];
          const { name, sku, formattedValue, quantity } = cartItem;
          return (
            <Flex
              key={cartItem.sku}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image sx={{ width: 100 }} src={cartItem.image} />
                <p>{name}</p>
              </Flex>
              <Box>
                <span sx={{ display: 'block' }}>Price: {formattedValue}</span>
                <span sx={{ display: 'block' }}>qty: {quantity}</span>
                <Button
                  backgroundColor={'black'}
                  onClick={() => addItem(cartItem)}
                >
                  +
                </Button>
                <Button
                  backgroundColor={'black'}
                  onClick={() => reduceItemByOne(sku)}
                >
                  -
                </Button>
              </Box>
            </Flex>
          );
        })}
        <h3>Total Items in Cart: {cartCount}</h3>
        <h3>Total Price: {totalPrice()}</h3>
        <Box
          as={'form'}
          action={'/.netlify/functions/create-session'}
          method="POST"
        >
          <Button sx={{ backgroundColor: 'black' }} onClick={handleSubmit}>
            Checkout
          </Button>
          
        </Box>
        <Button sx={{backgroundColor: 'black'}} onClick={() => clearCart()}>Clear Cart Items</Button>
      </Flex>
    );
  }
};

export default CartDisplay;
