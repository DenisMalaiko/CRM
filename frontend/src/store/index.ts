import { configureStore } from '@reduxjs/toolkit'
import authModule from './auth/authSlice'

export const store = configureStore({
  reducer: {
    authModule: authModule,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch