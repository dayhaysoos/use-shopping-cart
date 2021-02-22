import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, updateQuantity, removeEntry } from '../Entry'

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

export const cartValuesInitialState = {}

export const cartSlice = createSlice({
  name: 'cart',
  initialState: cartInitialState,
  reducers: {
    addItem: (state, { payload }) => {
      const { count = 1, price_metadata, product_metadata } = payload
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
        product: payload,
        count,
        price_metadata,
        product_metadata,
        currency: state.currency,
        language: state.language
      })
    },
    incrementItem: (state, { payload }) => {
      const { id, count = 1 } = payload
      return updateEntry({ ...state, state, id, count })
    }
  }
})

export const { addItem, incrementItem } = cartSlice.actions

export const selectState = (state) => state

export default cartSlice.reducer
