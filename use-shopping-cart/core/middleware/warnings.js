import { typeOf } from './helpers'

export const handleWarnings = (store) => (next) => async (action) => {
  const count = ['cart/addItem', 'cart/incrementItem', 'cart/decrementItem']
  if (
    count.includes(action.type) &&
    typeof action.payload.options.count !== 'number'
  ) {
    console.warn(
      `Invalid count used with action ${
        action.type
      }: count must be a number. The current type is ${typeOf(
        action.payload.options.count
      )}.`,
      action
    )
    return
  }

  const quantity = ['cart/setItemQuantity']
  if (quantity.includes(action.type)) {
    if (typeof action.payload.quantity !== 'number') {
      console.warn(
        `Invalid quantity used with action ${
          action.type
        }: quantity must be a number. The current type is ${typeOf(
          action.payload.quantity
        )}.`,
        action
      )
      return
    } else if (action.payload.quantity < 0) {
      console.warn(
        `Invalid quantity used with action ${
          action.type
        }: quantity must be greater than zero. The current value is ${JSON.stringify(
          action.payload.quantity
        )}.`,
        action
      )
      return
    }
  }

  const id = ['cart/incrementItem', 'cart/decrementItem', 'cart/removeItem']
  if (
    id.includes(action.type) &&
    !(action.payload.id in store.getState().cartDetails)
  ) {
    console.warn(
      `Invalid product ID used with action ${
        action.type
      }: the ID must already be in the cart. The current value is ${JSON.stringify(
        action.payload.id
      )}.`,
      action
    )
    return
  }

  return next(action)
}
