import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TAdmin } from "../../models/User";

type AuthState = {
  isAuthenticatedAdmin: boolean
  admin: TAdmin | null
  loading: boolean
  error: string | null | any
  accessToken: string | null
}

const initialState: AuthState = {
  isAuthenticatedAdmin: false,
  admin: null,
  loading: false,
  error: null,
  accessToken: null
}

const adminSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<TAdmin>) => {
      state.admin = action.payload;
    },
    setAdminAccessToken: (state, action: PayloadAction<string | null>) => {
      state.isAuthenticatedAdmin = true;
      state.accessToken = action.payload;
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      } else {
        localStorage.removeItem('accessToken');
      }
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.accessToken = null;
      state.isAuthenticatedAdmin = false;
      localStorage.removeItem('accessToken');
    },
  },
})

export const { setAdmin, setAdminAccessToken, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;