import { validateCartItems } from './serverUtil'

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
  currency: 'usd'
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
    name: 'Banana'
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

describe('validateCartItems', () => {
  it('matches on SKU & references the correct price & sets description + images if present', () => {
    expect(
      validateCartItems(inventory, { ...mockDetailedSku, ...mockDetailedSku2 })
    ).toStrictEqual([
      {
        name: inventory[0].name,
        description: 'Yummy yellow fruit',
        amount: 400,
        currency: inventory[0].currency,
        quantity: mockDetailedSku[inventory[0].sku].quantity,
        images: ['https: //www.fillmurray.com/300/300']
      },
      {
        name: inventory[1].name,
        amount: 100,
        currency: inventory[1].currency,
        quantity: mockDetailedSku2[inventory[1].sku].quantity
      }
    ])
  })
  it('throws an error if product does not exist in inventory', () => {
    expect(() => {
      validateCartItems(inventory, { sku_1234: { sku: 'sku_1234' } })
    }).toThrow('Product sku_1234 not found!')
  })
})
