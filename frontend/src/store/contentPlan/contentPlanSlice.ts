import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TContentPlan } from "../../models/ContentPlan";

type ContentPlanState = {
  contentPlans: TContentPlan[] | null;
}

const initialState: ContentPlanState = {
  contentPlans: null
};

const contentPlanSlice = createSlice({
  name: "contentPlan",
  initialState,
  reducers: {
    setContentPlans: (state, action: PayloadAction<TContentPlan[]>) => {
      state.contentPlans = action.payload;
    },
  },
});

export const { setContentPlans } = contentPlanSlice.actions;
export default contentPlanSlice.reducer;
