import React, { createContext, useReducer, useContext } from 'react';
import { toCurrency, calculateTotalPrice } from './util';

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

const formatDetailedCart = (currency, cartItems) => {
  return cartItems.reduce((acc, current) => {
    const quantity = (acc[current.sku]?.quantity ?? 0) + 1;
    const price = (acc[current.sku]?.price ?? 0) + current.price;
    const formattedPrice = toCurrency({ price, currency });

    return {
      ...acc,
      [current.sku]: {
        ...current,
        quantity,
        price,
        formattedPrice,
      },
    };
  }, {});
};

const formatCheckoutCart = checkoutData => {
  return Object.keys(checkoutData).map(item => ({
    sku: item,
    quantity: checkoutData[item],
  }));
};

const updateQuantity = (quantity, skuID, skus) => {
  quantity = isNaN(quantity) ? 0 : quantity;

  const updatedSkus = skus;
  quantity === 0 ? delete updatedSkus[skuID] : (updatedSkus[skuID] = quantity);

  return updatedSkus;
};

const removeItem = (skuID, cartItems) => {
  const index = cartItems.findIndex(item => item.sku);
  return cartItems;
};

const removeSku = (skuID, skus) => {
  delete skus[skuID];

  return skus;
};

const reducer = (cart, action) => {
  const { skus, cartItems } = cart;

  switch (action.type) {
    case 'addToCheckoutCart':
      typeof localStorage !== 'undefined' &&
        localStorage.setItem(
          'skus',
          JSON.stringify(checkoutCart(skus, action.sku))
        );
      return {
        ...cart,
        skus: checkoutCart(skus, action.sku),
      };
    case 'handleQuantityChange':
      typeof localStorage !== 'undefined' &&
        localStorage.setItem(
          'skus',
          JSON.stringify(updateQuantity(action.quantity, action.skuID, skus))
        );
      return {
        ...cart,
        skus: updateQuantity(action.quantity, action.skuID, skus),
      };
    case 'delete':
      typeof localStorage !== 'undefined' &&
        localStorage.setItem(
          'skus',
          JSON.stringify(removeSku(action.skuID, skus))
        );

      const index = cartItems.findIndex(item => item.sku === action.skuID);

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
    default:
      console.error(`unknown action ${action.type}`);
      return cart;
  }
};

export const CartContext = createContext();

export const CartProvider = ({
  children,
  stripe,
  billingAddressCollection,
  successUrl,
  cancelUrl,
  currency,
}) => {
  const skuStorage =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('skus'))
      : {};
  return (
    <CartContext.Provider
      value={useReducer(reducer, {
        lastClicked: '',
        skus: skuStorage || {},
        shouldDisplayCart: false,
        cartItems: [],
        stripe,
        billingAddressCollection,
        successUrl,
        cancelUrl,
        currency,
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
    billingAddressCollection,
    successUrl,
    cancelUrl,
    currency,
  } = cart;

  let storageReference =
    typeof localStorage === 'object' &&
    JSON.parse(localStorage.getItem('skus'));

  if (storageReference === null) {
    storageReference = {};
  }

  const checkoutData = formatCheckoutCart(skus);
  
  const totalPrice = () => calculateTotalPrice(currency, cartItems);

  typeof localStorage === 'object' &&
    localStorage.setItem('skus', JSON.stringify(storageReference));

  const cartDetails = formatDetailedCart(currency, cartItems);

  const cartCount = checkoutData.reduce(
    (acc, current) => acc + current.quantity,
    0
  );

  const addItem = sku => {
    dispatch({ type: 'addToCheckoutCart', sku });
    dispatch({ type: 'addToCartItems', sku });
  };

  const removeCartItem = sku => {
    dispatch({ type: 'removeFromCartItems', sku });
  };
  const handleQuantityChange = (quantity, skuID) => {
    dispatch({ type: 'handleQuantityChange', quantity, skuID });
  };

  const deleteItem = skuID => dispatch({ type: 'delete', skuID });

  const storeLastClicked = skuID =>
    dispatch({ type: 'storeLastClicked', skuID });

  const handleCartClick = () => dispatch({ type: 'cartClick' });

  const handleCartHover = () => dispatch({ type: 'cartHover' });

  const handleCloseCart = () => dispatch({ type: 'closeCart' });

  const redirectToCheckout = async (submitType = 'auto') => {
    const { error } = await stripe.redirectToCheckout({
      items: checkoutData,
      successUrl: `http://localhost:8000/thank-you`,
      cancelUrl: `http://localhost:8000/`,
    });
    if (error) {
      console.warn('Error:', error);
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
  };
};
