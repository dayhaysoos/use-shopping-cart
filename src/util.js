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
