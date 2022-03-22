import { useEffect, useState } from 'react'
import {
  useShoppingCart,
  DebugCart,
  formatCurrencyString,
  CartActions
} from 'use-shopping-cart'
import { Product, CartEntry as ICartEntry } from 'use-shopping-cart/core'
import products from './data/products.json'

function CartEntry({
  entry,
  removeItem
}: {
  entry: ICartEntry
  removeItem: CartActions['removeItem']
}) {
  return (
    <div>
      <h3>{entry.name}</h3>
      {entry.image ? (
        <img width={100} src={entry.image} alt={entry.description} />
      ) : null}
      <p>
        {entry.quantity} x{' '}
        {formatCurrencyString({ value: entry.price, currency: 'USD' })} ={' '}
        {entry.formattedValue}
      </p>
      <button onClick={() => removeItem(entry.id)}>Remove</button>
    </div>
  )
}

function Cart() {
  const cart = useShoppingCart()
  const {
    removeItem,
    cartDetails,
    clearCart,
    formattedTotalPrice,
    redirectToCheckout
  } = cart
  const [state, setState] = useState<{
    status: 'idle' | 'fetching' | 'redirecting'
    error: null | number | Error
  }>({ status: 'idle', error: null })

  useEffect(() => {
    if (state.status !== 'fetching') return

    const abortController = new AbortController()
    fetch('/.netlify/functions/checkout', {
      method: 'post',
      signal: abortController.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartDetails)
    })
      .then((response) => {
        if (response.status === 200) {
          response.text().then((sessionId) => {
            console.log(sessionId)
            setState({ status: 'redirecting', error: null })
            redirectToCheckout(sessionId)
          })
        } else {
          setState({ status: 'idle', error: response.status })
          console.error(response.status, response)
        }
      })
      .catch((error) => {
        setState({ status: 'idle', error })
        console.error(error)
      })

    return () => {
      abortController.abort()
    }
  }, [state.status, cartDetails, redirectToCheckout])

  const cartEntries = Object.values(cartDetails ?? {}).map((entry) => (
    <CartEntry key={entry.id} entry={entry} removeItem={removeItem} />
  ))

  const cartDisplay =
    cartEntries.length > 0 ? (
      <>
        <button onClick={clearCart}>Clear cart</button>
        <button onClick={() => setState({ status: 'fetching', error: null })}>
          Checkout
        </button>
        {state.error !== null ? (
          <p aria-live="polite">
            An error occurred.{' '}
            {state.error instanceof Error ? state.error.message : state.error}
          </p>
        ) : null}
        {cartEntries}
      </>
    ) : (
      <p aria-live="polite">Cart is empty.</p>
    )

  return (
    <div>
      <h2>Cart</h2>
      <p>Total: {formattedTotalPrice}</p>
      {state.status === 'idle' ? cartDisplay : null}
      {state.status === 'fetching' ? (
        <p aria-live="polite">Sending your cart to Stripe...</p>
      ) : null}
      {state.status === 'redirecting' ? (
        <p aria-live="polite">Redirecting to Stripe...</p>
      ) : null}
    </div>
  )
}

function ProductListing({
  product,
  addItem
}: {
  product: Product
  addItem: CartActions['addItem']
}) {
  return (
    <div key={product.id}>
      <h3>{product.name}</h3>
      {product.image ? (
        <img width={300} src={product.image} alt={product.description} />
      ) : null}
      <p>{formatCurrencyString({ value: product.price, currency: 'USD' })}</p>
      <button
        onClick={() => addItem(product)}
        aria-label={`Add one ${product.name} to your cart.`}
      >
        Add 1 to Cart
      </button>
    </div>
  )
}

function ProductList() {
  const cart = useShoppingCart()
  const { addItem } = cart

  return (
    <div>
      <h2>Products</h2>
      {products.map((product) => (
        <ProductListing key={product.id} product={product} addItem={addItem} />
      ))}
    </div>
  )
}

function App() {
  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <h1>Grocery+ Store</h1>
      <ProductList />
      <br />
      <hr
        style={{
          background: 'grey',
          height: 1,
          width: '100%',
          maxWidth: '20rem'
        }}
      />
      <Cart />
      <DebugCart />
    </div>
  )
}

export default App
