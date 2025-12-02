import { configureStore } from '@reduxjs/toolkit'
import adminModule from './admin/adminSlice'
import authModule from './auth/authSlice'
import productsModule from './products/productsSlice'
import businessModule from './business/businessSlice'
import clientsModule from './clients/clientsSlice'
import ordersModule from './orders/ordersSlice'
import managerModule from "./ai/manager/managerSlice";
import { api } from './api/api'

export const store = configureStore({
  reducer: {
    adminModule: adminModule,
    authModule: authModule,
    productsModule: productsModule,
    businessModule: businessModule,
    clientsModule: clientsModule,
    ordersModule: ordersModule,
    managerModule: managerModule,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware: any) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;