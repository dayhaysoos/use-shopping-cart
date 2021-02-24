import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, removeEntry } from '../Entry'

export const cartInitialState = {
  lastClicked: '',
  shouldDisplayCart: false,
  stripe: null,
  lastClicked: '',
  shouldDisplayCart: false,
  cartDetails: {},
  totalPrice: 0,
  cartCount: 0,
  currency: 'USD',
  language: 'en-US'
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState: cartInitialState,
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

        return updateEntry({ ...state, state, id, count })
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

        return updateEntry({ ...state, state, id, count: -count })
      },
      prepare: (id, options = { count: 1 }) => {
        return { payload: { id, options } }
      }
    },
    clearCart: {
      reducer: (state) => {
        return {
          ...state,
          cartDetails: {}
        }
      }
    },
    setItemQuantity: {
      reducer: (state, { payload }) => {
        const { id, quantity } = payload
        if (count < 0) return

        if (id in state.cartDetails)
          return updateQuantity({ ...state, state, id, quantity })
      },
      prepare: (id, quantity = 1) => {
        return { payload: { id, quantity } }
      }
    },
    removeItem: {
      reducer: (state, { payload }) => {
        if (id in state.cartDetails)
          return {
            ...state,
            cartDetails: removeEntry({ state, payload })
          }
      }
    },
    updateQuantity: {
      reducer: (state, { payload }) => {
        const { id, quantity } = payload
        return updateEntry({
          ...state,
          state,
          id,
          count: quantity - state.cartDetails[id].quantity
        })
      },
      prepare: (id, quantity) => {
        return { payload: { id, quantity } }
      }
    }
  }
})

export const {
  addItem,
  incrementItem,
  decrementItem,
  setItemQuantity,
  updateQuantity
} = cartSlice.actions

export const selectState = (state) => state

export default cartSlice.reducer
