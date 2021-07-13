import React from "react"
import { useShoppingCart } from "use-shopping-cart"

const DebugCart = () => {
  /* Gets the totalPrice and a method for redirecting to stripe */
  const {
    formattedTotalPrice,
    redirectToCheckout,
    cartCount,
    clearCart,
    cartDetails,
  } = useShoppingCart()

  return (
    <div>
      <h3>Debug cart</h3>
      <h4>Items in cart: {cartCount}</h4>
      <h4>Total price: {formattedTotalPrice}</h4>
      <h4>Cart details</h4>
      <pre>{JSON.stringify(cartDetails, null, 2)}</pre>
      <button onClick={() => redirectToCheckout()}>Checkout</button>
      <button onClick={clearCart}>Clear cart</button>
    </div>
  )
}

export default DebugCart
