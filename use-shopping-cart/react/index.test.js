import React from 'react'

import { act, renderHook } from '@testing-library/react-hooks'
import { render, screen, getByRole } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { CartProvider, useShoppingCart, DebugCart } from './index'

const expectedInitialCartState = {
  cartDetails: {},
  totalPrice: 0,
  formattedTotalPrice: '$0.00',
  cartCount: 0,
  shouldDisplayCart: false
}

let counter = 0
function mockProduct(overrides) {
  return {
    id: `sku_abc${counter++}`,
    name: 'blah bleh bloo',
    price: Math.floor(Math.random() * 1000 + 1),
    image: 'https://blah.com/bleh',
    alt: 'a bleh glowing under a soft sunrise',
    currency: 'usd',
    ...overrides
  }
}

function mockCartDetails(overrides1, overrides2) {
  return {
    [`id_abc${counter}`]: {
      id: `id_abc${counter++}`,
      name: 'Bananas',
      image: 'https://blah.com/banana.avif',
      price: 400,
      currency: 'USD',
      value: 800,
      quantity: 2,
      formattedValue: '$8.00',
      ...overrides1
    },
    [`id_efg${counter}`]: {
      id: `id_efg${counter++}`,
      name: 'Oranges',
      image: 'https://blah.com/orange.avif',
      currency: 'USD',
      price: 250,
      value: 1000,
      quantity: 4,
      formattedValue: '$10.00',
      ...overrides2
    }
  }
}

afterEach(() => window.localStorage.clear())

const stripeMock = {
  redirectToCheckout: jest.fn().mockReturnValue(() => Promise.resolve())
}

const createWrapper = (overrides = {}) => ({ children }) => (
  <CartProvider
    mode="client-only"
    successUrl="https://egghead.io/success"
    cancelUrl="https://egghead.io/cancel"
    stripe={null}
    currency="USD"
    {...overrides}
  >
    {children}
  </CartProvider>
)

