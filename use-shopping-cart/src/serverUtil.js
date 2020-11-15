const validateCartItems = (inventorySrc, cartDetails) => {
  const validatedItems = []
  for (const sku in cartDetails) {
    const product = cartDetails[sku]
    const inventoryItem = inventorySrc.find(
      (currentProduct) => currentProduct.sku === sku
    )
    if (!inventoryItem) throw new Error(`Product not found!`)
    const item = {
      price_data: {
        currency: inventoryItem.currency,
        unit_amount: inventoryItem.price,
        product_data: {
          name: inventoryItem.name
        }
      },
      quantity: product.quantity
    }
    if (inventoryItem.description)
      item.price_data.product_data.description = inventoryItem.description
    if (inventoryItem.image)
      item.price_data.product_data.images = [inventoryItem.image]
    validatedItems.push(item)
  }

  return validatedItems
}

module.exports = {
  validateCartItems
}
