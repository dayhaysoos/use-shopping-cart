import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../core/slices/cartSlice'

export default configureStore({
  reducer: {
    cart: cartReducer
  }
})
