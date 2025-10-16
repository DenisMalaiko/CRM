import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getBusinessList, getBusiness, getUsersByBusinessId } from "./businessThunks";
import { TBusiness } from "../../models/Business";
import { TUser}  from "../../models/User";

type BusinessState = {
  businessList: TBusiness[] | null;
  business: TBusiness | null;
  usersByBusinessId: TUser[] | null;
  loading: boolean
  error: string | null | any
}

const initialState: BusinessState = {
  businessList: null,
  business: null,
  usersByBusinessId: null,
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

      // Get Business
      .addCase(getBusiness.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.business = action.payload.data;
      })
      .addCase(getBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })

      // Get Users By Business ID
      .addCase(getUsersByBusinessId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsersByBusinessId.fulfilled, (state, action) => {
        state.loading = false;
        state.usersByBusinessId = action.payload.data;
      })
      .addCase(getUsersByBusinessId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })
  }
});

export const { } = businessSlice.actions
export default businessSlice.reducer