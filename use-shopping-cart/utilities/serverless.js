function validateCartItems(inventorySrc, cartDetails) {
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
          name: inventoryItem.name,
          ...inventoryItem.product_data
        },
        ...inventoryItem.price_data
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

function formatLineItems(cartDetails) {
  const lineItems = []

  for (const itemId in cartDetails) {
    const item = cartDetails[itemId]

    if (cartDetails[itemId].id)
      lineItems.push({ price: itemId, quantity: cartDetails[itemId].quantity })
  }

  return lineItems
}

module.exports = {
  validateCartItems,
  formatLineItems
}
