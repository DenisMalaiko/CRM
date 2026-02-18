import { configureStore } from '@reduxjs/toolkit'
import adminModule from './admin/adminSlice'
import authModule from './auth/authSlice'
import productsModule from './products/productsSlice'
import agencyModule from './agency/agencySlice'
import businessModule from './businesses/businessesSlice'
import managerModule from "./ai/manager/managerSlice";
import profileModule from "./profile/profileSlice";
import audienceModule from "./audience/audienceSlice";
import platformModule from "./platform/platformSlice";
import artifactModule from "./artifact/artifactSlice"
import promptModule from "./prompts/promptSlice";
import competitorModule from "./competitor/competitorSlice";
import galleryModule from "./gallery/gallerySlice";
import { api } from './api/api'

export const store = configureStore({
  reducer: {
    adminModule: adminModule,
    authModule: authModule,
    productsModule: productsModule,
    agencyModule: agencyModule,
    businessModule: businessModule,
    managerModule: managerModule,
    profileModule: profileModule,
    audienceModule: audienceModule,
    platformModule: platformModule,
    artifactModule: artifactModule,
    promptModule: promptModule,
    competitorModule: competitorModule,
    galleryModule: galleryModule,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware: any) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;