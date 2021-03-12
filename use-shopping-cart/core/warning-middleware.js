function checkCountType(count, action) {
  if (typeof count !== 'number') {
    console.warn(`${action.type} requires that count be a number`, action)
  }
}

export const handleWarnings = (store) => (next) => async (action) => {
  const count = action.payload?.options?.count
  const quantity = action.payload?.quantity
  if (count) {
    checkCountType(count, action)
  } else if (quantity) {
    checkCountType(quantity, action)
  }
  try {
    return next(action)
  } catch (error) {
    console.error('Error:', error)
  }
}
