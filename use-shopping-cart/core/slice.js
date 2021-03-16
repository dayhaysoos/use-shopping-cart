import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, removeEntry, updateQuantity } from './Entry'
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
  formattedTotalPrice: '$0.00',
  cartDetails: {},
  stripe: ''
}

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: {
      reducer: (state, action) => {
        const {
          product,
          options: { count, price_metadata, product_metadata }
        } = action.payload

        const id =
          product.id ||
          product.price_id ||
          product.sku_id ||
          product.sku ||
          uuidv4()

        if (count <= 0) {
          console.warn(
            'addItem requires the count to be greater than zero.',
            action
          )
          return
        }

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
      reducer: (state, action) => {
        const { id, quantity } = action.payload
        if (quantity < 0) {
          console.warn(
            'setItemQuantity requires the quantity to be greater than or equal to zero.',
            action
          )
          return
        }

        if (quantity <= 0) return removeEntry({ state, id })

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
        // TODO: Figure out how `loadCart` should work when merging.
        // Right now, if you were to `useEffect(() => loadCart(cartDetailsFromServer), [])`,
        // your cart would just keep getting bigger on every reload. Also, is merging a good idea?
        const { cartDetails, shouldMerge } = payload
        if (!shouldMerge) {
          state.cartCount = 0
          state.totalPrice = 0
          state.cartDetails = {}
        }

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
      reducer: (state) => {
        return state
      }
    },
    checkoutSingleItem: {
      reducer: (state) => {
        return state
      },
      prepare: (productId) => {
        return { payload: { productId } }
      }
    },
    handleCartHover: (state) => {
      state.shouldDisplayCart = true
    },
    handleCartClick: (state) => {
      state.shouldDisplayCart = !state.shouldDisplayCart
    },
    handleCloseCart: (state) => {
      state.shouldDisplayCart = false
    },
    storeLastClicked: (state, { payload }) => {
      state.lastClicked = payload
    },
    initializeStripe: (state, { payload }) => {
      state.stripe = payload
    }
  }
})

export const { reducer, actions } = slice
