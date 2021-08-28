import React from "react"
import { useShoppingCart } from "use-shopping-cart"

const CartItem = ({ product }) => {
  // TODO Update item quantity, decrement, increment
  //State to hold the quantity of the item
  // const [quantity, setQuantity] = useState(parseInt(product.quantity))
  // const updateQuantity = event => {
  //   setQuantity(parseInt(event.target.value))
  // }
  // Functions from use-shopping-cart
  // const { setItemQuantity } = useShoppingCart()

  const { removeItem } = useShoppingCart()

  return (
    <li>
      <span className="cartProductName">{product.name}</span>,{" "}
      {product.formattedPrice}
      <br />
      <button onClick={() => removeItem(product.id)}> Remove item </button>
    </li>
  )
}

export default CartItem
