import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TrendsState = {
  tiktokVideos: any[] | null,
}

const initialState: TrendsState = {
  tiktokVideos: null,
}

const trendsSlice = createSlice({
  name: "trends",
  initialState,
  reducers: {
    setTiktokVideos: (state, action: PayloadAction<any[]>) => {
      state.tiktokVideos = action.payload;
    }
  },
});

export const { setTiktokVideos } = trendsSlice.actions;
export default trendsSlice.reducer;
