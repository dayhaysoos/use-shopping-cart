import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { CartProvider, useShoppingCart } from './index'

afterEach(() => window.localStorage.clear())

const stripeMock = {
  redirectToCheckout: jest.fn().mockReturnValue(() => Promise.resolve())
}

const createWrapper = (overrides = {}) => ({ children }) => (
  <CartProvider
    mode="client-only"
    successUrl="https://egghead.io/success"
    cancelUrl="https://egghead.io/cancel"
    stripe={stripeMock}
    currency="USD"
    {...overrides}
  >
    {children}
  </CartProvider>
)

let counter = 0
function mockProduct(overrides) {
  return {
    sku: `sku_abc${counter++}`,
    name: 'blah bleh bloo',
    price: Math.floor(Math.random() * 1000 + 1),
    image: 'https://blah.com/bleh',
    alt: 'a bleh glowing under a soft sunrise',
    currency: 'usd',
    ...overrides
  }
}

describe('useShoppingCart()', () => {
  const wrapper = createWrapper()
  let cart
  function reload() {
    cart = renderHook(() => useShoppingCart(), { wrapper }).result
  }
  beforeEach(() => reload())

  it('initial state', () => {
    expect(cart.current).toMatchObject({
      cartDetails: {},
      totalPrice: 0,
      formattedTotalPrice: '$0.00',
      cartCount: 0,
      shouldDisplayCart: false
    })
  })

  it('storeLastClicked() updates lastClicked', () => {
    const product = mockProduct()
    act(() => {
      cart.current.storeLastClicked(product.sku)
    })
    expect(cart.current.lastClicked).toBe(product.sku)
  })

  describe('shouldDisplayCart', () => {
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

    it('handleCartHover() opens cart', () => {
      act(() => {
        cart.current.handleCartHover()
      })
      expect(cart.current.shouldDisplayCart).toBe(true)
    })

    it('handleCloseCart() closes cart', () => {
      act(() => {
        cart.current.handleCloseCart()
      })
      expect(cart.current.shouldDisplayCart).toBe(false)
    })
  })

  describe('addItem()', () => {
    it('adds an item to the cart', () => {
      const product = mockProduct({ price: 200 })

      act(() => {
        cart.current.addItem(product)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.sku)
      const entry = cart.current.cartDetails[product.sku]

      expect(entry.quantity).toBe(1)
      expect(entry.value).toBe(product.price)
      expect(entry.formattedValue).toBe('$2.00')
      expect(entry).toMatchObject(product)

      expect(cart.current.cartCount).toBe(1)
      expect(cart.current.totalPrice).toBe(200)
    })

    it('adds `count` amount of items to the cart', () => {
      let totalCount = 0
      for (let count = 1; count <= 50; ++count) {
        const product = mockProduct()

        act(() => {
          cart.current.addItem(product, count)
        })

        expect(cart.current.cartDetails).toHaveProperty(product.sku)
        const entry = cart.current.cartDetails[product.sku]

        expect(entry.quantity).toBe(count)
        expect(entry.value).toBe(product.price * count)

        totalCount += count
        expect(cart.current.cartCount).toBe(totalCount)
      }
    })

    it('adds multiple different items to the cart', () => {
      const product1 = mockProduct({ price: 400 })
      const product2 = mockProduct({ price: 100 })

      act(() => {
        cart.current.addItem(product1)
        cart.current.addItem(product2)
      })

      expect(cart.current.cartDetails).toHaveProperty(product1.sku)
      const entry1 = cart.current.cartDetails[product1.sku]

      expect(entry1.quantity).toBe(1)
      expect(entry1.value).toBe(product1.price)

      expect(cart.current.cartDetails).toHaveProperty(product2.sku)
      const entry2 = cart.current.cartDetails[product2.sku]

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

      expect(cart.current.cartDetails).toHaveProperty(product.sku)
      const entry = cart.current.cartDetails[product.sku]

      expect(entry.quantity).toBe(2)
      expect(entry.value).toBe(650)
      expect(entry.formattedValue).toBe('$6.50')

      expect(cart.current.cartCount).toBe(2)
      expect(cart.current.totalPrice).toBe(650)
    })
  })

  describe('removeItem()', () => {
    it('removes the item from the cart', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.removeItem(product.sku)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.sku)
    })

    it('should remove correct item', () => {
      const product1 = mockProduct()
      const product2 = mockProduct()

      act(() => {
        cart.current.addItem(product1, 2)
        cart.current.addItem(product2, 4)
        cart.current.removeItem(product1.sku)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product1.sku)
      expect(cart.current.cartDetails).toHaveProperty(product2.sku)
    })
  })

  describe('incrementItem()', () => {
    it('adds one more of that product to the cart', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.incrementItem(product.sku)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.sku)
      const entry = cart.current.cartDetails[product.sku]

      expect(entry.quantity).toBe(2)
      expect(entry.value).toBe(product.price * 2)
      expect(cart.current.cartCount).toBe(2)
    })

    it('adds `count` amount more of that item to the cart', () => {
      let totalCount = 0
      for (let count = 1; count <= 50; ++count) {
        const product = mockProduct()

        act(() => {
          cart.current.addItem(product)
          cart.current.incrementItem(product.sku, count)
        })

        expect(cart.current.cartDetails).toHaveProperty(product.sku)
        const entry = cart.current.cartDetails[product.sku]

        const expectedQuantity = count + 1
        expect(entry.quantity).toBe(expectedQuantity)
        expect(entry.value).toBe(product.price * expectedQuantity)

        totalCount += expectedQuantity
        expect(cart.current.cartCount).toBe(totalCount)
      }
    })
  })

  describe('decrementItem()', () => {
    it('removes one of that item from the cart', () => {
      const product = mockProduct({ price: 256 })

      act(() => {
        cart.current.addItem(product, 3)
        cart.current.decrementItem(product.sku)
      })

      expect(cart.current.cartDetails).toHaveProperty(product.sku)
      const entry = cart.current.cartDetails[product.sku]

      expect(entry.quantity).toBe(2)
      expect(entry.value).toBe(512)
      expect(entry.formattedValue).toBe('$5.12')

      expect(cart.current.cartCount).toBe(2)
      expect(cart.current.totalPrice).toBe(512)
    })

    it('removes `count` amount of that item from the cart', () => {
      let totalCount = 0
      for (let count = 1; count <= 50; ++count) {
        const product = mockProduct()
        // from count + 1 -> count + 101
        const randomNumberAboveCount =
          Math.floor(Math.random() * 100) + count + 1
        const endQuantity = randomNumberAboveCount - count

        act(() => {
          // add a random number of product to the cart
          cart.current.addItem(product, randomNumberAboveCount)
          cart.current.decrementItem(product.sku, count)
        })

        expect(cart.current.cartDetails).toHaveProperty(product.sku)
        const entry = cart.current.cartDetails[product.sku]

        expect(entry.quantity).toBe(endQuantity)
        expect(entry.value).toBe(endQuantity * product.price)

        totalCount += endQuantity
        expect(cart.current.cartCount).toBe(totalCount)
      }
    })

    it('removes the item from the cart if the quantity reaches 0', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.decrementItem(product.sku)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.sku)
      expect(cart.current.totalPrice).toBe(0)
      expect(cart.current.cartCount).toBe(0)
    })

    it('does not let you have negative quantities', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product)
        cart.current.decrementItem(product.sku, 5)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.sku)
      expect(cart.current.totalPrice).toBe(0)
      expect(cart.current.cartCount).toBe(0)
    })

    it('should decrement correct item', () => {
      const product1 = mockProduct()
      const product2 = mockProduct()

      act(() => {
        cart.current.addItem(product1, 2)
        cart.current.addItem(product2, 4)
        cart.current.decrementItem(product2.sku)
      })

      expect(cart.current.cartDetails[product1.sku].quantity).toBe(2)
      expect(cart.current.cartDetails[product2.sku].quantity).toBe(3)
    })
  })

  describe('setItemQuantity()', () => {
    it('updates the quantity correctly', () => {
      let totalCount = 0
      for (let quantity = 1; quantity < 50; ++quantity) {
        const product = mockProduct()
        const startingQuantity = Math.floor(Math.random() * 1000) + 1

        act(() => {
          cart.current.addItem(product, startingQuantity)
          cart.current.setItemQuantity(product.sku, quantity)
        })

        expect(cart.current.cartDetails).toHaveProperty(product.sku)
        const entry = cart.current.cartDetails[product.sku]

        expect(entry.quantity).toBe(quantity)
        expect(entry.value).toBe(product.price * quantity)

        totalCount += quantity
        expect(cart.current.cartCount).toBe(totalCount)
      }
    })

    it('removes the item when quantity is set to 0', () => {
      const product = mockProduct()

      act(() => {
        cart.current.addItem(product, 10)
        cart.current.setItemQuantity(product.sku, 0)
      })

      expect(cart.current.cartDetails).not.toHaveProperty(product.sku)
    })
  })

  describe('persistence', () => {
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

describe('redirectToCheckout()', () => {
  beforeEach(() => {
    stripeMock.redirectToCheckout.mockClear()
  })

  it('should send the correct default values', async () => {
    const wrapper = createWrapper()
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

    const product = mockProduct()
    act(() => {
      cart.current.addItem(product)
    })
    await cart.current.redirectToCheckout()

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0]).toEqual({
      mode: 'payment',
      lineItems: [{ price: product.sku, quantity: 1 }],
      successUrl: 'https://egghead.io/success',
      cancelUrl: 'https://egghead.io/cancel',
      billingAddressCollection: 'auto',
      submitType: 'auto'
    })
  })

  it('should send all formatted items', async () => {
    const wrapper = createWrapper()
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

    const product1 = mockProduct()
    const product2 = mockProduct()

    act(() => {
      cart.current.addItem(product1, 2)
      cart.current.addItem(product2, 9)
    })
    await cart.current.redirectToCheckout()

    const expectedItems = [
      { price: product1.sku, quantity: 2 },
      { price: product2.sku, quantity: 9 }
    ]

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].lineItems).toEqual(
      expectedItems
    )
  })

  it('should send correct billingAddressCollection', async () => {
    const wrapper = createWrapper({ billingAddressCollection: true })
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

    await cart.current.redirectToCheckout()

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(
      stripeMock.redirectToCheckout.mock.calls[0][0].billingAddressCollection
    ).toBe('required')
  })

  it('should send correct shippingAddressCollection', async () => {
    const wrapper = createWrapper({ allowedCountries: ['US', 'CA'] })
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

    await cart.current.redirectToCheckout()

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(
      stripeMock.redirectToCheckout.mock.calls[0][0].shippingAddressCollection
        .allowedCountries
    ).toEqual(['US', 'CA'])
  })

  it('should send the sessionId if used in checkout-session mode', async () => {
    const wrapper = createWrapper({ mode: 'checkout-session' })
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

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
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

    expect(cart.current.redirectToCheckout()).rejects.toThrow(
      `Invalid checkout mode '${mode}' was chosen. The valid modes are client-only and checkout-session.`
    )
  })
})

