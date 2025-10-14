import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TBusiness } from "../../models/Business";

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
});

export const { } = businessSlice.actions
export default businessSlice.reducer