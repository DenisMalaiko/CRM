import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TAiPhoto } from "../../../models/AiPhoto";

type PhotoAiState = {
  photosAi: TAiPhoto[] | null;
};

const initialState: PhotoAiState = {
  photosAi: null,
};

const photoAiSlice = createSlice({
  name: "photoAi",
  initialState,
  reducers: {
    setPhotosAi: (state, action: PayloadAction<TAiPhoto[]>) => {
      state.photosAi = action.payload;
    },
  },
});

export const { setPhotosAi } = photoAiSlice.actions;
export default photoAiSlice.reducer;
