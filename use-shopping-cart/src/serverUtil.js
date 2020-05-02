const validateCartItems = (inventorySrc, cartDetails) => {
  const validatedItems = []
  for (const sku in cartDetails) {
    if (!Object.prototype.hasOwnProperty.call(cartDetails, sku)) continue

    const product = cartDetails[sku]
    const inventoryItem = inventorySrc.find(
      (currentProduct) => currentProduct.sku === sku
    )
    validatedItems.push({
      name: inventoryItem.name,
      amount: inventoryItem.price,
      currency: inventoryItem.currency,
      quantity: product.quantity
    })
  }

  return validatedItems
}

module.exports = {
  validateCartItems
}
