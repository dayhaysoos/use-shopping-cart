const validateCartItems = (inventorySrc, cartDetails) => {
  const validatedItems = []
  for (const sku in cartDetails) {
    if (!Object.prototype.hasOwnProperty.call(cartDetails, sku)) continue

    const product = cartDetails[sku]
    const validatedItem = inventorySrc.find(
      (currentProduct) => currentProduct.name === product.name
    )
    validatedItems.push({
      name: validatedItem.name,
      amount: validatedItem.price,
      currency: validatedItem.currency,
      quantity: product.quantity
    })
  }

  return validatedItems
}

module.exports = {
  validateCartItems
}
