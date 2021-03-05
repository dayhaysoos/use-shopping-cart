import * as React from 'react'
import { actions, cartInitialState } from '../core/slice'
import { createShoppingCartStore } from '../core/store'
import { createDispatchHook, createSelectorHook, Provider } from 'react-redux'
import { bindActionCreators } from '@reduxjs/toolkit'
import { checkoutHandler, filterCart } from '../utilities/old-utils'
//TODO figure out how to apply formatCurrencyString
import { formatCurrencyString } from '../core/store'

export { actions, filterCart, formatCurrencyString }
export const CartContext = React.createContext(cartInitialState)
export const useSelector = createSelectorHook(CartContext)
export const useDispatch = createDispatchHook(CartContext)

export function CartProvider({ children, ...props }) {
  const store = React.useMemo(() => createShoppingCartStore(props), [props])

  return (
    <Provider context={CartContext} store={store}>
      {children}
    </Provider>
  )
}

export function useShoppingCart(
  selector = (state) => ({ ...state }),
  equalityFn
) {
  const dispatch = useDispatch()
  const cartState = useSelector(selector, equalityFn)

  const cartActions = bindActionCreators(actions, dispatch)

  const newState = { ...cartState, ...cartActions }

  React.useDebugValue(newState)
  return newState
}

export function DebugCart(props) {
  const cart = useShoppingCart((state) => state)
  const cartPropertyRows = Object.entries(cart)
    .filter(([, value]) => typeof value !== 'function')
    .map(([key, value]) => (
      <tr key={key}>
        <td>{key}</td>
        <td>
          {typeof value === 'object' ? (
            <button onClick={() => console.log(value)}>Log value</button>
          ) : (
            JSON.stringify(value)
          )}
        </td>
      </tr>
    ))

  return (
    <table
      style={{
        position: 'fixed',
        top: 50,
        right: 50,
        backgroundColor: '#eee',
        textAlign: 'left',
        maxWidth: 500,
        padding: 20,
        borderSpacing: '25px 5px'
      }}
      {...props}
    >
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>{cartPropertyRows}</tbody>
    </table>
  )
}
