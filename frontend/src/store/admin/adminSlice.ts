import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { signUpAdmin, signInAdmin, signOutAdmin } from "./adminThunks";
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signUpAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUpAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.data;
      })
      .addCase(signUpAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })

      // Sign In
      .addCase(signInAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedAdmin = true;
        state.admin = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
      })
      .addCase(signInAdmin.rejected, (state, action) => {
        state.loading = false;
      })

      // Sign Out
      .addCase(signOutAdmin.pending, (state) => {
        state.loading = true
      })
      .addCase(signOutAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedAdmin = false;
        state.admin = null
        state.accessToken = null;
      })
      .addCase(signOutAdmin.rejected, (state, action) => {
        state.loading = false;
      })
  }
})

export const { } = adminSlice.actions
export default adminSlice.reducer