import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TAIArtifact } from "../../models/AIArtifact";

type ArtifactState = {
  posts: TAIArtifact[] | null
  stories: TAIArtifact[] | null
}

const initialState: ArtifactState = {
  posts: null,
  stories: null
}

const artifactSlice = createSlice({
  name: "artifact",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<TAIArtifact[]>) => {
      state.posts = action.payload;
    },
    setStories: (state, action: PayloadAction<TAIArtifact[]>) => {
      state.stories = action.payload;
    }
  }
});

export const { setPosts, setStories } = artifactSlice.actions;
export default artifactSlice.reducer;
