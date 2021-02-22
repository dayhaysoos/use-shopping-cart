import { configureStore } from '@reduxjs/toolkit'
import cartReducer from 'use-shopping-cart/src/core/slices/cartSlice'

export default configureStore({
  reducer: {
    cart: cartReducer
  }
})
