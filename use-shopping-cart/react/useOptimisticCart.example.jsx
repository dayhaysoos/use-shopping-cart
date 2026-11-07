import { useOptimisticCart } from 'use-shopping-cart'

async function syncCart(change) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(change)
  })
  if (!res.ok) throw new Error('Could not update cart')
}

export function ProductCard({ product }) {
  const { addItem, isOptimistic } = useOptimisticCart({ onChange: syncCart })

  const handleAddToCart = () => {
    addItem(product, { count: 1 })
  }

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price / 100}</p>

      <button onClick={handleAddToCart} disabled={isOptimistic}>
        {isOptimistic ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  )
}

export function CartItem({ item }) {
  const { incrementItem, decrementItem, removeItem, isOptimistic, pendingIds } =
    useOptimisticCart({ onChange: syncCart })

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div>
        <h4>{item.name}</h4>
        <p>{item.formattedPrice}</p>
      </div>

      <div className="quantity-controls">
        <button onClick={() => decrementItem(item.id)} disabled={isOptimistic}>
          -
        </button>

        <span className={isOptimistic ? 'updating' : ''}>{item.quantity}</span>

        <button onClick={() => incrementItem(item.id)} disabled={isOptimistic}>
          +
        </button>
      </div>

      <button onClick={() => removeItem(item.id)} disabled={isOptimistic}>
        Remove
      </button>

      {pendingIds.has(item.id) && (
        <small className="optimistic-badge">Updating...</small>
      )}
    </div>
  )
}

export function ShoppingCart() {
  const {
    cartDetails,
    cartCount,
    formattedTotalPrice,
    clearCart,
    isOptimistic
  } = useOptimisticCart({ onChange: syncCart })

  const items = Object.values(cartDetails)

  if (items.length === 0) {
    return <div>Your cart is empty</div>
  }

  return (
    <div className="shopping-cart">
      <h2>Your Cart ({cartCount} items)</h2>

      {isOptimistic && (
        <div className="optimistic-indicator">🔄 Syncing changes...</div>
      )}

      <div className="cart-items">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-footer">
        <div className="total">
          <strong>Total:</strong>
          <span className={isOptimistic ? 'updating' : ''}>
            {formattedTotalPrice}
          </span>
        </div>

        <button onClick={clearCart} disabled={isOptimistic}>
          Clear Cart
        </button>

        <button className="checkout-button" disabled={isOptimistic}>
          Checkout
        </button>
      </div>
    </div>
  )
}

export function ProductCardComparison({ product }) {
  const { addItem, isOptimistic } = useOptimisticCart({ onChange: syncCart })

  return (
    <button onClick={() => addItem(product)}>
      {isOptimistic ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}

export function ProductCardAdvanced({ product }) {
  const { addItem, cartDetails, pendingIds } = useOptimisticCart({
    onChange: syncCart
  })

  const itemInCart = cartDetails[product.id]
  const isThisItemOptimistic = pendingIds.has(product.id)

  const handleAddToCart = () => {
    addItem(product, { count: 1 })
  }

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price / 100}</p>

      {itemInCart && (
        <div className="in-cart-badge">
          In cart: {itemInCart.quantity}
          {isThisItemOptimistic && ' (updating...)'}
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isThisItemOptimistic}
        className={isThisItemOptimistic ? 'adding' : ''}
      >
        {isThisItemOptimistic ? (
          <>
            <Spinner />
            Adding...
          </>
        ) : (
          'Add to Cart'
        )}
      </button>
    </div>
  )
}

export function QuantityForm({ itemId }) {
  const { setItemQuantity, cartDetails, isOptimistic } = useOptimisticCart({
    onChange: syncCart
  })
  const item = cartDetails[itemId]

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const quantity = parseInt(formData.get('quantity'))
    setItemQuantity(itemId, quantity)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        name="quantity"
        min="0"
        defaultValue={item?.quantity || 0}
        disabled={isOptimistic}
      />
      <button type="submit" disabled={isOptimistic}>
        {isOptimistic ? 'Updating...' : 'Update'}
      </button>
    </form>
  )
}

function Spinner() {
  return (
    <svg className="spinner" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
