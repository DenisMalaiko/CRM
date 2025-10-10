import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TClient } from "../../models/Client";
import {signUpUser} from "../auth/authThunks";

type ClientsState = {
  clients: TClient[] | null;
  loading: boolean
  error: string | null | any
}

const initialState: ClientsState = {
  clients: null,
  loading: false,
  error: null,
}

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
/*    builder
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
      })*/
  }
})