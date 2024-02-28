import { reducer, initialState, actions } from './slice'

function getCurrentTimestamp() {
  return new Date().toISOString()
}

let counter = 0
/**
 * @returns {import('./index').Product}
 */
function mockProduct(overrides) {
  return {
    id: `id_abc${counter++}`,
    name: 'blah bleh bloo',
    price: Math.floor(Math.random() * 1000 + 1),
    image: 'https://blah.com/bleh',
    alt: 'a bleh glowing under a soft sunrise',
    currency: 'usd',
    ...overrides
  }
}

/**
 * @returns {import('./index').CartDetails}
 */
function mockCartDetails(overrides1, overrides2) {
  const timestamp = getCurrentTimestamp()
  return {
    [`id_abc${counter}`]: {
      id: `id_abc${counter++}`,
      name: 'Bananas',
      image: 'https://blah.com/banana.avif',
      price: 400,
      formattedPrice: '$4.00',
      currency: 'USD',
      value: 800,
      quantity: 2,
      formattedValue: '$8.00',
      price_data: {},
      product_data: {},
      timestamp,
      ...overrides1
    },
    [`id_efg${counter}`]: {
      id: `id_efg${counter++}`,
      name: 'Oranges',
      image: 'https://blah.com/orange.avif',
      currency: 'USD',
      price: 250,
      formattedPrice: '$2.50',
      value: 1000,
      quantity: 4,
      formattedValue: '$10.00',
      price_data: {},
      product_data: {},
      timestamp,
      ...overrides2
    }
  }
}

/**
 * @returns {import('./index').CartState}
 */
function mockCart(overrides, cartDetailsOverrides1, cartDetailsOverrides2) {
  return {
    ...initialState,
    cartDetails: mockCartDetails(cartDetailsOverrides1, cartDetailsOverrides2),
    cartCount: 6,
    totalPrice: 1800,
    formattedTotalPrice: '$18.00',
    ...overrides
  }
}

describe('cart reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })
})

describe('addItem', () => {
  it('should add an entry to the cart', () => {
    const product = mockProduct()
    const result = reducer(initialState, actions.addItem(product))

    expect(result.cartDetails[product.id]).toMatchObject(product)
    expect(result.totalPrice).toBe(product.price)
    expect(result.cartCount).toBe(1)
  })

  it('should retain entries when adding a product to a cart that already contains products', () => {
    const product = mockProduct({ price: 100 })
    const cart = mockCart()

    const result = reducer(cart, actions.addItem(product))

    expect(result.cartCount).toBe(cart.cartCount + 1)
    expect(result.totalPrice).toBe(cart.totalPrice + 100)
    expect(result.cartDetails[product.id]).toMatchObject(product)
    expect(result.cartDetails).toMatchObject(cart.cartDetails)
  })

  it('should attach price_metadata to the cart entry', () => {
    const product = mockProduct()

    const result = reducer(
      initialState,
      actions.addItem(product, {
        price_metadata: { type: 'food' }
      })
    )

    const cartDetails = result.cartDetails
    expect(cartDetails[product.id].price_data).toEqual({ type: 'food' })
  })

  it('should attach product_metadata to the cart entry', () => {
    const product = mockProduct()

    const result = reducer(
      initialState,
      actions.addItem(product, {
        product_metadata: { type: 'digital' }
      })
    )

    const cartDetails = result.cartDetails
    expect(cartDetails[product.id].product_data).toEqual({
      type: 'digital'
    })
  })

  it('should handle updating the cart entry when adding the same product the cart again', () => {
    const product = mockProduct()
    let result = reducer(initialState, actions.addItem(product))
    result = reducer(result, actions.addItem(product))

    expect(result.cartDetails[product.id]).toMatchObject(product)
  })
})

describe('incrementItem', () => {
  it('should increment a cartItem by 1', () => {
    const cart = mockCart()
    const id = Object.keys(cart.cartDetails)[0]
    const entry = cart.cartDetails[id]

    const result = reducer(cart, actions.incrementItem(entry.id))

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(7)
    expect(result.totalPrice).toEqual(2200)
    expect(cartDetails[entry.id].quantity).toEqual(3)
  })

  it('should increment a cartItem by 2', () => {
    const cart = mockCart()
    const id = Object.keys(cart.cartDetails)[0]
    const entry = cart.cartDetails[id]

    const result = reducer(cart, actions.incrementItem(entry.id, { count: 2 }))

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(8)
    expect(result.totalPrice).toEqual(2600)
    expect(cartDetails[entry.id].quantity).toEqual(4)
  })
})

describe('decrementItem', () => {
  it('should decrease the quantity of a cart entry by one and decrease respective values', () => {
    const cart = mockCart()
    const id = Object.keys(cart.cartDetails)[0]
    const entry = cart.cartDetails[id]

    const result = reducer(cart, actions.decrementItem(entry.id))

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(5)
    expect(result.totalPrice).toEqual(1400)
    expect(cartDetails[entry.id].quantity).toEqual(1)
  })

  it('should remove an entry in the cart when its quantity is at or below zero', () => {
    const cart = mockCart()
    const id = Object.keys(cart.cartDetails)[0]
    const entry = cart.cartDetails[id]

    const result = reducer(cart, actions.decrementItem(entry.id, { count: 2 }))

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(4)
    expect(result.totalPrice).toEqual(1000)
    expect(cartDetails[entry.id]).toBeUndefined()
  })
})

