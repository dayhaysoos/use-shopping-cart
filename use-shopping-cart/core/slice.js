import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, removeEntry, updateQuantity } from './Entry'
import { isClient } from '../utilities/SSR'
import { checkoutHandler } from '../utilities/old-utils'

export const cartInitialState = {
  mode: 'checkout-session',
  stripe: null,
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  formattedTotalPrice: '$0.00',
  cartDetails: {}
}

const slice = createSlice({
  name: 'cart',
  initialState: cartInitialState,
  reducers: {
    addItem: {
      reducer: (state, { payload }) => {
        const {
          product,
          options,
          options: { count, price_metadata, product_metadata }
        } = payload

        const id =
          product.id ||
          product.price_id ||
          product.sku_id ||
          product.sku ||
          uuidv4()
        if (count <= 0) return

        if (id in state.cartDetails) {
          return updateEntry({
            state,
            id,
            count,
            price_metadata,
            product_metadata,
            currency: state.currency,
            language: state.language
          })
        } else {
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
        }
      },
      prepare: (product, options = { count: 1 }) => {
        if (!options.price_metadata) options.price_metadata = {}
        if (!options.product_metadata) options.product_metadata = {}
        if (!options.count) options.count = 1
        return { payload: { product, options } }
      }
    },
    incrementItem: {
      reducer: (state, { payload }) => {
        const {
          id,
          options: { count }
        } = payload

        return updateEntry({
          state,
          id,
          count,
          currency: state.currency,
          language: state.language
        })
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

        return updateEntry({
          state,
          id,
          count: -count,
          currency: state.currency,
          language: state.language
        })
      },
      prepare: (id, options = { count: 1 }) => {
        return { payload: { id, options } }
      }
    },
    clearCart: {
      reducer: (state) => {
        state.cartCount = 0
        state.totalPrice = 0
        state.cartDetails = {}
      }
    },
    setItemQuantity: {
      reducer: (state, { payload }) => {
        const { id, quantity } = payload

        if (quantity <= 0) {
          return removeEntry({ state, id })
        }

        if (id in state.cartDetails) {
          return updateQuantity({ ...state, state, id, quantity })
        }
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
        if (!shouldMerge) state = { ...cartInitialState }

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
    // TODO: discuss solutions to this. The two following actions do not redirect to checkout.
    redirectToCheckout: {
      reducer: (state) => {
        return state
      }
      // checkoutHandler(state, {
      //   modes: ['client-only', 'checkout-session'],
      //   stripe(stripe, options) {
      //     return stripe.redirectToCheckout(options)
      //   }
      // })
    },
    checkoutSingleItem: {
      reducer: (state) => {
        return state
      }
      // checkoutHandler(state, {
      //   modes: ['client-only'],
      //   stripe(stripe, options, { sku, quantity = 1 }) {
      //     options.lineItems = [{ price: sku, quantity }]
      //     return stripe.redirectToCheckout(options)
      //   }
      // })
    },
    handleCartClick: (state) => {
      state.shouldDisplayCart = !state.shouldDisplayCart

      return state
    },
    handleCloseCart: (state) => {
      state.shouldDisplayCart = false
    },
    storeLastClicked: (state, { payload }) => {
      state.lastClicked = payload
    }
  }
})

export const { reducer, actions } = slice