describe.skip('useShoppingCart()', () => {
  const wrapper = createWrapper()
  let cart
  function reload() {
    cart = renderHook(() => useShoppingCart((state) => state), { wrapper })
      .result
  }
  beforeEach(() => reload())

  it('initial state', () => {
    expect(cart.current).toMatchObject(expectedInitialCartState)
  })

  describe.skip('shouldDisplayCart', () => {
    it('shouldDisplayCart should be false by default', () => {
      expect(cart.current.shouldDisplayCart).toBeFalsy()
    })

    it('should set shouldDisplayCart to true after running handleCartClick() once', () => {
      act(() => {
        cart.current.handleCartClick()
      })

      expect(cart.current.shouldDisplayCart).toBe(true)
    })

    it('handleCartClick() toggles value', () => {
      act(() => {
        cart.current.handleCartClick()
      })
      expect(cart.current.shouldDisplayCart).toBe(true)

      act(() => {
        cart.current.handleCartClick()
      })
      expect(cart.current.shouldDisplayCart).toBe(false)
    })

    it.todo('handleCartHover()')

    it('handleCloseCart() closes cart', () => {
      act(() => {
        cart.current.handleCloseCart()
      })
      expect(cart.current.shouldDisplayCart).toBe(false)
    })
  })

  describe.skip('addItem()', () => {
    it('adds an item to the cart', () => {
      const product = mockProduct({ price: 200 })

      act(() => {
        cart.current.addItem(product)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.id)
      const entry = cart.current.cartDetails[product.id]

      expect(entry.quantity).toBe(1)
      expect(entry.value).toBe(product.price)
      expect(entry.formattedValue).toBe('$2.00')
      expect(entry).toMatchObject(product)

      expect(cart.current.cartCount).toBe(1)
      expect(cart.current.totalPrice).toBe(200)
    })

    it('adds `count` amount of items to the cart', () => {
      let product
      let count = 1

      while (count <= 50) {
        product = mockProduct()
        act(() => {
          cart.current.addItem(product, { count: 1 })
        })
        count++
      }

      expect(cart.current.cartDetails).toHaveProperty(product.id)
      const entry = cart.current.cartDetails[product.id]

      const totalValue = Object.keys(cart.current.cartDetails)
        .map((item) => cart.current.cartDetails[item].value)
        .reduce((acc, current) => acc + current)

      expect(cart.current.cartCount).toBe(50)
      expect(cart.current.totalPrice).toBe(totalValue)
    })

    it('adds multiple different items to the cart', () => {
      const product1 = mockProduct({ price: 400 })
      const product2 = mockProduct({ price: 100 })

      act(() => {
        cart.current.addItem(product1)
        cart.current.addItem(product2)
      })

      expect(cart.current.cartDetails).toHaveProperty(product1.id)
      const entry1 = cart.current.cartDetails[product1.id]

      expect(entry1.quantity).toBe(1)
      expect(entry1.value).toBe(product1.price)

      expect(cart.current.cartDetails).toHaveProperty(product2.id)
      const entry2 = cart.current.cartDetails[product2.id]

      expect(entry2.quantity).toBe(1)
      expect(entry2.value).toBe(product2.price)

      expect(cart.current.cartCount).toBe(2)
      expect(cart.current.totalPrice).toBe(500)
    })

    it('adds multiple of the same item to the cart', () => {
      const product = mockProduct({ price: 325 })

      act(() => {
        cart.current.addItem(product)
        cart.current.addItem(product)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.id)
      const entry = cart.current.cartDetails[product.id]

      expect(entry.quantity).toBe(2)
      expect(entry.value).toBe(650)
      expect(entry.formattedValue).toBe('$6.50')

      expect(cart.current.cartCount).toBe(2)
      expect(cart.current.totalPrice).toBe(650)
    })

    it('adds price_data from the metadata object from the 3rd param', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product, {
          price_metadata: {
            type: 'tacos',
            test: 'testing'
          }
        })
      })

      expect(cart.current.cartDetails[product.id].price_data).toStrictEqual({
        type: 'tacos',
        test: 'testing'
      })
    })

    it('successfully stacks data to price_data if there is already content there', () => {
      const product = mockProduct({ price_data: { test: 'static metadata' } })

      act(() => {
        cart.current.addItem(product, {
          price_metadata: {
            dynamicTest: 'dynamic data'
          }
        })
      })

      expect(cart.current.cartDetails[product.id].price_data).toStrictEqual({
        test: 'static metadata',
        dynamicTest: 'dynamic data'
      })
    })

    it('adds product_data from the metadata object from the options object', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product, {
          count: 1,
          product_metadata: { type: 'tacos', test: 'testing' }
        })
      })

      expect(cart.current.cartDetails[product.id].product_data).toStrictEqual({
        type: 'tacos',
        test: 'testing'
      })
    })

    it('successfully stacks data to product_data if there is already content there', () => {
      const product = mockProduct({
        product_data: { test: 'static metadata' }
      })

      act(() => {
        cart.current.addItem(product)
        cart.current.addItem(product, {
          product_metadata: {
            dynamicTest: 'dynamic product data'
          }
        })
      })

      expect(cart.current.cartDetails[product.id].product_data).toStrictEqual({
        test: 'static metadata',
        dynamicTest: 'dynamic product data'
      })
    })
  })

  describe.skip('removeItem()', () => {
    it('removes the item from the cart', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.removeItem(product.id)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.id)
    })

    it('should remove correct item', () => {
      const product1 = mockProduct()
      const product2 = mockProduct()

      act(() => {
        cart.current.addItem(product1)
        cart.current.addItem(product2)
        cart.current.removeItem(product1.id)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product1.id)
      expect(cart.current.cartDetails).toHaveProperty(product2.id)
    })
  })

  describe.skip('incrementItem()', () => {
    it('adds one more of that product to the cart', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.incrementItem(product.id)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.id)
      const entry = cart.current.cartDetails[product.id]

      expect(entry.quantity).toBe(2)
      expect(entry.value).toBe(product.price * 2)
      expect(cart.current.cartCount).toBe(2)
    })
  })

  describe.skip('decrementItem()', () => {
    it('removes one of that item from the cart', () => {
      const product = mockProduct({ price: 256 })

      act(() => {
        cart.current.addItem(product, { count: 3 })
        cart.current.decrementItem(product.id)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.id)
      const entry = cart.current.cartDetails[product.id]

      expect(entry.quantity).toBe(2)
      expect(entry.value).toBe(512)
      expect(entry.formattedValue).toBe('$5.12')

      expect(cart.current.cartCount).toBe(2)
      expect(cart.current.totalPrice).toBe(512)
    })

    it.todo('removes `count` amount of that item from the cart')

    it('removes the item from the cart if the quantity reaches 0', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.decrementItem(product.id)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.id)
      expect(cart.current.totalPrice).toBe(0)
      expect(cart.current.cartCount).toBe(0)
    })

    it('does not let you have negative quantities', () => {
      const product = mockProduct()

      act(() => {
        // TODO: figure out why the default state has an actual value. Using clearCart as duct tape solution
        cart.current.clearCart()
        cart.current.addItem(product)
        cart.current.decrementItem(product.id, { count: 5 })
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.id)
      expect(cart.current.totalPrice).toBe(0)
      expect(cart.current.cartCount).toBe(0)
    })

    it('should decrement correct item', () => {
      const product1 = mockProduct()
      const product2 = mockProduct()

      act(() => {
        cart.current.addItem(product1, { count: 2 })
        cart.current.addItem(product2, { count: 4 })
        cart.current.decrementItem(product2.id)
      })

      expect(cart.current.cartDetails[product1.id].quantity).toBe(2)
      expect(cart.current.cartDetails[product2.id].quantity).toBe(3)
    })
  })

  describe.skip('setItemQuantity()', () => {
    it('updates the quantity correctly', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product, { count: 1 })
        cart.current.setItemQuantity(product.id, 5)
      })
      const entry = cart.current.cartDetails[product.id]

      expect(entry.quantity).toBe(5)
      expect(entry.value).toBe(product.price * 5)
    })

    it('removes the item when quantity is set to 0', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product, { count: 10 })
        cart.current.setItemQuantity(product.id, 0)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.id)
    })
  })

  describe.skip('persistence', () => {
    it.todo('Actually do persistance things')
  })

  describe.skip('loadCart()', () => {
    it('should add cartDetails to cart object', async () => {
      const wrapper = createWrapper()
      const cart = renderHook(() => useShoppingCart((state) => state), {
        wrapper
      }).result
      const cartDetails = mockCartDetails()
      const product = mockProduct({ price: 200 })

      act(() => {
        cart.current.addItem(product)
        cart.current.loadCart(cartDetails, false)
      })

      const itemId1 = Object.keys(cartDetails)[0]
      const itemId2 = Object.keys(cartDetails)[1]

      expect(cart.current.cartDetails).toEqual({
        [itemId1]: {
          ...cartDetails[itemId1],
          id: itemId1
        },
        [itemId2]: {
          ...cartDetails[itemId2],
          id: itemId2
        }
      })
      expect(cart.current.totalPrice).toEqual(1800)
      expect(cart.current.cartCount).toEqual(6)
    })

    it('should merge two cart details items by default', async () => {
      const wrapper = createWrapper()
      const cart = renderHook(() => useShoppingCart((state) => state), {
        wrapper
      }).result

      const cartDetails = mockCartDetails()
      const product = mockProduct({ price: 200 })

      act(() => {
        cart.current.addItem(product)
        cart.current.incrementItem(product.id)
        cart.current.loadCart(cartDetails)
      })

      const itemId1 = Object.keys(cartDetails)[0]
      const itemId2 = Object.keys(cartDetails)[1]

      const entry = cart.current.cartDetails[product.id]
      expect(cart.current.cartDetails).toEqual({
        [entry.id]: entry,
        [itemId1]: {
          ...cartDetails[itemId1],
          id: itemId1
        },
        [itemId2]: {
          ...cartDetails[itemId2],
          id: itemId2
        }
      })
      expect(cart.current.totalPrice).toEqual(2200)
      expect(cart.current.cartCount).toEqual(8)
    })
  })

  describe.skip('storeLastClicked()', () => {
    it(' updates lastClicked', () => {
      const product = mockProduct()
      act(() => {
        cart.current.storeLastClicked(product.id)
      })
      expect(cart.current.lastClicked).toBe(product.id)
    })
  })
})

