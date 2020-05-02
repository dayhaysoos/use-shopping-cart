const validateCartItems = (inventorySrc, cartDetails) => {
  const validatedItems = []
  for (const sku in cartDetails) {
    const product = cartDetails[sku]
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
