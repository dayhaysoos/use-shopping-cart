import { calculateTotalValue } from './util';

describe('calculateTotalValue', () => {
  it('adds all the prices together', () => {
    const cartItems = [
      { price: 100, currency: 'USD' },
      { price: 200, currency: 'USD' },
    ];

    expect(calculateTotalValue('USD', cartItems)).toBe('$3.00');
  });

  it('handles cents', () => {
    const cartItemsWithDollarsAndCents = [{ price: 23 }, { price: 345 }];

    const cartItemsWithOnlyCents = [{ price: 1 }, { price: 2 }];

    expect(calculateTotalValue('USD', cartItemsWithDollarsAndCents)).toBe(
      '$3.68'
    );
    expect(calculateTotalValue('USD', cartItemsWithOnlyCents)).toBe('$0.03');
  });

  it('handles different currencies', () => {
    const cartItems = [{ price: 100 }, { price: 100 }];

    expect(calculateTotalValue('GBP', cartItems)).toBe('£2.00');
    expect(calculateTotalValue('EUR', cartItems)).toBe('€2.00');
  });

  it('handles different item currencies', () => {
    const cartItems = [
      { price: 100, currency: 'EUR' },
      { price: 100, currency: 'GBP' },
      { price: 100 },
    ];

    expect(calculateTotalValue('USD', cartItems)).toBe('$3.00');
  });
});