describe.skip('useShoppingCart()', () => {
  const wrapper = createWrapper()
  let cart
  function reload() {
    cart = renderHook(() => useShoppingCart((state) => state), { wrapper })
      .result
  }
  beforeEach(() => reload())

  it('initial state', () => {
    expect(cart.current).toMatchObject(expectedInitialCartState)
  })

  describe.skip('persistence', () => {
    it('data should persist past reload', () => {
      const product = mockProduct()
      act(() => {
        cart.current.addItem(product)
      })

      const snapshot = {
        cartDetails: cart.current.cartDetails,
        cartCount: cart.current.cartCount,
        totalPrice: cart.current.totalPrice
      }

      reload()
      expect(cart.current).toMatchObject(snapshot)
    })

    it('clearCart() should empty the cart even after reload', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.clearCart()
      })

      const emptyCart = {
        cartDetails: {},
        cartCount: 0,
        totalPrice: 0
      }

      expect(cart.current).toMatchObject(emptyCart)
      reload()
      expect(cart.current).toMatchObject(emptyCart)
    })
  })
})

describe.skip('redirectToCheckout()', () => {
  beforeEach(() => {
    stripeMock.redirectToCheckout.mockClear()
  })

  it('should send the correct default values', async () => {
    const wrapper = createWrapper()
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    const product = mockProduct()
    act(() => {
      cart.current.addItem(product)
    })
    await cart.current.redirectToCheckout()

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0]).toEqual({
      mode: 'payment',
      lineItems: [{ price: product.id, quantity: 1 }],
      successUrl: 'https://egghead.io/success',
      cancelUrl: 'https://egghead.io/cancel',
      billingAddressCollection: 'auto',
      submitType: 'auto'
    })
  })

  it('should send all formatted items', async () => {
    const wrapper = createWrapper()
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    const product1 = mockProduct()
    const product2 = mockProduct()

    act(() => {
      cart.current.addItem(product1, 2)
      cart.current.addItem(product2, 9)
    })
    await cart.current.redirectToCheckout()

    const expectedItems = [
      { price: product1.id, quantity: 2 },
      { price: product2.id, quantity: 9 }
    ]

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].lineItems).toEqual(
      expectedItems
    )
  })

  it('should send correct billingAddressCollection', async () => {
    const wrapper = createWrapper({ billingAddressCollection: true })
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    await cart.current.redirectToCheckout()

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(
      stripeMock.redirectToCheckout.mock.calls[0][0].billingAddressCollection
    ).toBe('required')
  })

  it('should send correct shippingAddressCollection', async () => {
    const wrapper = createWrapper({ allowedCountries: ['US', 'CA'] })
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    await cart.current.redirectToCheckout()

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(
      stripeMock.redirectToCheckout.mock.calls[0][0].shippingAddressCollection
        .allowedCountries
    ).toEqual(['US', 'CA'])
  })

  it('should send the sessionId if used in checkout-session mode', async () => {
    const wrapper = createWrapper({ mode: 'checkout-session' })
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    const expectedSessionId = 'bloo-bleh-blah-1234'
    await cart.current.redirectToCheckout({ sessionId: expectedSessionId })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].sessionId).toBe(
      expectedSessionId
    )
  })

  it('invalid mode throws an error', () => {
    const mode = 'bloo blah bleh'
    const wrapper = createWrapper({ mode })
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    expect(cart.current.redirectToCheckout()).rejects.toThrow(
      `Invalid checkout mode '${mode}' was chosen. The valid modes are client-only and checkout-session.`
    )
  })
})

