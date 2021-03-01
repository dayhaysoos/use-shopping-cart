import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, removeEntry, updateQuantity } from './Entry'
import { isClient } from '../utilities/SSR'
import { checkoutHandler } from '../utilities/old-utils'

export const initialState = {
  mode: 'checkout-session',
  stripe: null,
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  cartDetails: {}
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

        if (count <= 0) {
          console.warn(
            'addItem requires the count to be greater than zero.',
            action
          )
        }

        if (action.payload.id in state.cartDetails) {
          return updateEntry({
            id: action.payload.id,
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
        if (!options.price_metadata) options.price_metadata = {}
        if (!options.product_metadata) options.product_metadata = {}
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
    // TODO: discuss solutions to this. The two following actions do not redirect to checkout.
    redirectToCheckout: {
      reducer: (state) =>
        checkoutHandler(state, {
          modes: ['client-only', 'checkout-session'],
          stripe(stripe, options) {
            return stripe.redirectToCheckout(options)
          }
        })
    },
    checkoutSingleItem: {
      reducer: (state) =>
        checkoutHandler(state, {
          modes: ['client-only'],
          stripe(stripe, options, { sku, quantity = 1 }) {
            options.lineItems = [{ price: sku, quantity }]
            return stripe.redirectToCheckout(options)
          }
        })
    },
    handleCartHover: (state) => {
      state.shouldDisplayCart = true
    },
    handleCartClick: (state) => {
      state.shouldDisplayCart = !state.shouldDisplayCart
    },
    handleCloseCart: (state) => {
      state.shouldDisplayCart = false
    }
  }
})

export const { reducer, actions } = slice
