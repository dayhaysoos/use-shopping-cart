const validateCartItems = (inventorySrc, cartDetails) => {
  const validatedItems = []

  for (const itemId in cartDetails) {
    const product = cartDetails[itemId]
    const inventoryItem = inventorySrc.find(
      (currentProduct) =>
        currentProduct.sku === sku || currentProduct.id === sku
    )

    if (!inventoryItem) throw new Error(`Product ${sku} not found!`)

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
