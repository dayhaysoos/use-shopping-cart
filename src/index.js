import React, { createContext, useReducer, useContext } from 'react';
import { toCurrency, calculateTotalValue } from './util';

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

const updateQuantity = (quantity, skuID, skus) => {
  quantity = isNaN(quantity) ? 0 : quantity;

  const updatedSkus = skus;
  quantity === 0 ? delete updatedSkus[skuID] : (updatedSkus[skuID] = quantity);

  return updatedSkus;
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

const removeSku = (skuID, skus) => {
  delete skus[skuID];

  return skus;
};

const reducer = (cart, action) => {
  const { skus, cartItems } = cart;

  switch (action.type) {
    case 'addToCheckoutCart':
      return {
        ...cart,
        skus: checkoutCart(skus, action.sku),
      };
    case 'handleQuantityChange':
      return {
        ...cart,
        skus: updateQuantity(action.quantity, action.skuID, skus),
      };
    case 'delete':
      const index = cartItems.findIndex((item) => item.sku === action.skuID);

      if (index !== -1) {
        cartItems.splice(index, 1);
      }
      return {
        ...cart,
        skus: removeSku(action.skuID, skus),
        cartItems,
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
    case 'addToCartItems':
      return {
        ...cart,
        cartItems: [...cart.cartItems, action.sku],
      };
    case 'removeFromCartItems':
      return {
        ...cart,
        cartItems: removeItem(action.sku, cart.cartItems),
      };
    case 'reduceItemByOne':
      return {
        ...cart,
        cartItems: reduceItemByOne(action.sku, cart.cartItems),
      };
    default:
      console.error(`unknown action ${action.type}`);
      return cart;
  }
};

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
 * }}
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
  return (
    <CartContext.Provider
      value={useReducer(reducer, {
        lastClicked: '',
        shouldDisplayCart: false,
        cartItems: [],
        stripe,
        successUrl,
        cancelUrl,
        currency,
        billingAddressCollection,
        allowedCountries,
        skus: {},
      })}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useStripeCart = () => {
  const [cart, dispatch] = useContext(CartContext);

  const {
    skus,
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
    dispatch({ type: 'addToCheckoutCart', sku });
    dispatch({ type: 'addToCartItems', sku });
  };

  const removeCartItem = (sku) => {
    dispatch({ type: 'removeFromCartItems', sku });
  };

  const reduceItemByOne = (sku) => {
    dispatch({ type: 'reduceItemByOne', sku });
  };

  const handleQuantityChange = (quantity, skuID) => {
    dispatch({ type: 'handleQuantityChange', quantity, skuID });
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
    skus,
    addItem,
    deleteItem,
    cartCount,
    checkoutData,
    redirectToCheckout,
    handleQuantityChange,
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
