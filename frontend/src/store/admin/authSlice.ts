import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { signUpAdmin } from "./authThunks";
import { TAdmin } from "../../models/User";

type AuthState = {
  isAuthenticated: boolean
  admin: TAdmin | null
  loading: boolean
  error: string | null | any
  accessToken: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
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
  }
})

export const { } = adminSlice.actions
export default adminSlice.reducer