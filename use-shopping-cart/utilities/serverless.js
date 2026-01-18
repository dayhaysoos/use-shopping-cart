function validateCartItems(inventorySrc, cartDetails) {
  const validatedItems = []

  if (!inventorySrc || typeof inventorySrc[Symbol.iterator] !== 'function') {
    throw new Error('Invalid Cart: inventory must be an iterable collection.')
  }

  if (!cartDetails || typeof cartDetails !== 'object') {
    throw new Error('Invalid Cart: cartDetails must be an object.')
  }

  // Build a Map for O(1) lookups instead of O(n) find() calls
  // Only set a key if it doesn't exist to preserve "first match wins" semantics
  // from the original find() implementation
  const inventoryMap = new Map()
  for (const product of inventorySrc) {
    if (!product || typeof product !== 'object') {
      throw new Error('Invalid Cart: inventory items must be objects.')
    }

    if (product.id && !inventoryMap.has(product.id)) {
      inventoryMap.set(product.id, product)
    }
    if (product.sku && !inventoryMap.has(product.sku)) {
      inventoryMap.set(product.sku, product)
    }
  }

  for (const id in cartDetails) {
    const cartItem = cartDetails[id]
    if (!cartItem || typeof cartItem !== 'object') {
      throw new Error(`Invalid Cart: cart item "${id}" must be an object.`)
    }

    const inventoryItem = inventoryMap.get(id)
    if (inventoryItem === undefined) {
      throw new Error(
        `Invalid Cart: product with id "${id}" is not in your inventory.`
      )
    }

    // Validate quantity is a positive integer
    const quantity = cartItem.quantity
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
      quantity
    }

    if (
      cartItem.product_data &&
      typeof cartItem.product_data.metadata === 'object'
    ) {
      item.price_data.product_data.metadata = {
        ...item.price_data.product_data.metadata,
        ...cartItem.product_data.metadata
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