describe.skip('checkoutSingleItem()', () => {
  let cart
  beforeEach(() => {
    stripeMock.redirectToCheckout.mockClear()

    const wrapper = createWrapper()
    cart = renderHook(() => useShoppingCart((state) => state), { wrapper })
      .result
  })

  it('should send the formatted item with no quantity parameter', async () => {
    const product = mockProduct()
    await cart.current.checkoutSingleItem({ sku: product.id })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].lineItems).toEqual([
      { price: product.id, quantity: 1 }
    ])
  })

  it('should send the formatted item with a custom quantity parameter', async () => {
    const product = mockProduct()
    await cart.current.checkoutSingleItem({ sku: product.id, quantity: 47 })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].lineItems).toEqual([
      { price: product.id, quantity: 47 }
    ])
  })

  it('does not support checkout-session mode', async () => {
    const wrapper = createWrapper({ mode: 'checkout-session' })
    cart = renderHook(() => useShoppingCart((state) => state), { wrapper })
      .result

    const product = mockProduct()
    expect(
      cart.current.checkoutSingleItem({ sku: product.id })
    ).rejects.toThrow(
      "Invalid checkout mode 'checkout-session' was chosen. The valid modes are client-only."
    )
  })
})

describe.skip('stripe handling', () => {
  it('if stripe is defined, redirectToCheckout can be called', async () => {
    const wrapper = createWrapper()
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result
    await cart.current.redirectToCheckout()
    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
  })

  it('if stripe is undefined, redirectToCheckout throws an error', () => {
    const wrapper = createWrapper({ stripe: null })
    const cart = renderHook(() => useShoppingCart((state) => state), {
      wrapper
    }).result

    expect(cart.current.redirectToCheckout()).rejects.toThrow(
      'No compatible API has been defined, your options are: Stripe'
    )
  })
})

