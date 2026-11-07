import { vi } from 'vitest'
import { validateCartItems, formatLineItems } from './serverless'
import { ShoppingCart } from '../core/ShoppingCart'

const inventory = [
  {
    id: 'price_bananas',
    price: 400,
    currency: 'USD',
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    product_data: {
      metadata: { availability: 'limited time', type: 'fruit' }
    }
  },
  {
    id: 'price_oranges',
    price: 100,
    currency: 'USD',
    name: 'Oranges',
    description: 'Juicy orange fruit',
    image:
      'https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80'
  },
  {
    id: 'id_donation',
    price: 2000,
    currency: 'USD',
    name: 'One-Time Charitable Donation'
  },
  {
    id: 'id_burger',
    price: 850,
    currency: 'USD',
    name: 'Burger',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80',
    product_data: {
      metadata: { type: 'meal' }
    }
  }
]

const cartDetails = {
  price_bananas: {
    id: 'price_bananas',
    price: 400,
    currency: 'USD',
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    quantity: 1,
    value: 400,
    formattedValue: '$4.00',
    product_data: {
      metadata: { availability: 'limited time', type: 'fruit' }
    }
  },

  price_oranges: {
    id: 'price_oranges',
    price: 100,
    currency: 'USD',
    name: 'Oranges',
    description: 'Juicy orange fruit',
    image:
      'https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80',
    quantity: 2,
    value: 200,
    formattedValue: '$2.00',
    price_data: {},
    product_data: {}
  },

  id_donation: {
    id: 'donation',
    price: 2000,
    currency: 'USD',
    name: 'One-Time Charitable Donation',
    quantity: 1,
    value: 2000,
    formattedValue: '$20.00',
    price_data: {},
    product_data: {}
  },

  id_burger: {
    id: 'id_burger',
    price: 850,
    currency: 'USD',
    name: 'Burger',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80',
    quantity: 1,
    value: 850,
    formattedValue: '$8.50',
    price_data: {},
    product_data: {
      metadata: {
        type: 'meal',
        order_id: '6753',
        extra_toppings: 'jalapeños, mustard, mayo, caramelized onions'
      }
    }
  }
}

describe('validateCartItems', () => {
  const lineItems = validateCartItems(inventory, cartDetails)

  it('should set the currency, unit_amount, name, and quantity correctly', () => {
    expect(lineItems[2]).toStrictEqual({
      price_data: {
        currency: 'USD',
        unit_amount: 2000,
        product_data: {
          name: 'One-Time Charitable Donation'
        }
      },
      quantity: 1
    })
  })

  it('should set the description to its value and images to an array containing the image in the entry', () => {
    expect(lineItems[1]).toStrictEqual({
      price_data: {
        currency: 'USD',
        unit_amount: 100,
        product_data: {
          name: 'Oranges',
          description: 'Juicy orange fruit',
          images: [
            'https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80'
          ]
        }
      },
      quantity: 2
    })
  })

  it("should combine the inventory's product_data with the line item's product_data", () => {
    expect(lineItems[0]).toStrictEqual({
      price_data: {
        currency: 'USD',
        unit_amount: 400,
        product_data: {
          name: 'Bananas',
          description: 'Yummy yellow fruit',
          images: [
            'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80'
          ],
          metadata: {
            availability: 'limited time',
            type: 'fruit'
          }
        }
      },
      quantity: 1
    })
  })

  it("should pass the entry's product_data.metadata through to the line item's product_data", () => {
    expect(lineItems[3]).toStrictEqual({
      price_data: {
        currency: 'USD',
        unit_amount: 850,
        product_data: {
          name: 'Burger',
          images: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80'
          ],
          metadata: {
            type: 'meal',
            order_id: '6753',
            extra_toppings: 'jalapeños, mustard, mayo, caramelized onions'
          }
        }
      },
      quantity: 1
    })
  })

  it('throws an error if product does not exist in inventory', () => {
    expect(() => {
      validateCartItems(inventory, {
        price_icecream: {
          id: 'price_icecream',
          price: 2000,
          currency: 'USD',
          name: 'Ice Cream',
          quantity: 1,
          value: 2000,
          formattedValue: '$20.00',
          price_data: {},
          product_data: {
            metadata: {
              flavor: 'rocky road'
            }
          }
        }
      })
    }).toThrow(
      'Invalid Cart: product with id "price_icecream" is not in your inventory.'
    )
  })

  it('throws an error when inventory is not iterable', () => {
    expect(() => {
      validateCartItems(null, cartDetails)
    }).toThrow('Invalid Cart: inventory must be an iterable collection.')
  })

  it('throws an error when cartDetails is not an object', () => {
    expect(() => {
      validateCartItems(inventory, null)
    }).toThrow('Invalid Cart: cartDetails must be an object.')
  })

  it('throws an error when cart items are not objects', () => {
    expect(() => {
      validateCartItems(inventory, { bad: 'item' })
    }).toThrow('Invalid Cart: cart item "bad" must be an object.')
  })

  it('throws an error when a quantity is not a positive integer', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const [id] = Object.keys(cartDetails)
    expect(() => {
      validateCartItems(inventory, {
        [id]: { ...cartDetails[id], quantity: 0 }
      })
    }).toThrow(
      `Invalid quantity in cart item "${id}": quantity must be greater than 0. The current value is 0.`
    )
    vi.restoreAllMocks()
  })

  it('throws an error when inventory items are not objects', () => {
    expect(() => {
      validateCartItems([null], cartDetails)
    }).toThrow('Invalid Cart: inventory items must be objects.')
  })

  it('returns first match when inventory has overlapping id and sku values across products', () => {
    // ProductA has sku: 'ABC', ProductB has id: 'ABC'
    // The first match (ProductA via sku) should win
    const inventoryWithOverlap = [
      {
        sku: 'ABC',
        price: 500,
        currency: 'USD',
        name: 'ProductA (via SKU)'
      },
      {
        id: 'ABC',
        price: 1000,
        currency: 'USD',
        name: 'ProductB (via ID)'
      }
    ]

    const cartWithOverlap = {
      ABC: {
        id: 'ABC',
        price: 500,
        currency: 'USD',
        name: 'ProductA (via SKU)',
        quantity: 1,
        value: 500,
        formattedValue: '$5.00'
      }
    }

    const result = validateCartItems(inventoryWithOverlap, cartWithOverlap)

    // Should use ProductA's data (first match), not ProductB
    expect(result[0].price_data.unit_amount).toBe(500)
    expect(result[0].price_data.product_data.name).toBe('ProductA (via SKU)')
  })
})

