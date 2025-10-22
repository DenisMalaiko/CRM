import { createSlice } from '@reduxjs/toolkit';
import { getClients } from "./clientsThunks";
import { TClient } from "../../models/Client";

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
    builder
      .addCase(getClients.pending, (state) => {
        state.loading = true;
      })
      .addCase(getClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.data;
      })
      .addCase(getClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })
  }
})

export const { } = clientSlice.actions
export default clientSlice.reducer