import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TAgency } from "../../models/Agency";
import { TUser}  from "../../models/User";

type AgencyState = {
  agencyList: TAgency[] | null;
  agency: TAgency | null;
  usersByAgencyId: TUser[] | null;
  loading: boolean
  error: string | null | any
}

const initialState: AgencyState = {
  agency: null,
  agencyList: null,
  usersByAgencyId: null,
  loading: false,
  error: null,
}

const agencySlice = createSlice({
  name: "agency",
  initialState,
  reducers: {
    setAgency: (state, action: PayloadAction<TAgency>) => {
      state.agency = action.payload;
    },
    setAgencyList: (state, action: PayloadAction<TAgency[]>) => {
      state.agencyList = action.payload;
    },
    setUsersByAgencyId: (state, action: PayloadAction<TUser[]>) => {
      state.usersByAgencyId = action.payload;
    }
  },
});

export const { setAgency, setAgencyList, setUsersByAgencyId } = agencySlice.actions;
export default agencySlice.reducer;