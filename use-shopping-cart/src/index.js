import React, {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect,
} from 'react';
import {
  toCurrency,
  calculateTotalValue,
  useLocalStorageReducer,
} from './util';

export { toCurrency };

/**
 * @function checkoutCart
 * @param skus {Object}
 * @param sku {String}
 * @quantity {Number}
 * @description Adds skuID to skus object, if no quantity argument is passed, it increments by 1
 * @returns {Object} skus
 */
const checkoutCart = (skus, { sku }, quantity = 1) => {
  if (skus.hasOwnProperty(sku)) {
    return {
      ...skus,
      [sku]: skus[sku] + quantity,
    };
  } else {
    return {
      ...skus,
      [sku]: quantity,
    };
  }
};

const formatDetailedCart = (currency, cartItems, language) => {
  return cartItems.reduce((acc, current) => {
    const quantity = (acc[current.sku]?.quantity ?? 0) + 1;
    const value = (acc[current.sku]?.value ?? 0) + current.price;
    const formattedValue = toCurrency({ value, currency, language });

    return {
      ...acc,
      [current.sku]: {
        ...current,
        quantity,
        formattedValue,
        value,
      },
    };
  }, {});
};

const reduceItemByOne = (skuID, cartItems) => {
  const newCartItems = [];
  let removedItem = false;

  for (const item of cartItems) {
    if (!removedItem && item.sku === skuID) {
      removedItem = true;
      continue;
    }

    newCartItems.push(item);
  }

  return newCartItems;
};

function cartReducer(cart, action) {
  switch (action.type) {
    case 'addToCart':
      return {
        ...cart,
        skus: checkoutCart(cart.skus, action.product.sku),
      };

    case 'storeLastClicked':
      return {
        ...cart,
        lastClicked: action.skuID,
      };

    case 'cartClick':
      return {
        ...cart,
        shouldDisplayCart: !cart.shouldDisplayCart,
      };

    case 'cartHover':
      return {
        ...cart,
        shouldDisplayCart: true,
      };

    case 'closeCart':
      return {
        ...cart,
        shouldDisplayCart: false,
      };

    case 'stripe changed':
      return {
        ...cart,
        stripe: action.stripe,
      };

    default:
      return cart;
  }
}

function cartItemsReducer(cartItems, action) {
  switch (action.type) {
    case 'addToCart':
      return [...cartItems, action.product];
    case 'removeCartItem':
      return cartItems.filter((item) => item.sku !== action.sku);
    case 'reduceItemByOne':
      return reduceItemByOne(action.sku, cartItems);
    case 'clearCart':
      return [];
    default:
      return cartItems;
  }
}

export const CartContext = createContext([
  {
    lastClicked: '',
    shouldDisplayCart: false,
    skus: {},
    cartItems: [],
  },
  () => {},
]);

/**
 * @param {{
    children: JSX.Element,
    stripe: stripe.Stripe,
    successUrl: string,
    cancelUrl: string,
    currency: string,
    language: string,
    billingAddressCollection: boolean,
    allowedCountries: null | string[]
 * }} props
 */
export const CartProvider = ({
  children,
  stripe,
  successUrl,
  cancelUrl,
  currency,
  language = navigator.language,
  billingAddressCollection = false,
  allowedCountries = null,
}) => {
  const [cart, cartDispatch] = useReducer(cartReducer, {
    lastClicked: '',
    shouldDisplayCart: false,
    stripe,
    successUrl,
    cancelUrl,
    currency,
    billingAddressCollection,
    allowedCountries,
    skus: {},
  });

  useEffect(() => {
    cartDispatch({ type: 'stripe changed', stripe });
  }, [stripe]);

  // keep cartItems in LocalStorage
  const [cartItems, cartItemsDispatch] = useLocalStorageReducer(
    'cart-items',
    cartItemsReducer,
    []
  );

  // combine dispatches and
  // memoize context value to avoid causing re-renders
  const contextValue = useMemo(
    () => [
      { ...cart, cartItems },
      (action) => {
        cartDispatch(action);
        cartItemsDispatch(action);
      },
    ],
    [cart, cartItems, cartDispatch, cartItemsDispatch]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const [cart, dispatch] = useContext(CartContext);

  const {
    stripe,
    lastClicked,
    shouldDisplayCart,
    cartItems,
    successUrl,
    cancelUrl,
    currency,
    language,
    billingAddressCollection,
    allowedCountries,
  } = cart;

  const totalPrice = () => calculateTotalValue(currency, cartItems);

  const cartDetails = formatDetailedCart(currency, cartItems, language);

  const checkoutData = Object.keys(cartDetails).map((item) => {
    return {
      sku: cartDetails[item].sku,
      quantity: cartDetails[item].quantity,
    };
  });

  const cartCount = cartItems.length;

  const addItem = (product) => {
    dispatch({ type: 'addToCart', product });
  };

  const removeCartItem = (sku) => {
    dispatch({ type: 'removeCartItem', sku });
  };

  const reduceItemByOne = (sku) => {
    dispatch({ type: 'reduceItemByOne', sku });
  };

  const storeLastClicked = (skuID) =>
    dispatch({ type: 'storeLastClicked', skuID });

  const handleCartClick = () => dispatch({ type: 'cartClick' });

  const handleCartHover = () => dispatch({ type: 'cartHover' });

  const handleCloseCart = () => dispatch({ type: 'closeCart' });

  const clearCart = () => dispatch({ type: 'clearCart' });

  const redirectToCheckout = async (sessionId) => {
    const options = {
      items: checkoutData,
      successUrl,
      cancelUrl,
      billingAddressCollection: billingAddressCollection ? 'required' : 'auto',
      submitType: 'auto',
    };

    if (Array.isArray(allowedCountries) && allowedCountries.length) {
      options.shippingAddressCollection = {
        allowedCountries,
      };
    }

    if (stripe === null) {
      throw new Error('Stripe is not defined');
    }

    const resolvedStripe = await Promise.resolve(stripe);

    const { error } = await resolvedStripe.redirectToCheckout(
      sessionId ? sessionId : options
    );
    if (error) {
      return error;
    }
  };

  return {
    addItem,
    cartCount,
    checkoutData,
    redirectToCheckout,
    lastClicked,
    storeLastClicked,
    shouldDisplayCart,
    handleCartClick,
    cartItems,
    cartDetails,
    handleCartHover,
    handleCloseCart,
    totalPrice,
    removeCartItem,
    reduceItemByOne,
    clearCart,
  };
};
