import { validateCartItems } from './serverUtil';

const inventory = [
  {
    name: 'Bananas',
    sku: 'sku_abc123',
    price: 400,
    image: 'https: //www.fillmurray.com/300/300',
    currency: 'USD',
  },
  {
    name: 'Tangerines',
    sku: 'sku_xyz456',
    price: 100,
    image: 'https: //www.fillmurray.com/300/300',
    currency: 'USD',
  },
];

const mockSku = {
  sku: 'sku_abc123',
  name: 'Bananas',
  price: 200,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'usd',
};

const mockSku2 = {
  sku: 'sku_xyz456',
  price: 300,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'USD',
  name: 'Tangerines',
};

const mockDetailedSku = {
  [mockSku.sku]: {
    sku: mockSku.sku,
    quantity: 3,
    currency: mockSku.currency,
    price: mockSku.price,
    formattedValue: '$2.00',
    image: mockSku.image,
    value: 200,
    name: 'Bananas',
  },
};

const mockDetailedSku2 = {
  [mockSku2.sku]: {
    sku: mockSku2.sku,
    quantity: 1,
    currency: mockSku2.currency,
    price: mockSku2.price,
    formattedValue: '$3.00',
    image: mockSku2.image,
    value: 300,
    name: 'Tangerines',
  },
};

describe('validateCartItems', () => {
  it('references the correct price for each item', () => {
    expect(
      validateCartItems(inventory, { ...mockDetailedSku, ...mockDetailedSku2 })
    ).toStrictEqual([
      {
        name: inventory[0].name,
        amount: 1200,
        currency: inventory[0].currency,
        quantity: mockDetailedSku[inventory[0].sku].quantity,
      },
      {
        name: inventory[1].name,
        amount: 100,
        currency: inventory[1].currency,
        quantity: mockDetailedSku2[inventory[1].sku].quantity,
      },
    ]);
  });
});
