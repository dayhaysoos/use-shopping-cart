const validateCartItems = (inventorySrc, cartItems) => {
  const validatedItems = [];
  for (const item in cartItems) {
    const product = cartItems[item];
    const validatedItem = inventorySrc.find(
      (p) => p.name === cartItems[item].name
    );
    validatedItems.push({
      name: validatedItem.name,
      amount: validatedItem.price * product.quantity,
      currency: validatedItem.currency,
      quantity: product.quantity,
    });
  }

  return validatedItems;
};

module.exports = {
  validateCartItems,
};
