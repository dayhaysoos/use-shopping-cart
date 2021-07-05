import { formatCurrencyString, filterCart } from './index'

describe('formatCurrencyString()', () => {
  it('whole dollar', () => {
    expect(
      formatCurrencyString({ value: 100, currency: 'USD', language: 'en-US' })
    ).toBe('$1.00')
    expect(
      formatCurrencyString({ value: 2000, currency: 'USD', language: 'en-US' })
    ).toBe('$20.00')
    expect(
      formatCurrencyString({ value: 30000, currency: 'USD', language: 'en-US' })
    ).toBe('$300.00')
  })
  it('thousands', () => {
    expect(
      formatCurrencyString({
        value: 100000,
        currency: 'USD',
        language: 'en-us'
      })
    ).toBe('$1,000.00')
    expect(
      formatCurrencyString({
        value: 2000000,
        currency: 'USD',
        language: 'en-us'
      })
    ).toBe('$20,000.00')
  })
  it('cents', () => {
    expect(
      formatCurrencyString({ value: 1, currency: 'USD', language: 'en-US' })
    ).toBe('$0.01')
    expect(
      formatCurrencyString({ value: 15, currency: 'USD', language: 'en-US' })
    ).toBe('$0.15')
    expect(
      formatCurrencyString({ value: 439, currency: 'USD', language: 'en-US' })
    ).toBe('$4.39')
  })
})

describe('filterCart', () => {
  it('filter out all cart items that fail filter callback', async () => {
    const cartDetails = {
      'test-sku-123': {
        sku: 'test-sku-123',
        name: 'Bananas',
        image: 'https://blah.com/banana.avif',
        price: 200,
        currency: 'USD',
        value: 400,
        quantity: 2,
        formattedValue: '$4.00'
      },
      'test-sku-234': {
        sku: 'test-sku-234',
        name: 'Oranges',
        image: 'https://blah.com/orange.avif',
        currency: 'USD',
        price: 250,
        value: 1000,
        quantity: 4,
        formattedValue: '$10.00'
      }
    }

    const mockFilter = (item) => item.value < 500
    const filteredCart = await filterCart(cartDetails, mockFilter)

    expect(filteredCart).toEqual({
      'test-sku-123': {
        sku: 'test-sku-123',
        name: 'Bananas',
        image: 'https://blah.com/banana.avif',
        price: 200,
        currency: 'USD',
        value: 400,
        quantity: 2,
        formattedValue: '$4.00'
      }
    })
  })
})
