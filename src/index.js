import React, { createContext, useReducer, useContext, useMemo } from 'react';
import {
  toCurrency,
  calculateTotalValue,
  useLocalStorageReducer,
} from './util';

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
    const price = current.price;
    const value = (acc[current.sku]?.value ?? 0) + current.price;
    const formattedValue = toCurrency({ value, currency, language });

    return {
      ...acc,
      [current.sku]: {
        ...current,
        quantity,
        price,
        formattedValue,
        value,
      },
    };
  }, {});
};

const removeItem = (skuID, cartItems) => {
  const newCartItems = cartItems.filter((item) => item.sku !== skuID);
  return newCartItems;
};

const reduceItemByOne = (skuID, cartItems) => {
  const newCartItems = cartItems;
  const indexToRemove = newCartItems.map((item) => item.sku).indexOf(skuID);
  newCartItems.splice(indexToRemove, 1);
  return newCartItems;
};

function cartReducer(cart, action) {
  const { skus, cartItems } = cart;

  switch (action.type) {
    case 'addToCart':
      return {
        ...cart,
        skus: checkoutCart(skus, action.sku),
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
    default:
      return cart;
  }
}

function cartItemsReducer(cartItems, action) {
  switch (action.type) {
    case 'delete':
      const index = cartItems.findIndex((item) => item.sku === action.skuID);

      if (index === -1) {
        return cartItems;
      }

      return cartItems.slice(0, index).concat(cartItems.slice(index + 1));
    case 'addToCart':
      return [...cartItems, action.sku];
    case 'removeFromCart':
      return removeItem(action.sku, cartItems);
    case 'reduceItemByOne':
      return reduceItemByOne(action.sku, cartItems);
    default:
      return cartItems;
  }
}

export const CartContext = createContext();

/**
 * @param {{
    children: JSX.Element,
    stripe: any,
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

export const useStripeCart = () => {
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

  const addItem = (sku) => {
    dispatch({ type: 'addToCart', sku });
  };

  const removeCartItem = (sku) => {
    dispatch({ type: 'removeFromCart', sku });
  };

  const reduceItemByOne = (sku) => {
    dispatch({ type: 'reduceItemByOne', sku });
  };

  const deleteItem = (skuID) => dispatch({ type: 'delete', skuID });

  const storeLastClicked = (skuID) =>
    dispatch({ type: 'storeLastClicked', skuID });

  const handleCartClick = () => dispatch({ type: 'cartClick' });

  const handleCartHover = () => dispatch({ type: 'cartHover' });

  const handleCloseCart = () => dispatch({ type: 'closeCart' });

  const redirectToCheckout = async () => {
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

    const { error } = await stripe.redirectToCheckout(options);
    if (error) {
      return error;
    }
  };

  return {
    addItem,
    deleteItem,
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
  };
};
