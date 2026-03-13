import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TrendsState = {
  trends: any[] | null
}

const initialState: TrendsState = {
  trends: null
}

const trendsSlice = createSlice({
  name: "trends",
  initialState,
  reducers: {
    setTrends: (state, action: PayloadAction<any[]>) => {
      state.trends = action.payload;
    },
  },
});

export const { setTrends } = trendsSlice.actions;
export default trendsSlice.reducer;