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
})

export const { setUser, setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;