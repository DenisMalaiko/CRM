import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TIdea } from "../../models/Idea";

type IdeaState = {
  ideas: TIdea[] | null
}

const initialState: IdeaState = {
  ideas: []
}

const ideaSlice = createSlice({
  name: "idea",
  initialState,
  reducers: {
    setIdeas: (state, action: PayloadAction<TIdea[]>) => {
      state.ideas = action.payload;
    },
  },
});

export const { setIdeas } = ideaSlice.actions;
export default ideaSlice.reducer;