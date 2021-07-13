import React from "react"
import { useShoppingCart } from "use-shopping-cart"
import CartItem from "./cartItem"

const Cart = () => {
  // TO DO Make the cart a proper modal
  const {
    formattedTotalPrice,
    redirectToCheckout,
    cartCount,
    clearCart,
    cartDetails,
    handleCloseCart,
  } = useShoppingCart()

  return (
    <div className="cartWrapper">
      <button
        onClick={() => {
          handleCloseCart()
        }}
      >
        Close Cart
      </button>
      <h3>Cart</h3>
      {/* This is where we'll render our cart */}
      <p>Number of Items: {cartCount}</p>
      {/* This is where we'll render our items in the cart. USC gives you the products as an object and you need to extract the values from that object. */}
      <ul>
        {Object.values(cartDetails).map(product => (
          <CartItem key={product.id} product={product} />
        ))}
      </ul>
      <p>Total: {formattedTotalPrice}</p>
      {/* Redirects the user to Stripe */}
      <button
        onClick={() => {
          redirectToCheckout()
        }}
      >
        Checkout
      </button>
      <button onClick={clearCart}>Clear cart</button>
    </div>
  )
}

export default Cart
