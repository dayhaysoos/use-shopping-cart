import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useShoppingCart, CartProvider } from './index';

afterEach(() => window.localStorage.clear());

const stripeMock = {
  redirectToCheckout: jest.fn().mockReturnValue(() => Promise.resolve()),
};

const INITIAL_STATE = {
  lastClicked: '',
  toggleRightMenu: false,
  cartItems: [],
  billingAddressCollection: false,
  allowedCountries: null,
  language: 'en-US',
  currency: 'USD',
  successUrl: 'https://egghead.io/success',
  cancelUrl: 'https://egghead.io/cancel',
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
  currency: 'USD',
};
const mockSku2 = {
  sku: 'sku_xyz456',
  price: 300,
  image: 'https://www.fillmurray.com/300/300',
  currency: 'USD',
};

const mockDetailedSku = {
  [mockSku.sku]: {
    sku: mockSku.sku,
    quantity: 1,
    currency: mockSku.currency,
    price: mockSku.price,
    formattedValue: '$2.00',
    image: mockSku.image,
    value: 200,
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
  },
};

const createWrapper = (props = {}) => ({ children }) => (
  <CartProvider
    successUrl="https://egghead.io/success"
    cancelUrl="https://egghead.io/cancel"
    stripe={stripeMock}
    currency="USD"
    {...props}
  >
    {children}
  </CartProvider>
);

describe('useShoppingCart', () => {
  let result;
  beforeEach(() => {
    const wrapper = createWrapper();
    result = renderHook(() => useShoppingCart(), { wrapper }).result;
  });

  it('renders', () => {
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

  it('checkoutData array updates with sku id and quantity based on addItems', () => {
    expect(result.current.checkoutData).toEqual([]);

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.checkoutData).toEqual([
      {
        sku: mockSku.sku,
        quantity: 1,
      },
    ]);
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

  it('removeCartItem removes item from checkoutData array', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.checkoutData).toEqual([
      { sku: mockSku.sku, quantity: 1 },
    ]);

    act(() => {
      result.current.removeCartItem(mockSku.sku);
    });

    expect(result.current.checkoutData).toEqual([]);
  });

  it('removeCartItem removes the correct item from the cart', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku2);
    });

    expect(result.current.checkoutData).toEqual([
      { sku: mockSku.sku, quantity: 1 },
      { sku: mockSku2.sku, quantity: 1 },
    ]);

    act(() => {
      result.current.removeCartItem(mockSku.sku);
    });

    expect(result.current.checkoutData).toEqual([
      { sku: mockSku2.sku, quantity: 1 },
    ]);
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
        formattedValue: '$4.00',
        price: mockSku.price,
        image: 'https://www.fillmurray.com/300/300',
        quantity: 2,
        currency: mockSku.currency,
        sku: mockSku.sku,
        value: mockSku.price * 2,
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

  it('cartItems gets items removed when removeCartItem is ran', () => {
    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartItems).toEqual([mockSku]);

    act(() => {
      result.current.removeCartItem(mockSku.sku);
    });

    expect(result.current.cartItems).toEqual([]);
  });

  it('cartItems gets one item removed when removeCartItem is ran', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku2);
    });

    expect(result.current.cartItems).toEqual([mockSku, mockSku2]);

    act(() => {
      result.current.removeCartItem(mockSku.sku);
    });

    expect(result.current.cartItems).toEqual([mockSku2]);
  });

  it('reduceItemByOne reduces the cartItem amount of the target SKU by one', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku);
      result.current.addItem(mockSku);
    });

    expect(result.current.cartItems.length).toEqual(3);

    act(() => {
      result.current.reduceItemByOne(mockSku.sku);
    });
    expect(result.current.cartItems.length).toEqual(2);
  });

  it('reduceItemByOne reduces the cartItems amount of the target SKU by one even when other SKUs are present', () => {
    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku);
      result.current.addItem(mockSku);
      result.current.addItem(mockSku2);
    });
    expect(result.current.cartItems.length).toEqual(4);

    act(() => {
      result.current.reduceItemByOne(mockSku.sku);
    });
    expect(result.current.cartItems.length).toEqual(3);
  });
});

describe('useShoppingCart redirectToCheckout', () => {
  beforeEach(() => {
    stripeMock.redirectToCheckout.mockClear();
  });

  it('should send the correct default values', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useShoppingCart(), { wrapper });

    result.current.redirectToCheckout();

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled();
    expect(stripeMock.redirectToCheckout.mock.calls[0][0]).toEqual({
      items: [],
      successUrl: 'https://egghead.io/success',
      cancelUrl: 'https://egghead.io/cancel',
      billingAddressCollection: 'auto',
      submitType: 'auto',
    });
  });

  it('should send all formatted items', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useShoppingCart(), { wrapper });

    act(() => {
      result.current.addItem(mockSku);
      result.current.addItem(mockSku);
    });
    result.current.redirectToCheckout();

    const expectedItems = [{ sku: mockSku.sku, quantity: 2 }];

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled();
    expect(result.current.checkoutData).toEqual(expectedItems);
    expect(stripeMock.redirectToCheckout.mock.calls[0][0].items).toEqual(
      expectedItems
    );
  });

  it('should send correct billingAddressCollection', () => {
    const wrapper = createWrapper({ billingAddressCollection: true });
    const { result } = renderHook(() => useShoppingCart(), { wrapper });

    result.current.redirectToCheckout();

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled();
    expect(
      stripeMock.redirectToCheckout.mock.calls[0][0].billingAddressCollection
    ).toBe('required');
  });

  it('should send correct shippingAddressCollection', () => {
    const wrapper = createWrapper({ allowedCountries: ['US', 'CA'] });
    const { result } = renderHook(() => useShoppingCart(), { wrapper });

    result.current.redirectToCheckout();

    expect(stripeMock.redirectToCheckout).toHaveBeenCalled();
    expect(
      stripeMock.redirectToCheckout.mock.calls[0][0].shippingAddressCollection
        .allowedCountries
    ).toEqual(['US', 'CA']);
  });
});

describe('useShoppingCart persistency', () => {
  function cartItemsFromStorage() {
    return JSON.parse(localStorage.getItem('cart-items'));
  }

  it('should save cartItems to localStorage', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useShoppingCart(), { wrapper });

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(cartItemsFromStorage()).toEqual(result.current.cartItems);
  });

  it('should load cartItems from localStorage', () => {
    let wrapper = createWrapper();
    let { result } = renderHook(() => useShoppingCart(), { wrapper });

    act(() => {
      result.current.addItem(mockSku);
    });

    wrapper = createWrapper();
    result = renderHook(() => useShoppingCart(), { wrapper }).result;

    expect(result.current.cartItems).toEqual(cartItemsFromStorage());
  });

  it('clearCart removes everything from cartItems array', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useShoppingCart(), { wrapper });

    act(() => {
      result.current.addItem(mockSku);
    });

    expect(result.current.cartItems).toEqual([mockSku]);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toEqual([]);
  });
});

describe('useShoppingCart stripe handling', () => {
  it('if stripe is defined, redirectToCheckout can be called', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useShoppingCart(), { wrapper });
    result.current.redirectToCheckout();
    expect(stripeMock.redirectToCheckout).toHaveBeenCalled();
  });

  it('if stripe is undefined, redirectToCheckout throws an error', async () => {
    const wrapper = createWrapper({ stripe: null });
    const { result } = renderHook(() => useShoppingCart(), { wrapper });
    expect.assertions(1);
    try {
      await result.current.redirectToCheckout();
    } catch (e) {
      expect(e).toEqual(new Error('Stripe is not defined'));
    }
  });
});
