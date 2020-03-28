import { calculateTotalPrice } from './util';

describe('calculateTotalPrice', () => {
  it('adds all the prices together', () => {
    const cartItems = [
      { price: 100, currency: 'USD' },
      { price: 200, currency: 'USD' }
    ];
    
    expect(calculateTotalPrice('USD', cartItems)).toBe('$3.00');
  });
  
  it('handles cents', () => {
    const cartItemsWithDollarsAndCents = [
      { price: 23, currency: 'USD' },
      { price: 345, currency: 'USD' }
    ];
    
    const cartItemsWithOnlyCents = [
      { price: 1, currency: 'USD' },
      { price: 2, currency: 'USD' }
    ];
    
    expect(calculateTotalPrice('USD', cartItemsWithDollarsAndCents)).toBe('$3.68');
    expect(calculateTotalPrice('USD', cartItemsWithOnlyCents)).toBe('$0.03');
  });
  
  it('handles different currencies', () => {
    const cartItems = [
      { price: 100, currency: 'GBP' },
      { price: 100, currency: 'GBP' }
    ];
    
    // defaults to USD but finds GBP
    expect(calculateTotalPrice('USD', cartItems)).toBe('£2.00');
  });
  
  it('handles missing currencies', () => {
    const cartItemsMissingAllCurrencies = [
      { price: 100 },
      { price: 100 }
    ];
    const cartItemsMissingOneCurrency = [
      { price: 100, currency: 'GBP' },
      { price: 100 }
    ];
    
    expect(calculateTotalPrice('USD', cartItemsMissingAllCurrencies)).toBe('$2.00');
    expect(calculateTotalPrice('USD', cartItemsMissingOneCurrency)).toBe('£2.00');
  });
});
