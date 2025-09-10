import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { signUpUser } from './authThunks'

type AuthState = {
  isAuthenticated: boolean
  user: string | null
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
    signUp: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.message
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Error'
      })
  }
})

export const { signUp } = authSlice.actions
export default authSlice.reducer