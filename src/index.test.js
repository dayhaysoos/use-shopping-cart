import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useStripeCart, CartProvider } from './index';

afterEach(() => window.localStorage.clear());

const stripeMock = {
  redirectToCheckout: jest.fn().mockReturnValue(() => Promise.resolve()),
};

const INITIAL_STATE = {
  lastClicked: '',
  skus: {},
  toggleRightMenu: false,
  cartItems: [],
  billingAddressCollection: false,
  successUrl: 'https://egghead.io',
  cancelUrl: 'https://egghead.io',
};

const mockSku = {
  sku: 'sku_abc123',
  price: 200,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'usd',
};

const mockSku3 = {
  sku: 'sku_abc234',
  price: 100,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'usd',
};
const mockSku2 = {
  sku: 'sku_xyz456',
  price: 300,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'gbp',
};

const mockDetailedSku = {
  [mockSku.sku]: {
    sku: mockSku.sku,
    quantity: 1,
    currency: mockSku.currency,
    price: mockSku.price,
    formattedPrice: '$2.00',
    image: mockSku.image,
  },
};

const mockDetailedSku2 = {
  [mockSku2.sku]: {
    sku: mockSku2.sku,
    quantity: 1,
    currency: mockSku2.currency,
    price: mockSku2.price,
    formattedPrice: '£3.00',
    image: mockSku2.image,
  },
};

const createWrapper = () => ({ children }) => {
  return (
    <CartProvider
      billingAddressCollection={false}
      successUrl="https://egghead.io"
      cancelUrl="https://egghead.io"
      stripe={stripeMock}
      currency="USD"
    >
      {children}
    </CartProvider>
  );
};


let result;
beforeEach(() => {
  const wrapper = createWrapper();
  result = renderHook(() => useStripeCart(), { wrapper }).result;
});

describe('useStripeCart', () => {
  it('renderps', () => {
    expect(result.current.cartItems).toEqual(INITIAL_STATE.cartItems);
  });

  it('addItems adds items to cart', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartItems).toEqual([mockSku]);
  });

  it('cartCount increments when addItem is executed', () => {
    expect(result.current.cartCount).toBe(0);

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartCount).toBe(1);
  });

  it('skus object updates with sku id and quantity based on addItems', () => {
    expect(result.current.skus).toEqual({});

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.skus).toEqual({
      [mockSku.sku]: 1,
    });
  });

  it('checkoutData builds an array of objects to prepare for redirectToCheckout', () => {
    expect(result.current.checkoutData).toEqual([]);

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.checkoutData).toEqual([
      { sku: mockSku.sku, quantity: 1 },
    ]);
  });

  it('deleteItem removes item from sku object', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.skus).toEqual({
      [mockSku.sku]: 1,
    });

    act(() => {
      result.current.deleteItem(mockSku.sku);
    });

    expect(result.current.skus).toEqual({});
  });

  it('deleteItem remove the correct item from the cart', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku2);
    });

    expect(result.current.skus).toEqual({
      [mockSku.sku]: 1,
      [mockSku2.sku]: 1,
    });

    act(() => {
      result.current.deleteItem(mockSku.sku);
    });

    expect(result.current.skus).toEqual({
      [mockSku2.sku]: 1,
    });
  });

  it('should update totalPrice', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.totalPrice()).toBe('$2.00');
  });

  it('should update totalPrice when two items are added', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku3);
    });

    expect(result.current.totalPrice()).toBe('$3.00');
  });

  it('storeLastClicked stores the correct value', () => {
    act(() => {
      result.current.storeLastClicked(mockSku.sku);
    });

    expect(result.current.lastClicked).toBe(mockSku.sku);
  });

  it('handleQuantityChange changes the quantity correctly', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.handleQuantityChange(10, mockSku.sku);
    });

    expect(result.current.skus).toEqual({
      [mockSku.sku]: 10,
    });
    expect(result.current.cartCount).toBe(10);
  });

  it('handleQuantityChange removes item from skus object when quantity reaches 0', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.handleQuantityChange(0, mockSku.sku);
    });

    expect(result.current.skus).toEqual({});
  });

  it('shouldDisplayCart should be false initially', () => {
        
    expect(result.current.shouldDisplayCart).toBe(false);
  });

  it('shouldDisplayCart should be true after handleCartClick', () => {
    act(() => {
      result.current.handleCartClick();
    });

    expect(result.current.shouldDisplayCart).toBe(true);
  });

  it('shouldDisplayCart should be false after 2 handleCartClick', () => {
    act(() => {
      result.current.handleCartClick();
      result.current.handleCartClick();
    });

    expect(result.current.shouldDisplayCart).toBe(false);
  });

  it('cartDetails should add give back a more detailed version of what skus gives back', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartDetails).toEqual(mockDetailedSku);
  });

  it('cartDetails will increase quantitave values when same item is added to cart', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartDetails).toEqual(mockDetailedSku);

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartDetails).toEqual({
      [mockSku.sku]: {
        formattedPrice: '$4.00',
        price: mockSku.price * 2,
        image: 'https://www.fillmurray.com/300/300',
        quantity: 2,
        currency: mockSku.currency,
        sku: mockSku.sku,
      },
    });
  });

  it('cartDetails can add 2 skus', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku2);
    });

    expect(result.current.cartDetails).toEqual({
      ...mockDetailedSku,
      ...mockDetailedSku2,
    });
  });

  it('cartItems gets items removed when deleteItem is ran', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartItems).toEqual([mockSku]);

    act(() => {
      result.current.deleteItem(mockSku.sku);
    });

    expect(result.current.cartItems).toEqual([]);
  });

  it('cartItems gets one item removed when deleteItem is ran', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku2);
    });

    expect(result.current.cartItems).toEqual([mockSku, mockSku2]);

    act(() => {
      result.current.deleteItem(mockSku.sku);
    });

    expect(result.current.cartItems).toEqual([mockSku2]);
  });
});
