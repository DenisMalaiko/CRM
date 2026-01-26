import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TAIArtifact } from "../../models/AIArtifact";

type ArtifactState = {
  creatives: TAIArtifact[] | null
}

const initialState: ArtifactState = {
  creatives: null
}

const artifactSlice = createSlice({
  name: "artifact",
  initialState,
  reducers: {
    setCreatives: (state, action: PayloadAction<TAIArtifact[]>) => {
      state.creatives = action.payload;
    }
  }
});

export const { setCreatives } = artifactSlice.actions;
export default artifactSlice.reducer;
