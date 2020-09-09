const { useShoppingCart } = UseShoppingCart
import { jsx } from './utils.js'

const products = [
  {
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    sku: 'sku_banana001',
    price: 400,
    currency: 'USD',
    image: 'https://my-image.com/banana.jpg'
  }
]

export function ProductList({ products }) {
  const { addItem } = useShoppingCart()

  return jsx`
    <h2 key="title">Products</h2>
    ${products.map(
      (product) => jsx`
      <article key=${product.sku}>
        <p>${product.name}</p>
        <button onClick=${() => addItem(product)}>Add to cart</button>
      </article>
    `
    )}
  `
}

ProductList.defaultProps = { products }
