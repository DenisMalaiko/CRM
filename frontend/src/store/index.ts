import { configureStore } from '@reduxjs/toolkit'
import adminModule from './admin/adminSlice'
import authModule from './auth/authSlice'
import productsModule from './products/productsSlice'
import businessModule from './business/businessSlice'
import clientsModule from './clients/clientsSlice'

export const store = configureStore({
  reducer: {
    adminModule: adminModule,
    authModule: authModule,
    productsModule: productsModule,
    businessModule: businessModule,
    clientsModule: clientsModule
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch