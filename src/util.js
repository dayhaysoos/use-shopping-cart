export const toCurrency = ({ price, currency }) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price / 100);

  return formatted;
};

export const calculateTotalPrice = (currency, cartItems) => {
  const price = cartItems.reduce((acc, cartItem) => {
    currency = cartItem.currency;
    return acc + cartItem.price;
  }, 0);

  return toCurrency({ price, currency });
}
