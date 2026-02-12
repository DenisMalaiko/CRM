import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TCompetitor } from "../../models/Competitor";

type CompetitorState = {
  competitors: TCompetitor[] | null
}

const initialState: CompetitorState = {
  competitors: null,
}

const competitorSlice = createSlice({
  name: "competitor",
  initialState,
  reducers: {
    setCompetitors: (state, action: PayloadAction<TCompetitor[]>) => {
      state.competitors = action.payload;
    }
  }
});

export const { setCompetitors } = competitorSlice.actions;
export default competitorSlice.reducer;