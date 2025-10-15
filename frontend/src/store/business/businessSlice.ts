import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TBusiness } from "../../models/Business";
import { getBusinessList } from "./businessThunks";

type BusinessState = {
  businessList: TBusiness[] | null;
  business: TBusiness | null;
  loading: boolean
  error: string | null | any
}

const initialState: BusinessState = {
  businessList: null,
  business: null,
  loading: false,
  error: null,
}

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBusinessList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBusinessList.fulfilled, (state, action) => {
        state.loading = false;
        state.businessList = action.payload.data;
      })
      .addCase(getBusinessList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })
  }
});

export const { } = businessSlice.actions
export default businessSlice.reducer