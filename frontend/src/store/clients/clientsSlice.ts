import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { TClient } from "../../models/Client";

type ClientsState = {
  clients: TClient[] | null;
  client: TClient | null;
  loading: boolean
  error: string | null | any
}

const initialState: ClientsState = {
  clients: null,
  client: null,
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
    setClient: (state, action: PayloadAction<TClient>) => {
      state.client = action.payload;
    },
  },
})

export const { setClients, setClient } = clientSlice.actions;
export default clientSlice.reducer;