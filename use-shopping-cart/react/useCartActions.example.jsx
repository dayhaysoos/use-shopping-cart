import { useCartActions, useShoppingCart } from 'use-shopping-cart'

export function ProductCard({ product }) {
  const { addToCartAction, addItemState, isAddingItem } = useCartActions()

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price / 100}</p>

      <form action={addToCartAction}>
        <input type="hidden" name="product" value={JSON.stringify(product)} />
        <input type="hidden" name="count" value="1" />

        <button disabled={isAddingItem}>
          {isAddingItem ? 'Adding...' : 'Add to Cart'}
        </button>

        {addItemState.status === 'error' && (
          <p className="error">{addItemState.error}</p>
        )}

        {addItemState.status === 'success' && (
          <p className="success">Added to cart!</p>
        )}
      </form>
    </div>
  )
}

export function QuantityForm({ itemId, currentQuantity }) {
  const { updateQuantityAction, updateQuantityState, isUpdatingQuantity } =
    useCartActions()

  return (
    <form action={updateQuantityAction}>
      <input type="hidden" name="itemId" value={itemId} />

      <input
        type="number"
        name="quantity"
        min="0"
        defaultValue={currentQuantity}
        disabled={isUpdatingQuantity}
      />

      <button type="submit" disabled={isUpdatingQuantity}>
        {isUpdatingQuantity ? 'Updating...' : 'Update'}
      </button>

      {updateQuantityState.status === 'error' && (
        <p className="error">{updateQuantityState.error}</p>
      )}
    </form>
  )
}

export function QuantityControls({ itemId }) {
  const { incrementItemAction, decrementItemAction, isPending } =
    useCartActions()

  return (
    <div className="quantity-controls">
      <form action={decrementItemAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="count" value="1" />
        <button disabled={isPending}>-</button>
      </form>

      <form action={incrementItemAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="count" value="1" />
        <button disabled={isPending}>+</button>
      </form>
    </div>
  )
}

export function RemoveItemButton({ itemId }) {
  const { removeFromCartAction, isRemovingItem } = useCartActions()

  return (
    <form action={removeFromCartAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <button disabled={isRemovingItem}>
        {isRemovingItem ? 'Removing...' : 'Remove'}
      </button>
    </form>
  )
}

export function ClearCartButton() {
  const { clearCartAction, isClearingCart } = useCartActions()

  return (
    <form action={clearCartAction}>
      <button disabled={isClearingCart}>
        {isClearingCart ? 'Clearing...' : 'Clear Cart'}
      </button>
    </form>
  )
}

export function ProductCardComparison({ product }) {
  const { addItem: addItemClick } = useShoppingCart()

  const { addToCartAction, isAddingItem } = useCartActions()

  return (
    <div>
      <button onClick={() => addItemClick(product)}>Add to Cart (Click)</button>

      <form action={addToCartAction}>
        <input type="hidden" name="product" value={JSON.stringify(product)} />
        <button disabled={isAddingItem}>
          {isAddingItem ? 'Adding...' : 'Add to Cart (Form)'}
        </button>
      </form>
    </div>
  )
}

export function AddWithQuantityForm({ product }) {
  const { addToCartAction, addItemState, isAddingItem } = useCartActions()

  return (
    <form action={addToCartAction}>
      <input type="hidden" name="product" value={JSON.stringify(product)} />

      <label>
        Quantity:
        <input
          type="number"
          name="count"
          min="1"
          defaultValue="1"
          disabled={isAddingItem}
        />
      </label>

      <button disabled={isAddingItem}>
        {isAddingItem ? 'Adding...' : 'Add to Cart'}
      </button>

      {addItemState.error && <div className="error">{addItemState.error}</div>}
    </form>
  )
}

export function ProductCardNextJS({ product }) {
  const { addToCartAction, addItemState, isAddingItem } = useCartActions()

  return (
    <form action={addToCartAction}>
      <input type="hidden" name="product" value={JSON.stringify(product)} />

      <button type="submit" disabled={isAddingItem}>
        {isAddingItem ? 'Adding...' : 'Add to Cart'}
      </button>

      {addItemState.status === 'success' && (
        <p className="success">✓ Added to cart</p>
      )}

      {addItemState.error && <p className="error">✗ {addItemState.error}</p>}
    </form>
  )
}
