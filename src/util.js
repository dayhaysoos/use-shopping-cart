export const toCurrency = ({ price, currency, language }) => {
  const formatted = new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(price / 100);

  return formatted;
};

export const calculateTotalPrice = (currency, cartItems) => {
  const price = cartItems.reduce((acc, { price }) => acc + price, 0);
  return toCurrency({ price, currency });
};