describe('validateCartItems with carts built by ShoppingCart', () => {
  const base = { price: 250, currency: 'USD' }

  it.each([
    ['id', { id: 'prod_id', name: 'By id' }],
    ['price_id', { price_id: 'price_123', name: 'By price_id' }],
    ['sku_id', { sku_id: 'sku_123', name: 'By sku_id' }],
    ['sku', { sku: 'SKU-123', name: 'By sku' }]
  ])('accepts a product identified by %s', (_field, fields) => {
    const product = { ...base, ...fields }
    const cart = new ShoppingCart({ shouldPersist: false })
    cart.addItem(product, { count: 2 })

    const [item] = validateCartItems([product], cart.getState().cartDetails)

    expect(item.quantity).toBe(2)
    expect(item.price_data.unit_amount).toBe(250)
    expect(item.price_data.product_data.name).toBe(fields.name)
  })

  it('matches a product that has several ID fields by the one the cart used', () => {
    const product = {
      ...base,
      price_id: 'price_abc',
      sku: 'SKU-ABC',
      name: 'Both'
    }
    const cart = new ShoppingCart({ shouldPersist: false })
    cart.addItem(product)

    const [item] = validateCartItems([product], cart.getState().cartDetails)

    expect(item.price_data.product_data.name).toBe('Both')
  })

  it('sends product_metadata from addItem to Stripe', () => {
    const product = { ...base, id: 'prod_meta', name: 'Meta' }
    const cart = new ShoppingCart({ shouldPersist: false })
    cart.addItem(product, {
      product_metadata: { gift_wrap: 'yes' },
      price_metadata: { billing_cycle: 'monthly' }
    })

    const [item] = validateCartItems([product], cart.getState().cartDetails)

    expect(item.price_data.product_data.metadata).toEqual({ gift_wrap: 'yes' })
    expect(item.price_data).not.toHaveProperty('metadata')
  })

  it('still accepts carts keyed by a secondary ID field', () => {
    const product = { ...base, id: 'prod_1', sku: 'SKU-1', name: 'Secondary' }
    const cartDetails = {
      'SKU-1': { ...product, quantity: 1, value: 250, formattedValue: '$2.50' }
    }

    const [item] = validateCartItems([product], cartDetails)

    expect(item.price_data.product_data.name).toBe('Secondary')
  })
})

describe('formatLineItems', () => {
  it('Extracts the Price ID from cart entries', () => {
    expect(formatLineItems(cartDetails)).toStrictEqual([
      { price: 'price_bananas', quantity: 1 },
      { price: 'price_oranges', quantity: 2 },
      { price: 'id_donation', quantity: 1 },
      { price: 'id_burger', quantity: 1 }
    ])
  })
})
