function isValidCount(count, action) {
  if (typeof count !== 'number') {
    console.warn(
      `Invalid count passed to action ${
        action.type
      }: count must be type number. The current type is ${typeof count}`
    )
    return false // Invalid count
  }
  if (count <= 0) {
    console.warn(
      `Invalid count passed to action ${action.type}: Cannot be less than or equal to 0`
    )
    return false // Invalid count
  }
  // Valid count
  return true
}

export const handleWarnings = (store) => (next) => async (action) => {
  switch (action.type) {
    // These have `count`
    case 'cart/addItem':
    case 'cart/incrementItem':
    case 'cart/decrementItem':
      if (!isValidCount(action.payload?.options?.count, action)) return
      break
    // This one has `quantity`
    case 'cart/setItemQuantity':
      if (!isValidCount(action.payload?.quantity, action)) return
      break
    default:
      break
  }

  return next(action)
}
