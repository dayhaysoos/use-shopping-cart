import { useStorageReducer } from 'react-storage-hooks';

export const isClient = typeof window === 'object';

export const toCurrency = ({ value, currency, language }) => {
  const formatted = new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(value / 100);
  return formatted;
};

export const calculateTotalValue = (currency, cartItems) => {
  const value = cartItems.reduce((acc, { price }) => acc + price, 0);
  return toCurrency({ value, currency });
};

export function useLocalStorageReducer(key, reducer, initialState) {
  const dummyStorage = {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {},
  };
  return useStorageReducer(
    isClient ? window.localStorage : dummyStorage,
    key,
    reducer,
    initialState
  );
}

export const validateCartItems = (inventorySrc, cartItems) => {
  const validatedItems = Object.keys(cartItems).map((item) => {
    const product = cartItems[item];
    const validatedItem = inventorySrc.find(
      (p) => p.name === cartItems[item].name
    );
    return {
      ...validatedItem,
      name: validatedItem.name,
      amount: validatedItem.price * product.quantity,
      currency: validatedItem.currency,
      quantity: product.quantity,
    };
  });

  return validatedItems;
};
