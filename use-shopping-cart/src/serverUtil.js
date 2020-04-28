const validateCartItems = (inventorySrc, cartItems) => {
  const validatedItems = []
  for (const product of cartItems) {
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
