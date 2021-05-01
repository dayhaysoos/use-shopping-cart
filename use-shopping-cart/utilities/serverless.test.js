import { validateCartItems, formatLineItems } from './serverless'

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
  // eslint-disable-next-line camelcase
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
  // eslint-disable-next-line camelcase
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
  // eslint-disable-next-line camelcase
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
  // eslint-disable-next-line camelcase
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
        // eslint-disable-next-line camelcase
        order_id: '6753',
        // eslint-disable-next-line camelcase
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

  it("should combine the entry's product_data with the line item's product_data", () => {
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
            // eslint-disable-next-line camelcase
            order_id: '6753',
            // eslint-disable-next-line camelcase
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
        // eslint-disable-next-line camelcase
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
