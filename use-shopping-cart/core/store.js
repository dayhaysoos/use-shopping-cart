import { configureStore } from '@reduxjs/toolkit'
import { reducer } from '../core/slices/cartSlice'

export default configureStore({
  reducer: {
    cart: reducer
  }
})
