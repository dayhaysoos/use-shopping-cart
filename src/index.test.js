import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useStripeCart, CartProvider } from './index';

// mock timer using jest
jest.useFakeTimers();

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

describe('useStripeCart', () => {
  it('renderps', () => {
    const wrapper = ({ children }) => (
      <CartProvider
        billingAddressCollection={false}
        successUrl={'https://egghead.io'}
        cancelUrl={'https://egghead.io'}
        stripe={stripeMock}
      >
        {children}
      </CartProvider>
    );
    const { result } = renderHook(() => useStripeCart(), { wrapper });

    expect(result.current.cartItems).toEqual(INITIAL_STATE.cartItems);
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
