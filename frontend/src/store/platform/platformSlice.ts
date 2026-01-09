import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TPlatform} from "../../models/Platform";

type PlatformState = {
  platforms: TPlatform[] | null;
};

const initialState: PlatformState = {
  platforms: null,
};

const platformSlice = createSlice({
  name: 'platform',
  initialState,
  reducers: {
    setPlatforms: (state, action: PayloadAction<TPlatform[]>) => {
      state.platforms = action.payload
    }
  },
});

export const { setPlatforms } = platformSlice.actions;
export default platformSlice.reducer;