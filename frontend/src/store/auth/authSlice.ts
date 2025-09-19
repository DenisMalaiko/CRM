import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { signUpUser, signInUser } from './authThunks'
import { TUser } from "../../models/User";

type AuthState = {
  isAuthenticated: boolean
  user: TUser | null
  loading: boolean
  error: string | null | any
  accessToken: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  accessToken: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })

      // Sign In
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        // якщо в action.payload є accessToken
        state.accessToken = action.payload.data.accessToken;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload?.message ?? 'Error';
      });
  }
})

export const { } = authSlice.actions
export default authSlice.reducer