describe('clearCart', () => {
  it('should reset back into initialState', () => {
    const cart = mockCart()
    const result = reducer(cart, actions.clearCart())

    expect(result).toMatchObject({
      ...cart,
      cartDetails: {},
      cartCount: 0,
      totalPrice: 0,
      formattedTotalPrice: '$0.00'
    })
  })
})

describe('setItemQuantity', () => {
  it('sets the proper quantity for a cart Item', () => {
    const cart = mockCart()
    const id = Object.keys(cart.cartDetails)[0]
    const entry = cart.cartDetails[id]
    const result = reducer(cart, actions.setItemQuantity(entry.id, 10))

    const cartDetails = result.cartDetails

    expect(cartDetails[entry.id].quantity).toBe(10)
    expect(result.cartCount).toBe(14)
    expect(result.totalPrice).toBe(5000)
  })
})

describe('removeItem', () => {
  it('removes the proper entry from cart and updates respective values', () => {
    const cart = mockCart()
    const id = Object.keys(cart.cartDetails)[0]
    const entry = cart.cartDetails[id]

    const result = reducer(cart, actions.removeItem(entry.id))

    expect(result.cartDetails[entry.id]).toBeUndefined()
    expect(result.cartCount).toBe(cart.cartCount - entry.quantity)
    expect(result.totalPrice).toBe(cart.totalPrice - entry.value)
  })
})

describe('loadCart', () => {
  it('properly merges a new cartDetails into the current cartDetails excluding timestamp', () => {
    const cart1 = mockCart()
    const cart2 = mockCart(undefined, { name: 'Carrots' }, { name: 'Broccoli' })

    // Remove the timestamp from both cartDetails
    Object.keys(cart1.cartDetails).forEach((key) => {
      delete cart1.cartDetails[key].timestamp
    })
    Object.keys(cart2.cartDetails).forEach((key) => {
      delete cart2.cartDetails[key].timestamp
    })

    const result = reducer(cart1, actions.loadCart(cart2.cartDetails))

    expect(result.cartDetails).toMatchObject({
      ...cart1.cartDetails,
      ...cart2.cartDetails
    })
    expect(result.totalPrice).toBe(3600)
    expect(result.cartCount).toBe(12)
  })
})

describe('handleCartClick', () => {
  it('should toggle whether or not the cart should be displayed', () => {
    let result = reducer(initialState, actions.handleCartClick())
    expect(result.shouldDisplayCart).toBe(true)

    result = reducer(result, actions.handleCartClick())
    expect(result.shouldDisplayCart).toBe(false)
  })
})

describe('handleCloseCart', () => {
  it('should set the cart to not be displayed', () => {
    const result = reducer(
      { ...initialState, shouldDisplayCart: true },
      actions.handleCloseCart()
    )
    expect(result.shouldDisplayCart).toBe(false)
  })
})

describe('storeLastClicked', () => {
  it('should store id of last clicked item', () => {
    const cart = mockCart()
    const products = Object.keys(cart.cartDetails).map(
      (product) => cart.cartDetails[product]
    )
    const product = products[0]

    const result = reducer(
      cart.cartDetails,
      actions.storeLastClicked(product.id)
    )

    expect(result.lastClicked).toEqual(product.id)
  })
})
describe('checkoutSingleItem', () => {
  it('should return lineItems when given string', () => {
    const product = mockProduct()
    expect(actions.checkoutSingleItem(product.id)).toEqual({
      payload: {
        cartItems: {
          lineItems: [
            {
              price: product.id,
              quantity: 1
            }
          ]
        }
      },
      type: 'cart/checkoutSingleItem'
    })
  })
  it('should return lineItems when given price object', () => {
    const product = mockProduct()
    expect(
      actions.checkoutSingleItem({
        price: product.id
      })
    ).toEqual({
      payload: {
        cartItems: {
          lineItems: [
            {
              price: product.id,
              quantity: 1
            }
          ]
        }
      },
      type: 'cart/checkoutSingleItem'
    })
  })
  it('should return lineItems when given price object with quantity', () => {
    const product = mockProduct()
    expect(
      actions.checkoutSingleItem({
        price: product.id,
        quantity: 2
      })
    ).toEqual({
      payload: {
        cartItems: {
          lineItems: [
            {
              price: product.id,
              quantity: 2
            }
          ]
        }
      },
      type: 'cart/checkoutSingleItem'
    })
  })
  it('should return items when given sku object', () => {
    const product = mockProduct()
    expect(
      actions.checkoutSingleItem({
        sku: product.id
      })
    ).toEqual({
      payload: {
        cartItems: {
          items: [
            {
              sku: product.id,
              quantity: 1
            }
          ]
        }
      },
      type: 'cart/checkoutSingleItem'
    })
  })
  it('should return items when given sku object with quantity', () => {
    const product = mockProduct()
    expect(
      actions.checkoutSingleItem({
        sku: product.id,
        quantity: 2
      })
    ).toEqual({
      payload: {
        cartItems: {
          items: [
            {
              sku: product.id,
              quantity: 2
            }
          ]
        }
      },
      type: 'cart/checkoutSingleItem'
    })
  })
})
