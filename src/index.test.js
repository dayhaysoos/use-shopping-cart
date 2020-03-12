import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
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
  image: '',
  currency: 'usd',
};

const createWrapper = () => ({ children }) => {
  return (
    <CartProvider
      billingAddressCollection={false}
      successUrl={'https://egghead.io'}
      cancelUrl={'https://egghead.io'}
      stripe={stripeMock}
    >
      {children}
    </CartProvider>
  );
};

describe('useStripeCart', () => {
  it('renderps', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStripeCart(), { wrapper });

    expect(result.current.cartItems).toEqual(INITIAL_STATE.cartItems);
  });

  it('addItems adds items to cart', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStripeCart(), { wrapper });

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartItems).toEqual([mockSku]);
  });

  it('cartCount increments when addItem is executed', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStripeCart(), { wrapper });

    expect(result.current.cartCount).toBe(0);

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartCount).toBe(1);
  });
});

// describe('useMyHook', () => {
//   it('updates every second', () => {
//     const { result } = renderHook(() => useMyHook());

//     expect(result.current).toBe(0);

//     // Fast-forward 1sec
//     act(() => {
//       jest.advanceTimersByTime(1000);
//     });

//     // Check after total 1 sec
//     expect(result.current).toBe(1);

//     // Fast-forward 1 more sec
//     act(() => {
//       jest.advanceTimersByTime(1000);
//     });

//     // Check after total 2 sec
//     expect(result.current).toBe(2);
//   });
// });