// function mockCartDetails(overrides) {
//   return {
//     [`sku_abc${counter}`]: {
//       sku: `sku_abc${counter++}`,
//       name: 'Bananas',
//       image: 'https://blah.com/banana.avif',
//       price: 400,
//       currency: 'USD',
//       value: 800,
//       quantity: 2,
//       formattedValue: '$8.00',
//       ...overrides
//     },
//     [`sku_efg${counter}`]: {
//       sku: `sku_efg${counter++}`,
//       name: 'Oranges',
//       image: 'https://blah.com/orange.avif',
//       currency: 'USD',
//       price: 250,
//       value: 1000,
//       quantity: 4,
//       formattedValue: '$10.00',
//       ...overrides
//     }
//   }
// }

describe.skip('<DebugCart>', () => {
  beforeAll(() => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <DebugCart />
      </Wrapper>
    )
  })

  it('should make a table of properties and values from the cart', () => {
    expect(screen.getByRole('table')).toBeVisible()

    const { cartDetails, ...others } = expectedInitialCartState

    let cell = screen.getByRole('cell', { name: 'cartDetails' })
    expect(cell).toBeVisible()
    expect(
      getByRole(cell.parentElement, 'button', { name: /log value/i })
    ).toBeVisible()

    for (const name in others) {
      cell = screen.getByRole('cell', { name })
      expect(cell).toBeVisible()
      expect(
        getByRole(cell.parentElement, 'cell', {
          name: JSON.stringify(others[name])
        })
      )
    }
  })
})
