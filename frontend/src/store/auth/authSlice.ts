import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TUser } from "../../models/User";

type AuthState = {
  isAuthenticatedUser: boolean
  user: TUser | null
  usersByBusinessId: TUser[] | null
  loading: boolean
  error: string | null | any
  accessToken: string | null
}

const initialState: AuthState = {
  isAuthenticatedUser: false,
  user: null,
  usersByBusinessId: null,
  loading: false,
  error: null,
  accessToken: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<TUser>) => {
      state.user = action.payload;
      state.isAuthenticatedUser = true;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      } else {
        localStorage.removeItem('accessToken');
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticatedUser = false;
      localStorage.removeItem('accessToken');
    },
  },

  /*extraReducers: (builder) => {
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
        state.isAuthenticatedUser = true;
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
      })

      // Sign Out
      .addCase(signOutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(signOutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedUser = false;
        state.user = null
        state.accessToken = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.loading = false;
      })
  }*/
})

export const { setUser, setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;