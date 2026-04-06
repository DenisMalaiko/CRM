import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IdeaAiState = {
  ideasAi: any[] | null;
}

const initialState: IdeaAiState = {
  ideasAi: null
};

const ideaAiSlice = createSlice({
  name: "ideaAi",
  initialState,
  reducers: {
    setIdeasAi: (state, action: PayloadAction<any[]>) => {
      state.ideasAi = action.payload;
    },
  },
});

export const { setIdeasAi } = ideaAiSlice.actions;
export default ideaAiSlice.reducer;