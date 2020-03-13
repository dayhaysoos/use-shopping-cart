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

  it('skus object updates with sku id and quantity based on addItems', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStripeCart(), { wrapper });

    expect(result.current.skus).toEqual({});

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.skus).toEqual({
      [mockSku.sku]: 1,
    });
  });

  it('checkoutData builds an array of objects to prepare for redirectToCheckout', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStripeCart(), { wrapper });

    expect(result.current.checkoutData).toEqual([]);

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.checkoutData).toEqual([
      { sku: mockSku.sku, quantity: 1 },
    ]);
  });

  it('deleteItem removes item from sku object', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStripeCart(), { wrapper });

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
});