describe('checkoutSingleItem()', () => {
  let cart
  beforeEach(() => {
    stripeMock.redirectToCheckout.mockClear()

    const wrapper = createWrapper()
    cart = renderHook(() => useShoppingCart(), { wrapper }).result
  })

  it('should send the formatted item with no quantity parameter', async () => {
    const product = mockProduct()
    await cart.current.checkoutSingleItem({ sku: product.sku })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].lineItems).toEqual([
      { price: product.sku, quantity: 1 }
    ])
  })

  it('should send the formatted item with a custom quantity parameter', async () => {
    const product = mockProduct()
    await cart.current.checkoutSingleItem({ sku: product.sku, quantity: 47 })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].lineItems).toEqual([
      { price: product.sku, quantity: 47 }
    ])
  })

  it('does not support checkout-session mode', async () => {
    const wrapper = createWrapper({ mode: 'checkout-session' })
    cart = renderHook(() => useShoppingCart(), { wrapper }).result

    const product = mockProduct()
    expect(
      cart.current.checkoutSingleItem({ sku: product.sku })
    ).rejects.toThrow(
      "Invalid checkout mode 'checkout-session' was chosen. The valid modes are client-only."
    )
  })
})

describe('stripe handling', () => {
  it('if stripe is defined, redirectToCheckout can be called', async () => {
    const wrapper = createWrapper()
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result
    await cart.current.redirectToCheckout()
    expect(stripeMock.redirectToCheckout).toHaveBeenCalled()
  })

  it('if stripe is undefined, redirectToCheckout throws an error', () => {
    const wrapper = createWrapper({ stripe: null })
    const cart = renderHook(() => useShoppingCart(), { wrapper }).result

    expect(cart.current.redirectToCheckout()).rejects.toThrow(
      'No compatible API has been defined, your options are: Stripe'
    )
  })
})
