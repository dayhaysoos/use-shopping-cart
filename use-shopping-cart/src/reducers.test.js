import reducer from '../core/slices/cartSlice'
import store from '../core/store'

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

function mockCartDetails(overrides) {
  return {
    [`sku_abc${counter}`]: {
      sku: `sku_abc${counter++}`,
      name: 'Bananas',
      image: 'https://blah.com/banana.avif',
      price: 400,
      currency: 'USD',
      value: 800,
      quantity: 2,
      formattedValue: '$8.00',
      ...overrides
    },
    [`sku_efg${counter}`]: {
      sku: `sku_efg${counter++}`,
      name: 'Oranges',
      image: 'https://blah.com/orange.avif',
      currency: 'USD',
      price: 250,
      value: 1000,
      quantity: 4,
      formattedValue: '$10.00',
      ...overrides
    }
  }
}

export const cartInitialState = {
  lastClicked: '',
  shouldDisplayCart: false,
  stripe: null,
  lastClicked: '',
  shouldDisplayCart: false,
  cartDetails: {},
  totalPrice: 0,
  cartCount: 0,
  currency: 'USD',
  language: 'en-US'
}

describe('cart reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(cartInitialState)
  })

  it('should handle addItem', () => {
    const product = mockProduct()

    const result = reducer(cartInitialState, {
      type: 'cart/addItem',
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
    const product = mockProduct()

    const result = reducer(
      { ...cartInitialState, cartCount: 2, cartDetails: mockCartDetails() },
      {
        type: 'cart/addItem',
        payload: {
          product,
          options: { count: 1, price_metadata: {}, product_metadata: {} }
        }
      }
    )

    const cartDetails = result.cartDetails

    expect(result.cartCount).toBe(3)
  })
})
