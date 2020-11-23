import { validateCartItems, formatLineItems } from './serverUtil'

const inventory = [
  {
    name: 'Banana',
    description: 'Yummy yellow fruit',
    sku: 'sku_abc123',
    price: 400,
    image: 'https: //www.fillmurray.com/300/300',
    currency: 'USD'
  },
  {
    name: 'Banana',
    sku: 'sku_xyz456',
    price: 100,
    currency: 'USD'
  }
]

const mockSku = {
  sku: 'sku_abc123',
  name: 'Banana',
  price: 200,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'usd',
  sku_id: 'sku_abc123',
  product_data: { metadata: { type: 'test' } }
}

const mockSku2 = {
  sku: 'sku_xyz456',
  price: 300,
  currency: 'USD',
  name: 'Banana'
}

const mockDetailedSku = {
  [mockSku.sku]: {
    sku: mockSku.sku,
    quantity: 3,
    currency: mockSku.currency,
    price: mockSku.price,
    formattedValue: '$2.00',
    image: mockSku.image,
    value: 200,
    name: 'Banana',
    sku_id: 'sku_abc123',
    product_data: { metadata: { type: 'test' } }
  }
}

const mockDetailedSku2 = {
  [mockSku2.sku]: {
    sku: mockSku2.sku,
    quantity: 1,
    currency: mockSku2.currency,
    price: mockSku2.price,
    formattedValue: '$3.00',
    image: mockSku2.image,
    value: 300,
    name: 'Banana'
  }
}

const mockPrice = {
  price_id: 'price_123',
  unit_amount: 350,
  currency: 'USD',
  name: 'Pants'
}

const mockDetailedPrice = {
  [mockPrice.price_id]: {
    ...mockPrice,
    quantity: 5
  }
}

describe('validateCartItems', () => {
  it('matches on SKU & references the correct price & sets description + images if present', () => {
    expect(
      validateCartItems(inventory, { ...mockDetailedSku, ...mockDetailedSku2 })
    ).toStrictEqual([
      {
        price_data: {
          currency: inventory[0].currency,
          unit_amount: 400,
          product_data: {
            name: inventory[0].name,
            description: 'Yummy yellow fruit',
            images: ['https: //www.fillmurray.com/300/300']
          }
        },
        quantity: mockDetailedSku[inventory[0].sku].quantity
      },
      {
        price_data: {
          currency: inventory[1].currency,
          unit_amount: 100,
          product_data: {
            name: inventory[1].name
          }
        },
        quantity: mockDetailedSku2[inventory[1].sku].quantity
      }
    ])
  })

  it('Properly spreads product_data from the product object into price_data.product_data', () => {
    inventory[0].product_data = { metadata: { type: 'test' } }
    expect(validateCartItems(inventory, { ...mockDetailedSku })).toStrictEqual([
      {
        price_data: {
          currency: inventory[0].currency,
          unit_amount: 400,
          product_data: {
            name: inventory[0].name,
            description: 'Yummy yellow fruit',
            images: ['https: //www.fillmurray.com/300/300'],
            metadata: {
              type: 'test'
            }
          }
        },
        quantity: mockDetailedSku[inventory[0].sku].quantity
      }
    ])
  })

  it('Properly spreads price_data from the product object into price_data', () => {
    inventory[0].price_data = { metadata: { type: 'test' } }
    expect(validateCartItems(inventory, { ...mockDetailedSku })).toStrictEqual([
      {
        price_data: {
          currency: inventory[0].currency,
          unit_amount: 400,
          metadata: { type: 'test' },
          product_data: {
            name: inventory[0].name,
            description: 'Yummy yellow fruit',
            images: ['https: //www.fillmurray.com/300/300'],
            metadata: {
              type: 'test'
            }
          }
        },
        quantity: mockDetailedSku[inventory[0].sku].quantity
      }
    ])
  })

  it('throws an error if product does not exist in inventory', () => {
    expect(() => {
      validateCartItems(inventory, { sku_1234: { sku: 'sku_1234' } })
    }).toThrow('Product sku_1234 not found!')
  })
})

describe('formatLineItems', () => {
  it('Formats line items with price_id appropriately', () => {
    expect(formatLineItems(mockDetailedPrice)).toStrictEqual([
      { price: 'price_123', quantity: 5 }
    ])
  })

  it('Formats line items with sku_id appropriately', () => {
    expect(formatLineItems(mockDetailedSku)).toStrictEqual([
      { price: 'sku_abc123', quantity: 3 }
    ])
  })
})
