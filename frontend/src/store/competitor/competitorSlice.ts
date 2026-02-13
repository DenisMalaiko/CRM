import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TCompetitor } from "../../models/Competitor";

type CompetitorState = {
  competitors: TCompetitor[] | null
  competitor: TCompetitor | null
}

const initialState: CompetitorState = {
  competitors: null,
  competitor: null
}

const competitorSlice = createSlice({
  name: "competitor",
  initialState,
  reducers: {
    setCompetitors: (state, action: PayloadAction<TCompetitor[]>) => {
      state.competitors = action.payload;
    },
    setCompetitor: (state, action: PayloadAction<TCompetitor>) => {
      state.competitor = action.payload;
    }
  }
});

export const { setCompetitors, setCompetitor } = competitorSlice.actions;
export default competitorSlice.reducer;