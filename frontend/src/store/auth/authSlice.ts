import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { signUpUser } from './authThunks'
import { TUser } from "../../models/User";

type AuthState = {
  isAuthenticated: boolean
  user: TUser | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signUp: (state, action: PayloadAction<TUser>) => {
      state.isAuthenticated = true

      console.log("---------")
      console.log("signUp ", action.payload)
      console.log("---------")
      //state.user.name = action.payload.name;
    },
  },
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
  }
})

export const { signUp } = authSlice.actions
export default authSlice.reducer