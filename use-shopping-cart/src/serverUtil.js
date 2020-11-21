const validateCartItems = (inventorySrc, cartDetails) => {
  const validatedItems = []

  for (const itemId in cartDetails) {
    const product = cartDetails[itemId]
    const inventoryItem = inventorySrc.find(
      (currentProduct) =>
        currentProduct.sku === itemId || currentProduct.id === itemId
    )

    if (!inventoryItem) throw new Error(`Product ${itemId} not found!`)

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
    if (inventoryItem.price_data) item.price_data = { ...price_data }
    if (inventoryItem.product_data)
      item.price_data.product_data = { ...product_data }
    if (inventoryItem.description)
      item.price_data.product_data.description = inventoryItem.description
    if (inventoryItem.image)
      item.price_data.product_data.images = [inventoryItem.image]
    validatedItems.push(item)
  }

  return validatedItems
}

const formatLineItems = (cartDetails) => {
  const lineItems = []

  for (const itemId in cartDetails) {
    if (cartDetails[itemId].sku_id || cartDetails[itemId].price_id)
      lineItems.push({ price: itemId, quantity: cartDetails[itemId].quantity })
  }

  return lineItems
}

module.exports = {
  validateCartItems,
  formatLineItems
}
