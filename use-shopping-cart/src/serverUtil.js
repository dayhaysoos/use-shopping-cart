const validateCartItems = (inventorySrc, cartItems) => {
  const validatedItems = []
  for (const product in cartItems) {
    if (!Object.prototype.hasOwnProperty.call(cartItems, product)) continue

    const validatedItem = inventorySrc.find(
      (currentProduct) => currentProduct.name === product.name
    )
    validatedItems.push({
      name: validatedItem.name,
      amount: validatedItem.price * product.quantity,
      currency: validatedItem.currency,
      quantity: product.quantity
    })
  }

  return validatedItems
}

module.exports = {
  validateCartItems
}
