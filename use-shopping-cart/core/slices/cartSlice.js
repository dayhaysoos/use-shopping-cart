import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, removeEntry, updateQuantity } from '../Entry'
import { checkoutHandler } from '../../src/util'

export const cartInitialState = {
  lastClicked: '',
  shouldDisplayCart: false,
  stripe: null,
  mode: '',
  lastClicked: '',
  shouldDisplayCart: false,
  cartDetails: {},
  totalPrice: 0,
  cartCount: 0,
  currency: 'USD',
  language: 'en-US'
}

export function createCartSlice(initialState) {
  initialState = {
    lastClicked: '',
    shouldDisplayCart: false,
    stripe: null,
    mode: '',
    lastClicked: '',
    shouldDisplayCart: false,
    cartDetails: {},
    totalPrice: 0,
    cartCount: 0,
    currency: 'USD',
    language: 'en-US',
    ...initialState
  }

  return createSlice({
    name: 'cart',
    initialState,
    reducers: {
      addItem: {
        reducer: (state, { payload }) => {
          const {
            product,
            options: { count, price_metadata, product_metadata }
          } = payload

          if (count <= 0) return

          if (payload?.id in state.cartDetails) {
            return updateEntry({
              id: payload.id,
              count,
              price_metadata,
              product_metadata,
              currency: state.currency,
              language: state.language
            })
          }

          return createEntry({
            ...state,
            state,
            product,
            count,
            price_metadata,
            product_metadata,
            currency: state.currency,
            language: state.language
          })
        },
        prepare: (product, options = { count: 1 }) => {
          if (!options.price_metadata) {
            options.price_metadata = {}
          }
          if (!options.product_metadata) {
            options.product_metadata = {}
          }
          return { payload: { product, options } }
        }
      },
      incrementItem: {
        reducer: (state, { payload }) => {
          const {
            id,
            options: { count }
          } = payload

          return updateQuantity({ state, id, quantity: count })
        },
        prepare: (id, options = { count: 1 }) => {
          return { payload: { id, options } }
        }
      },
      decrementItem: {
        reducer: (state, { payload }) => {
          const {
            id,
            options: { count }
          } = payload

          return updateQuantity({ state, id, quantity: -count })
        },
        prepare: (id, options = { count: 1 }) => {
          return { payload: { id, options } }
        }
      },
      clearCart: {
        reducer: (state) => {
          return {
            ...state,
            ...initialState
          }
        }
      },
      setItemQuantity: {
        reducer: (state, { payload }) => {
          const { id, quantity } = payload
          if (quantity < 0) return

          if (id in state.cartDetails)
            return updateQuantity({ ...state, state, id, quantity })
        },
        prepare: (id, quantity = 1) => {
          return { payload: { id, quantity } }
        }
      },
      removeItem: {
        reducer: (state, { payload }) => {
          return removeEntry({ state, id: payload })
        }
      },
      loadCart: {
        reducer: (state, { payload }) => {
          const { cartDetails, shouldMerge } = payload
          if (!shouldMerge) state = { ...initialState }

          for (const id in cartDetails) {
            const entry = cartDetails[id]
            state = createEntry({
              ...state,
              state,
              product: entry,
              count: entry.quantity
            })
          }
          return state
        },
        prepare: (cartDetails, shouldMerge = true) => {
          return { payload: { cartDetails, shouldMerge } }
        }
      },
      redirectToCheckout: {
        reducer: (state) =>
          checkoutHandler(state, {
            modes: ['client-only', 'checkout-session'],
            stripe() {
              return state.stripe.redirectToCheckout(options)
            }
          })
      },
      checkoutSingleItem: {
        reducer: (state) =>
          checkoutHandler(state, {
            modes: ['client-only'],
            stripe() {
              return state.stripe.redirectToCheckout(options)
            }
          })
      },
      handleCartClick: (state) => {
        !state.shouldDisplayCart
      },
      handleCloseCart: (state) => {
        state.shouldDisplayCart = false
      }
    }
  })
}

export const cartSlice = createCartSlice(cartInitialState)

export const {
  addItem,
  incrementItem,
  decrementItem,
  setItemQuantity,
  removeItem,
  clearCart,
  handleCartClick,
  redirectToCheckout,
  checkoutSingleItem
} = cartSlice.actions

export const selectState = (state) => state

export const { reducer } = cartSlice
