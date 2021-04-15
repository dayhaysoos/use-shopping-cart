import * as React from 'react'
import { actions, initialState } from '../core/slice'
import {
  createShoppingCartStore,
  formatCurrencyString,
  filterCart
} from '../core/store'
import { bindActionCreators } from '@reduxjs/toolkit'
import { createDispatchHook, createSelectorHook, Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

export { actions, filterCart, formatCurrencyString }
export const CartContext = React.createContext(initialState)
export const useSelector = createSelectorHook(CartContext)
export const useDispatch = createDispatchHook(CartContext)

export function CartProvider({ loading = null, children, ...props }) {
  const store = React.useMemo(() => createShoppingCartStore(props), [props])
  const persistor = persistStore(store)

  return (
    <Provider context={CartContext} store={store}>
      <PersistGate
        persistor={persistor}
        children={(bootstrapped) => {
          if (!bootstrapped) return loading
          return children
        }}
      />
    </Provider>
  )
}

export function useShoppingCart(
  selector = (state) => ({ ...state }),
  equalityFn
) {
  const dispatch = useDispatch()
  const cartState = useSelector(selector, equalityFn)

  const shoppingCart = React.useMemo(() => {
    const cartActions = bindActionCreators(actions, dispatch)
    return { ...cartState, ...cartActions }
  }, [cartState, dispatch])

  React.useDebugValue(shoppingCart)
  return shoppingCart
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
