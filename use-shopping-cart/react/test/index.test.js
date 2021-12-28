import { act, renderHook } from '@testing-library/react-hooks'

import '@testing-library/jest-dom/extend-expect'
import { useShoppingCart } from '../index'
import { createWrapper, expectedInitialCartState } from './testHelpers'
import { PropertyValueError } from '../../core/middleware/helpers'

let counter = 0

function mockProduct(overrides) {
  return {
    id: `product-id-${counter++}`,
    name: 'mock-product-name',
    price: Math.floor(Math.random() * 1000 + 1),
    image: 'https://mock.product/url',
    alt: 'mock-product-alt-text',
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
      ...overrides2
    }
  }
}

const stripeMock = {
  redirectToCheckout: jest.fn().mockReturnValue(() => Promise.resolve()),
  registerAppInfo: jest.fn()
}

let cart

function reload(overrides) {
  window.localStorage.clear()
  const { result } = renderHook(() => useShoppingCart((state) => state), {
    wrapper: createWrapper(overrides)
  })
  return result
}

describe('useShoppingCart()', () => {
  beforeEach(() => {
    cart = reload()
  })

  it('has the expected initial state', () => {
    expect(cart.current).toMatchObject(expectedInitialCartState)
  })

  describe('shouldDisplayCart', () => {
    it('is false by default', () => {
      expect(cart.current.shouldDisplayCart).toBe(false)
    })

    it('sets shouldDisplayCart to true after running handleCartClick() once', () => {
      act(() => {
        cart.current.handleCartClick()
      })

      expect(cart.current.shouldDisplayCart).toBe(true)
    })

    it('is toggled by handleCartClick()', () => {
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

    it('is set to false by handleCloseCart()', () => {
      act(() => {
        cart.current.handleCartClick()
        cart.current.handleCloseCart()
      })
      expect(cart.current.shouldDisplayCart).toBe(false)
    })

    it('is set to true by handleOpenCart()', () => {
      act(() => {
        cart.current.handleCartClick()
        cart.current.handleCloseCart()
        cart.current.handleOpenCart()
      })
      expect(cart.current.shouldDisplayCart).toBe(true)
    })
  })

  describe('addItem()', () => {
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

  describe('removeItem()', () => {
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

  describe('incrementItem()', () => {
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

  describe('decrementItem()', () => {
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

  describe('setItemQuantity()', () => {
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

  describe('loadCart()', () => {
    let cartDetails, product

    beforeEach(() => {
      cartDetails = mockCartDetails()
      product = mockProduct({ price: 200 })
    })

    it('should add cartDetails to cart object', async () => {
      act(() => {
        cart.current.addItem(product)
        cart.current.loadCart(cartDetails, false)
      })

      expect(cart.current).toMatchObject({
        cartDetails,
        totalPrice: 1800,
        cartCount: 6
      })
    })

    it('should merge two cart details items by default', async () => {
      act(() => {
        cart.current.addItem(product)
        cart.current.incrementItem(product.id)
        cart.current.loadCart(cartDetails)
      })

      expect(cart.current).toMatchObject({
        totalPrice: 2200,
        cartCount: 8,
        cartDetails: {
          [product.id]: product,
          ...cartDetails
        }
      })
    })
  })

  describe('storeLastClicked()', () => {
    it('updates lastClicked', () => {
      const product = mockProduct()
      act(() => {
        cart.current.storeLastClicked(product.id)
      })
      expect(cart.current.lastClicked).toBe(product.id)
    })
  })
})

describe('redirectToCheckout()', () => {
  const checkoutOptionsWithAnySessionId = expect.objectContaining({
    sessionId: expect.anything()
  })

  beforeEach(() => {
    stripeMock.redirectToCheckout.mockClear()
    global.Stripe = () => stripeMock
    cart = reload({ cartMode: 'client-only' })
  })

  it('should send the correct default values', async () => {
    const product = mockProduct()

    await act(async () => {
      cart.current.addItem(product)
      await cart.current.redirectToCheckout({ sessionId: 'session-id' })
    })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith({
      mode: 'payment',
      lineItems: [
        {
          price: product.id,
          quantity: 1
        }
      ],
      successUrl: 'https://egghead.io/success',
      cancelUrl: 'https://egghead.io/cancel',
      billingAddressCollection: 'auto',
      submitType: 'auto'
    })
  })

  it('sends items added to the cart in the lineItems property', async () => {
    const firstProduct = mockProduct()
    const secondProduct = mockProduct()

    await act(async () => {
      cart.current.addItem(firstProduct, { count: 2 })
      cart.current.addItem(secondProduct, { count: 9 })
      await cart.current.redirectToCheckout({ sessionId: 'session-id' })
    })

    const expectedCheckoutOptions = expect.objectContaining({
      lineItems: [
        {
          price: firstProduct.id,
          quantity: 2
        },
        {
          price: secondProduct.id,
          quantity: 9
        }
      ]
    })

    expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith(
      expectedCheckoutOptions
    )
    expect(stripeMock.redirectToCheckout).not.toHaveBeenCalledWith(
      checkoutOptionsWithAnySessionId
    )
  })

  describe('with billingAddressCollection set to true', () => {
    // the nested describe/beforeEach is necessary to give it time to complete
    beforeEach(() => {
      cart = reload({
        cartMode: 'client-only',
        billingAddressCollection: true
      })
    })

    it('set billingAddressCollection as "required"', async () => {
      await act(async () => {
        await cart.current.redirectToCheckout()
      })

      const expectedCheckoutOptions = expect.objectContaining({
        billingAddressCollection: 'required'
      })

      expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith(
        expectedCheckoutOptions
      )
      expect(stripeMock.redirectToCheckout).not.toHaveBeenCalledWith(
        checkoutOptionsWithAnySessionId
      )
    })
  })

  describe('passing allowedCountries', () => {
    // the nested describe/beforeEach is necessary to give it time to complete
    beforeEach(() => {
      cart = reload({ cartMode: 'client-only', allowedCountries: ['US', 'CA'] })
    })

    it('sets the allowedCountries property of the shippingAddressCollection subobject', async () => {
      await act(async () => {
        await cart.current.redirectToCheckout()
      })

      const expectedCheckoutOptions = expect.objectContaining({
        billingAddressCollection: 'auto',
        shippingAddressCollection: {
          allowedCountries: ['US', 'CA']
        }
      })

      expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith(
        expectedCheckoutOptions
      )
      expect(stripeMock.redirectToCheckout).not.toHaveBeenCalledWith(
        checkoutOptionsWithAnySessionId
      )
    })
  })

  describe('checkout-session mode', () => {
    beforeEach(() => {
      cart = reload({ cartMode: 'checkout-session' })
    })

    it('sends the sessionId', async () => {
      await cart.current.redirectToCheckout({ sessionId: 'my-session-id' })

      const expectedCheckoutOptions = expect.objectContaining({
        sessionId: 'my-session-id'
      })

      expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith(
        expectedCheckoutOptions
      )
    })
  })

  describe('sending an invalid cartMode value', () => {
    const invalidCartMode = 'invalid-cart-mode'

    beforeEach(() => {
      cart = reload({
        cartMode: invalidCartMode
      })
    })

    it('invalid mode throws an error', () => {
      expect(cart.current.redirectToCheckout()).rejects.toThrow(
        PropertyValueError
      )
    })
  })

  // TODO : check on bug for sending product.id as price in stripe-middleware?
  describe.skip('checkoutSingleItem()', () => {
    const product = mockProduct()

    it('should send the formatted item with no quantity parameter', async () => {
      await act(async () => {
        await cart.current.checkoutSingleItem({
          sku: product.id
        })
      })

      const expectedCheckoutOptions = expect.objectContaining({
        lineItems: {
          price: product.id,
          quantity: 1
        }
      })

      expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith(
        expectedCheckoutOptions
      )
    })

    it('should send the formatted item with a custom quantity parameter', async () => {
      await act(async () => {
        await cart.current.checkoutSingleItem({
          sku: product.id,
          quantity: 47
        })
      })

      const expectedCheckoutOptions = expect.objectContaining({
        lineItems: {
          sku: product.id,
          quantity: 47
        }
      })
      expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith(
        expectedCheckoutOptions
      )
    })

    describe('with a checkout-session cartMode', () => {
      beforeEach(() => {
        cart = reload({ mode: 'checkout-session' })
      })

      it('throws an error', async () => {
        expect(
          cart.current.checkoutSingleItem({ sku: product.id })
        ).rejects.toThrow(PropertyValueError)
      })
    })
  })
})
