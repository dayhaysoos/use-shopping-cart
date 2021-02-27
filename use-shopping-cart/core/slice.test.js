import { reducer, initialState } from './slice'

const ACTION_TYPES = {
  addItem: 'cart/addItem',
  incrementItem: 'cart/incrementItem',
  decrementItem: 'cart/decrementItem',
  clearCart: 'cart/clearCart',
  setItemQuantity: 'cart/setItemQuantity',
  removeItem: 'cart/removeItem',
  loadCart: 'cart/loadCart',
  handleCartClick: 'cart/handleCartClick',
  handleCloseCart: 'cart/handleCloseCart'
}

let counter = 0
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

function mockCart(overrides) {
  const mockDetails = mockCartDetails()

  return {
    ...initialState,
    cartDetails: mockDetails,
    cartCount: 6,
    totalPrice: 1800
  }
}

describe('cart reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })
})

describe('addItem', () => {
  it('should handle addItem', () => {
    const product = mockProduct()

    const result = reducer(initialState, {
      type: ACTION_TYPES.addItem,
      payload: {
        product,
        options: { count: 1, price_metadata: {}, product_metadata: {} }
      }
    })

    const cartDetails = result.cartDetails
    const productEntry = cartDetails[product.id]

    expect(productEntry.quantity).toBe(1)
    expect(result.totalPrice).toBe(product.price)
    expect(result.cartCount).toBe(1)
  })

  it('should handle adding multiple items to cartDetails', () => {
    // default price value is random number, so making it static here
    const product = mockProduct({ price: 100 })
    const mockDetails = mockCartDetails()

    const result = reducer(
      {
        ...initialState,
        // already 6 items in mockCartDetails
        cartCount: 6,
        cartDetails: mockDetails,
        // total price based on quantity and values of each cartDetails product
        totalPrice: 1800
      },
      {
        type: ACTION_TYPES.addItem,
        payload: {
          product,
          options: { count: 1, price_metadata: {}, product_metadata: {} }
        }
      }
    )

    const cartDetails = result.cartDetails

    expect(result.cartCount).toBe(7)
    expect(result.totalPrice).toBe(1900)
    expect(cartDetails[product.id]).toBeTruthy()
    expect(Object.keys(cartDetails).length).toEqual(3)
  })

  it('should handle adding price_metadata along with added cart item', () => {
    const product = mockProduct()

    const result = reducer(initialState, {
      type: ACTION_TYPES.addItem,
      payload: {
        product,
        options: {
          count: 1,
          price_metadata: { type: 'food' },
          product_metadata: {}
        }
      }
    })

    const cartDetails = result.cartDetails
    expect(cartDetails[product.id].price_data).toEqual({ type: 'food' })
  })

  it('should handle adding product_metadata along with added cart item', () => {
    const product = mockProduct()

    const result = reducer(initialState, {
      type: ACTION_TYPES.addItem,
      payload: {
        product,
        options: {
          count: 1,
          price_metadata: {},
          product_metadata: { type: 'digital' }
        }
      }
    })

    const cartDetails = result.cartDetails
    expect(cartDetails[product.id].product_data).toEqual({
      type: 'digital'
    })
  })
})

describe('incrementItem', () => {
  it('should increment a cartItem by 1', () => {
    const mockDetails = mockCartDetails()
    const initialState = {
      ...initialState,
      cartDetails: mockDetails,
      cartCount: 6,
      totalPrice: 1800
    }

    const products = Object.keys(mockDetails).map(
      (product) => mockDetails[product]
    )

    const product0 = products[0]

    const result = reducer(initialState, {
      type: ACTION_TYPES.incrementItem,
      payload: {
        id: products[0].id,
        options: { count: 1 }
      }
    })

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(7)
    expect(result.totalPrice).toEqual(2200)
    expect(cartDetails[product0.id].quantity).toEqual(3)
  })

  it('should increment a cartItem by 2', () => {
    const mockDetails = mockCartDetails()
    const initialState = {
      ...initialState,
      cartDetails: mockDetails,
      cartCount: 6,
      totalPrice: 1800
    }

    const products = Object.keys(mockDetails).map(
      (product) => mockDetails[product]
    )

    const product0 = products[0]

    const result = reducer(initialState, {
      type: ACTION_TYPES.incrementItem,
      payload: {
        id: products[0].id,
        options: { count: 2 }
      }
    })

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(8)
    expect(result.totalPrice).toEqual(2600)
    expect(cartDetails[product0.id].quantity).toEqual(4)
  })
})

