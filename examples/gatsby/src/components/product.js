import React from "react"
import { GatsbyImage } from "gatsby-plugin-image"
import { useShoppingCart, formatCurrencyString } from "use-shopping-cart"

const ProductCard = ({ product }) => {
  const { addItem, checkoutSingleItem } = useShoppingCart()

  return (
    <div className="productCardWrapper">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <GatsbyImage image={product.image} alt={product.name} />
      <p>
        Price:{" "}
        {formatCurrencyString({
          value: parseInt(product.price, 10),
          currency: product.currency,
        })}
      </p>
      <button onClick={() => addItem(product)}>Add to cart</button>
      <button
        onClick={() => checkoutSingleItem({ productId: product.price_id })}
      >
        Buy now
      </button>
    </div>
  )
}

export default ProductCard
