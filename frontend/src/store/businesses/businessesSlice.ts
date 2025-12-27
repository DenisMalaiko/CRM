import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TBusiness } from "../../models/Business";

type BusinessState = {
  businesses: TBusiness[] | null;
  business: TBusiness | null;
  loading: boolean
  error: string | null | any
}

const initialState: BusinessState = {
  businesses: null,
  business: null,
  loading: false,
  error: null,
}

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setBusinesses: (state, action: PayloadAction<TBusiness[]>) => {
      state.businesses = action.payload;
    },
    setBusiness: (state, action: PayloadAction<TBusiness>) => {
      state.business = action.payload;
    },
  },
})

export const { setBusinesses, setBusiness } = businessSlice.actions;
export default businessSlice.reducer;