function validateCartItems(inventorySrc, cartDetails) {
  const validatedItems = []

  // Build a Map for O(1) lookups instead of O(n) find() calls
  const inventoryMap = new Map()
  for (const product of inventorySrc) {
    if (product.id) inventoryMap.set(product.id, product)
    if (product.sku) inventoryMap.set(product.sku, product)
  }

  for (const id in cartDetails) {
    const inventoryItem = inventoryMap.get(id)
    if (inventoryItem === undefined) {
      throw new Error(
        `Invalid Cart: product with id "${id}" is not in your inventory.`
      )
    }

    // Validate quantity is a positive integer
    const quantity = cartDetails[id].quantity
    if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Invalid Cart: product "${id}" has invalid quantity "${quantity}". Quantity must be a positive integer.`
      )
    }

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
      quantity: cartDetails[id].quantity
    }

    if (
      cartDetails[id].product_data &&
      typeof cartDetails[id].product_data.metadata === 'object'
    ) {
      item.price_data.product_data.metadata = {
        ...item.price_data.product_data.metadata,
        ...cartDetails[id].product_data.metadata
      }
    }

    if (
      typeof inventoryItem.description === 'string' &&
      inventoryItem.description.length > 0
    )
      item.price_data.product_data.description = inventoryItem.description

    if (
      typeof inventoryItem.image === 'string' &&
      inventoryItem.image.length > 0
    )
      item.price_data.product_data.images = [inventoryItem.image]

    validatedItems.push(item)
  }

  return validatedItems
}

function formatLineItems(cartDetails) {
  const lineItems = []
  for (const id in cartDetails)
    lineItems.push({ price: id, quantity: cartDetails[id].quantity })

  return lineItems
}

module.exports = {
  validateCartItems,
  formatLineItems
}