describe('decrementItem', () => {
  it('should decrease an item by 1', () => {
    const mockDetails = mockCartDetails()
    const initialState = {
      ...initialState,
      cartDetails: mockDetails,
      cartCount: 6,
      totalPrice: 1800
    }

    const products = Object.keys(mockDetails).map(
      (product) => mockDetails[product]
    )

    const product0 = products[0]

    const result = reducer(initialState, {
      type: ACTION_TYPES.decrementItem,
      payload: {
        id: products[0].id,
        options: { count: 1 }
      }
    })

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(5)
    expect(result.totalPrice).toEqual(1400)
    expect(cartDetails[product0.id].quantity).toEqual(1)
  })

  it('should remove an item when it hits 0 an item by 2', () => {
    const mockDetails = mockCartDetails()
    const initialState = {
      ...initialState,
      cartDetails: mockDetails,
      cartCount: 6,
      totalPrice: 1800
    }

    const products = Object.keys(mockDetails).map(
      (product) => mockDetails[product]
    )

    const product0 = products[0]

    const result = reducer(initialState, {
      type: ACTION_TYPES.decrementItem,
      payload: {
        id: product0.id,
        options: { count: 2 }
      }
    })

    const cartDetails = result.cartDetails

    expect(result.cartCount).toEqual(4)
    expect(result.totalPrice).toEqual(1000)
    expect(cartDetails[product0.id]).toBeFalsy()
  })
})

describe('clearCart', () => {
  it('should reset back into initialState', () => {
    const result = reducer(
      {
        ...initialState,
        cartDetails: mockCartDetails(),
        cartCount: 6,
        totalPrice: 1800
      },
      {
        type: ACTION_TYPES.clearCart,
        payload: undefined
      }
    )

    expect(result).toEqual(initialState)
  })
})

describe('setItemQuantity', () => {
  it('sets the proper quantity for a cart Item', () => {
    const mockDetails = mockCartDetails()

    const products = Object.keys(mockDetails).map(
      (product) => mockDetails[product]
    )

    const product0 = products[0]
    const result = reducer(
      {
        ...initialState,
        cartDetails: mockDetails,
        cartCount: 6,
        totalPrice: 1800
      },
      {
        type: ACTION_TYPES.setItemQuantity,
        payload: { id: product0.id, quantity: 10 }
      }
    )

    const cartDetails = result.cartDetails

    expect(cartDetails[product0.id].quantity).toBe(12)
    expect(result.cartCount).toBe(16)
    expect(result.totalPrice).toBe(5800)
  })
})

describe('removeItem', () => {
  it('removes the proper item from caart details', () => {
    const mockDetails = mockCartDetails()

    const products = Object.keys(mockDetails).map(
      (product) => mockDetails[product]
    )

    const product0 = products[0]

    const result = reducer(
      {
        ...initialState,
        cartDetails: mockDetails,
        cartCount: 6,
        totalPrice: 1800
      },
      { type: ACTION_TYPES.removeItem, payload: product0.id }
    )

    expect(result.cartDetails[product0.id]).toBeFalsy()
  })
})

describe('loadCart', () => {
  it('properly merges a new cartDetails into the current cartDetails', () => {
    const mockDetails = mockCartDetails()
    const mockDetails2 = mockCartDetails(
      { name: 'Carrots' },
      { name: 'Broccoli' }
    )

    const result = reducer(
      {
        ...initialState,
        cartDetails: mockDetails,
        cartCount: 6,
        totalPrice: 1800
      },
      {
        type: ACTION_TYPES.loadCart,
        payload: {
          cartDetails: mockDetails2,
          shouldMerge: true
        }
      }
    )

    expect(result.cartDetails).toEqual({ ...mockDetails, ...mockDetails2 })
    expect(result.totalPrice).toBe(3600)
    expect(result.cartCount).toBe(12)
  })
})

describe('handleCartClick', () => {
  it('should return shouldDisplayCart as true, if false', () => {
    const result = reducer(initialState, {
      type: ACTION_TYPES.handleCartClick,
      payload: undefined
    })
    expect(result.shouldDisplayCart).toBeFalsy()
  })

  it('should return shouldDisplayCart as, if true', () => {
    const result = reducer(
      { ...initialState, shouldDisplayCart: true },
      {
        type: ACTION_TYPES.handleCartClick,
        payload: undefined
      }
    )
    expect(result.shouldDisplayCart).toBeTruthy()
  })
})

describe('handleCloseCart', () => {
  it('should return shouldDisplayCart as false ', () => {
    const result = reducer(
      { ...initialState, shouldDisplayCart: true },
      {
        type: ACTION_TYPES.handleCloseCart,
        payload: undefined
      }
    )

    expect(result.shouldDisplayCart).toBeFalsy()
  })
})
