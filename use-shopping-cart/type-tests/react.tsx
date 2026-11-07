import * as React from 'react'
import { createRoot } from 'react-dom/client'
import {
  CartProvider,
  useShoppingCart,
  useOptimisticCart,
  useCartActions,
  redirectToCheckout,
  type CartChange,
  type CartDetails,
  type UseShoppingCartReturn
} from 'use-shopping-cart'

function TestUseShoppingCartState() {
  const cart = useShoppingCart()

  const count: number = cart.cartCount
  const total: number = cart.totalPrice
  const formatted: string = cart.formattedTotalPrice
  const currency: string = cart.currency
  const language: string = cart.language
  const displayCart: boolean = cart.shouldDisplayCart
  const lastClicked: string = cart.lastClicked
  // @ts-expect-error shouldPersist is config, not state
  cart.shouldPersist

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

      const description: string | undefined = cartEntry.description
      const image: string | undefined = cartEntry.image
    }
  }

  return null
}

function TestUseShoppingCartActions() {
  const cart = useShoppingCart()

  React.useEffect(() => {
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

    cart.loadCart({}, false)

    cart.addItem({
      name: 'Bananas',
      price: 400,
      currency: 'USD'
    })

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

    cart.incrementItem('id_banana001')
    cart.incrementItem('id_banana001', { count: 4 })
    cart.decrementItem('id_banana001')
    cart.decrementItem('id_banana001', { count: 2 })

    cart.setItemQuantity('id_banana001', 10)

    cart.removeItem('id_banana001')

    cart.clearCart()

    cart.storeLastClicked('id_banana001')
    cart.handleCartHover()
    cart.handleCloseCart()
    cart.handleCartClick()

    cart.changeLanguage('ja')
    cart.changeCurrency('JPY')

    redirectToCheckout('https://checkout.stripe.com/c/pay/cs_test_123')
  }, [cart])

  return <p>Actions!</p>
}

function TestUseShoppingCartSelector() {
  const count: number = useShoppingCart((cart) => cart.cartCount)
  const addItem = useShoppingCart((cart) => cart.addItem)
  addItem({ id: 'a', name: 'A', price: 1, currency: 'USD' })
  // @ts-expect-error the selector's return type is inferred
  const wrong: string = useShoppingCart((cart) => cart.cartCount)
  return <span>{count + wrong}</span>
}

function TestUseOptimisticCart() {
  const cart = useOptimisticCart()

  const count: number = cart.cartCount
  const total: number = cart.totalPrice
  const formatted: string = cart.formattedTotalPrice

  const isOptimistic: boolean = cart.isOptimistic

  cart.addItem({ name: 'Test', price: 100, currency: 'USD' })
  cart.removeItem('test')
  cart.incrementItem('test')
  cart.decrementItem('test')
  cart.setItemQuantity('test', 5)
  cart.clearCart()

  const error: unknown = cart.error
  const optimisticDetails: CartDetails = cart.cartDetails
  const pending: ReadonlySet<string> = cart.pendingIds
  const asCart: UseShoppingCartReturn = cart
  void optimisticDetails
  void pending
  void asCart

  const synced = useOptimisticCart({
    onChange: async (change: CartChange) => {
      if (change.type === 'add') {
        const id: string | undefined = change.product.id
        const count: number = change.count
        await fetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ id, count })
        })
      }
      if (change.type === 'adjust') {
        const by: number = change.by
        void by
      }
    }
  })
  synced.addItem({ name: 'Test', price: 100, currency: 'USD' })

  // @ts-expect-error onChange must be a function
  useOptimisticCart({ onChange: 'nope' })

  return null
}

function TestUseCartActions() {
  const {
    addToCartAction,
    addItemState,
    isAddingItem,

    removeFromCartAction,
    removeItemState,
    isRemovingItem,

    updateQuantityAction,
    updateQuantityState,
    isUpdatingQuantity,

    incrementItemAction,
    incrementItemState,
    isIncrementingItem,

    decrementItemAction,
    decrementItemState,
    isDecrementingItem,

    clearCartAction,
    clearCartState,
    isClearingCart,

    isPending
  } = useCartActions()

  const addStatus: 'idle' | 'success' | 'error' = addItemState.status
  const addError: string | null = addItemState.error
  const productId: string | null = addItemState.productId

  const removeStatus: 'idle' | 'success' | 'error' = removeItemState.status
  const itemId: string | null = removeItemState.itemId

  const updateStatus: 'idle' | 'success' | 'error' = updateQuantityState.status
  const quantity: number | null = updateQuantityState.quantity

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

function TestCartProviderProps() {
  return (
    <>
      <CartProvider>
        <div>Children</div>
      </CartProvider>

      <CartProvider shouldPersist={false}>
        <div>Children</div>
      </CartProvider>

      <CartProvider
        currency="USD"
        language="en-US"
        shouldPersist={true}
        persistKey="my-cart"
      >
        <div>Children</div>
      </CartProvider>

      {/* @ts-expect-error loading was removed; CartProvider renders its children on the server */}
      <CartProvider loading={<p>Loading...</p>}>
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
