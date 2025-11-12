import {createSlice, PayloadAction} from '@reduxjs/toolkit';
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
  reducers: {
    setClients: (state, action: PayloadAction<TClient[]>) => {
      state.clients = action.payload;
    },
  },
})

export const { setClients } = clientSlice.actions;
export default clientSlice.reducer;