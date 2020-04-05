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
