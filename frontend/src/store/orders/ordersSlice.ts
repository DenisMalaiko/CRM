import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from "../../models/Order";

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

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<TOrder[]>) => {
      state.orders = action.payload;
    }
  }
});

export const { setOrders } = orderSlice.actions;
export default orderSlice.reducer