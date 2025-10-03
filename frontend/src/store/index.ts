import { configureStore } from '@reduxjs/toolkit'
import authModule from './auth/authSlice'
import productsModule from './products/productsSlice'

export const store = configureStore({
  reducer: {
    authModule: authModule,
    productsModule: productsModule,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch