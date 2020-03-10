export const toCurrency = ({ price, currency }) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price / 100);

  return formatted;
};
