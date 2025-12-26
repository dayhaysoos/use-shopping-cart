/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import {
  CartProvider,
  useShoppingCart,
  useOptimisticCart,
  useCartActions
} from '../react/index'

/**
 * Test that useShoppingCart returns expected state properties
 */
function TestUseShoppingCartState() {
  const cart = useShoppingCart()

  // State properties should exist and have correct types
  const count: number = cart.cartCount
  const total: number = cart.totalPrice
  const formatted: string = cart.formattedTotalPrice
  const currency: string = cart.currency
  const language: string = cart.language
  const displayCart: boolean = cart.shouldDisplayCart
  const lastClicked: string = cart.lastClicked
  const shouldPersist: boolean = cart.shouldPersist

  // Optional stripe key
  const stripeKey: string | undefined = cart.stripe

  // Cart details
  const details = cart.cartDetails
  if (details !== undefined) {
    const cartEntry = details['id_banana001']
    if (cartEntry) {
      const value: number = cartEntry.value
      const formattedValue: string = cartEntry.formattedValue
      const id: string = cartEntry.id
      const name: string = cartEntry.name
      const price: number = cartEntry.price
      const quantity: number = cartEntry.quantity
      const timestamp: string = cartEntry.timestamp
      const formattedPrice: string = cartEntry.formattedPrice

      // Optional properties
      const description: string | undefined = cartEntry.description
      const image: string | undefined = cartEntry.image
    }
  }

  return null
}

/**
 * Test that useShoppingCart returns expected action methods
 */
function TestUseShoppingCartActions() {
  const cart = useShoppingCart()

  React.useEffect(() => {
    // Load cart
    cart.loadCart({
      some_product: {
        name: 'Some Product',
        price: 400,
        currency: 'USD',
        id: 'some_product',
        quantity: 5,
        value: 2000,
        formattedValue: '$20.00',
        formattedPrice: '$4.00',
        timestamp: new Date().toISOString(),
        price_data: {},
        product_data: {}
      }
    })

    // Load cart with shouldMerge = false
    cart.loadCart({}, false)

    // Add item with minimal product
    cart.addItem({
      name: 'Bananas',
      price: 400,
      currency: 'USD'
    })

    // Add item with full product
    cart.addItem(
      {
        name: 'Bananas',
        description: 'Yummy yellow fruit',
        id: 'id_banana001',
        price: 400,
        currency: 'USD',
        image: 'https://my-image.com/banana.jpg'
      },
      {
        count: 2,
        price_metadata: { type: 'fruit' },
        product_metadata: { organic: true }
      }
    )

    // Increment/decrement
    cart.incrementItem('id_banana001')
    cart.incrementItem('id_banana001', { count: 4 })
    cart.decrementItem('id_banana001')
    cart.decrementItem('id_banana001', { count: 2 })

    // Set quantity
    cart.setItemQuantity('id_banana001', 10)

    // Remove
    cart.removeItem('id_banana001')

    // Clear
    cart.clearCart()

    // UI helpers
    cart.storeLastClicked('id_banana001')
    cart.handleCartHover()
    cart.handleCloseCart()
    cart.handleCartClick()

    // Config changes
    cart.changeStripeKey('pk_test_123')
    cart.changeLanguage('ja')
    cart.changeCurrency('JPY')

    // Redirect to checkout (requires sessionId now)
    cart.redirectToCheckout('sess_123').catch(() => {})
  }, [])

  return <p>Actions!</p>
}

/**
 * Test that useShoppingCart does NOT accept a selector parameter
 * (The old API had a selector, but the new implementation doesn't)
 */
function TestNoSelector() {
  // This should work - no selector
  const cart = useShoppingCart()

  // @ts-expect-error - selector param should NOT exist in new API
  const cartWithSelector = useShoppingCart((state) => state.cartCount)

  return null
}

/**
 * Test useOptimisticCart hook
 */
function TestUseOptimisticCart() {
  const cart = useOptimisticCart()

  // Should have all the same properties as useShoppingCart
  const count: number = cart.cartCount
  const total: number = cart.totalPrice
  const formatted: string = cart.formattedTotalPrice

  // Plus the isOptimistic flag
  const isOptimistic: boolean = cart.isOptimistic

  // Methods should exist
  cart.addItem({ name: 'Test', price: 100, currency: 'USD' })
  cart.removeItem('test')
  cart.incrementItem('test')
  cart.decrementItem('test')
  cart.setItemQuantity('test', 5)
  cart.clearCart()

  return null
}

/**
 * Test useCartActions hook
 */
function TestUseCartActions() {
  const {
    // Add item
    addToCartAction,
    addItemState,
    isAddingItem,

    // Remove item
    removeFromCartAction,
    removeItemState,
    isRemovingItem,

    // Update quantity
    updateQuantityAction,
    updateQuantityState,
    isUpdatingQuantity,

    // Increment
    incrementItemAction,
    incrementItemState,
    isIncrementingItem,

    // Decrement
    decrementItemAction,
    decrementItemState,
    isDecrementingItem,

    // Clear cart
    clearCartAction,
    clearCartState,
    isClearingCart,

    // Global pending
    isPending
  } = useCartActions()

  // Type checks for state objects
  const addStatus: 'idle' | 'success' | 'error' = addItemState.status
  const addError: string | null = addItemState.error
  const productId: string | null = addItemState.productId

  const removeStatus: 'idle' | 'success' | 'error' = removeItemState.status
  const itemId: string | null = removeItemState.itemId

  const updateStatus: 'idle' | 'success' | 'error' = updateQuantityState.status
  const quantity: number | null = updateQuantityState.quantity

  // Type checks for pending states
  const pending1: boolean = isAddingItem
  const pending2: boolean = isRemovingItem
  const pending3: boolean = isUpdatingQuantity
  const pending4: boolean = isIncrementingItem
  const pending5: boolean = isDecrementingItem
  const pending6: boolean = isClearingCart
  const pending7: boolean = isPending

  return (
    <form action={addToCartAction}>
      <input
        type="hidden"
        name="product"
        value='{"name":"Test","price":100,"currency":"USD"}'
      />
      <button disabled={isPending}>Add to Cart</button>
    </form>
  )
}

/**
 * Test CartProvider props
 */
function TestCartProviderProps() {
  return (
    <>
      {/* Minimal props */}
      <CartProvider>
        <div>Children</div>
      </CartProvider>

      {/* With shouldPersist */}
      <CartProvider shouldPersist={false}>
        <div>Children</div>
      </CartProvider>

      {/* With all props */}
      <CartProvider
        stripe="pk_test_123"
        currency="USD"
        language="en-US"
        shouldPersist={true}
        persistKey="my-cart"
        loading={<p>Loading...</p>}
      >
        <div>Children</div>
      </CartProvider>
    </>
  )
}

function App() {
  return (
    <>
      <CartProvider shouldPersist={false}>
        <TestUseShoppingCartState />
        <TestUseShoppingCartActions />
        <TestUseOptimisticCart />
        <TestUseCartActions />
      </CartProvider>
      <TestCartProviderProps />
    </>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(<App />)
}
