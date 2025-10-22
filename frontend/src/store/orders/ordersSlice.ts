import { createSlice } from '@reduxjs/toolkit';
import { TOrder } from "../../models/Order";
import { getOrders } from "./ordersThunks";

type OrdersState = {
  orders: TOrder[] | null;
  loading: boolean
  error: string | null | any
}

const initialState: OrdersState = {
  orders: null,
  loading: false,
  error: null,
}

const orders = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })
  }
});

export default orders.reducer