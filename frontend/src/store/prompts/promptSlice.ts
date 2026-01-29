import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPrompt } from "../../models/Prompt";

type PromptState = {
  prompts: TPrompt[] | null
}

const initialState: PromptState = {
  prompts: null
}

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setPrompts: (state, action: PayloadAction<TPrompt[]>) => {
      state.prompts = action.payload;
    }
  }
});

export const { setPrompts } = promptSlice.actions;
export default promptSlice.reducer;