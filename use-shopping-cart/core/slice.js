import { createSlice } from '@reduxjs/toolkit'
import {
  createEntry,
  updateEntry,
  removeEntry,
  updateQuantity,
  updateFormattedTotalPrice
} from './Entry'
import { isClient } from '../utilities/SSR'
import { v4 as uuidv4 } from 'uuid'

export const initialState = {
  cartMode: 'checkout-session',
  mode: 'payment',
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  formattedTotalPrice: '',
  cartDetails: {},
  stripe: ''
}

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: {
      reducer(state, { payload: { product, options } }) {
        const { count, price_metadata, product_metadata } = options

        const id =
          product.id ||
          product.price_id ||
          product.sku_id ||
          product.sku ||
          uuidv4()

        if (id in state.cartDetails) {
          updateEntry({
            state,
            id,
            count,
            price_metadata,
            product_metadata
          })
        } else {
          createEntry({
            state,
            id,
            product,
            count,
            price_metadata,
            product_metadata
          })
        }
      },
      prepare(product, options = { count: 1 }) {
        if (!options.price_metadata) options.price_metadata = {}
        if (!options.product_metadata) options.product_metadata = {}
        if (!options.count) options.count = 1
        return { payload: { product, options } }
      }
    },
    incrementItem: {
      reducer(state, { payload: { id, options } }) {
        updateEntry({
          state,
          id,
          count: options.count
        })
      },
      prepare(id, options = { count: 1 }) {
        return { payload: { id, options } }
      }
    },
    decrementItem: {
      reducer(state, { payload: { id, options } }) {
        if (state.cartDetails[id].quantity - options.count <= 0)
          return removeEntry({ state, id })

        updateEntry({
          state,
          id,
          count: -options.count
        })
      },
      prepare(id, options = { count: 1 }) {
        return { payload: { id, options } }
      }
    },
    clearCart: {
      reducer(state) {
        state.cartCount = 0
        state.totalPrice = 0
        state.cartDetails = {}
        updateFormattedTotalPrice(state)
      }
    },
    setItemQuantity: {
      reducer(state, { payload: { id, quantity } }) {
        if (quantity > 0 && id in state.cartDetails)
          return updateQuantity({ ...state, state, id, quantity })
        else if (quantity === 0) return removeEntry({ state, id })
      },
      prepare(id, quantity) {
        return { payload: { id, quantity } }
      }
    },
    removeItem: {
      reducer(state, { payload: { id } }) {
        removeEntry({ state, id })
      },
      prepare(id) {
        return { payload: { id } }
      }
    },
    loadCart: {
      reducer(state, { payload: { cartDetails, shouldMerge } }) {
        if (!shouldMerge) {
          state.cartCount = 0
          state.totalPrice = 0
          state.cartDetails = {}
        }

        for (const id in cartDetails) {
          const entry = cartDetails[id]
          createEntry({
            state,
            id: entry.id,
            product: entry,
            count: entry.quantity
          })
        }
      },
      prepare(cartDetails, shouldMerge = true) {
        return { payload: { cartDetails, shouldMerge } }
      }
    },
    handleCartHover(state) {
      state.shouldDisplayCart = true
    },
    handleCartClick(state) {
      state.shouldDisplayCart = !state.shouldDisplayCart
    },
    handleCloseCart(state) {
      state.shouldDisplayCart = false
    },
    handleOpenCart(state) {
      state.shouldDisplayCart = true
    },
    storeLastClicked(state, { payload }) {
      state.lastClicked = payload
    },
    changeStripeKey(state, { payload }) {
      state.stripe = payload
    },
    changeLanguage(state, { payload }) {
      state.language = payload
    },
    changeCurrency(state, { payload }) {
      state.currency = payload
    }
  }
})

slice.actions.redirectToCheckout = (sessionId) => ({
  type: 'cart/redirectToCheckout',
  payload: sessionId
})
slice.actions.checkoutSingleItem = (productId) => ({
  type: 'cart/checkoutSingleItem',
  payload: productId
})

export const { reducer, actions } = slice
