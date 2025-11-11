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
  reducers: {
    setBusiness: (state, action: PayloadAction<TBusiness>) => {
      state.business = action.payload;
    },
    setBusinessList: (state, action: PayloadAction<TBusiness[]>) => {
      state.businessList = action.payload;
    },
    setUsersByBusinessId: (state, action: PayloadAction<TUser[]>) => {
      state.usersByBusinessId = action.payload;
    }
  },
});

export const { setBusiness, setBusinessList, setUsersByBusinessId } = businessSlice.actions;
export default businessSlice.reducer;