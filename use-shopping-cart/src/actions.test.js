import { cartSlice, cartInitialState } from '../core/slices/cartSlice'

const cartActions = cartSlice.actions

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

describe('actions', () => {
  it('should create an action to add item to cart', () => {
    const product = mockProduct()

    const expectedAction = {
      type: 'cart/addItem',
      payload: product
    }

    expect(cartActions.addItem(product)).toEqual(expectedAction)
  })

  it('should create an action to incrementItem', () => {
    const product = mockProduct()
    const expectedAction = {
      type: 'cart/incrementItem',
      payload: { id: product.id, count: 3 }
    }

    expect(cartActions.incrementItem({ id: product.id, count: 3 })).toEqual(
      expectedAction
    )
  })

  it('should create an action to decrementItem', () => {
    const product = mockProduct()
    const expectedAction = {
      type: 'cart/decrementItem',
      payload: { id: product.id, count: 3 }
    }

    expect(cartActions.decrementItem({ id: product.id, count: 3 })).toEqual(
      expectedAction
    )
  })

  it('should create an action to clear the cart', () => {
    const expectedAction = {
      type: 'cart/clearCart',
      payload: undefined
    }

    expect(cartActions.clearCart()).toEqual(expectedAction)
  })

  it('should create an action to setItemQuantity', () => {
    const product = mockProduct()
    const expectedAction = {
      type: 'cart/setItemQuantity',
      payload: { id: product.id, count: 3 }
    }

    expect(cartActions.setItemQuantity({ id: product.id, count: 3 })).toEqual(
      expectedAction
    )
  })

  it('should create an action to removeItem', () => {
    const product = mockProduct()
    const expectedAction = {
      type: 'cart/removeItem',
      payload: { id: product.id }
    }

    expect(cartActions.removeItem({ id: product.id })).toEqual(expectedAction)
  })

  it('should create an action to updateQuantity', () => {
    const product = mockProduct()
    const expectedAction = {
      type: 'cart/updateQuantity',
      payload: { id: product.id, quantity: 4 }
    }

    expect(cartActions.updateQuantity({ id: product.id, quantity: 4 })).toEqual(
      expectedAction
    )
  })
})
