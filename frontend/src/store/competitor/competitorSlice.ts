import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TCompetitor } from "../../models/Competitor";

type CompetitorState = {
  competitors: TCompetitor[] | null
  competitor: TCompetitor | null
  posts: any[] | null
  instagramPosts: any[] | null
  instagramReels: any[] | null
  ads: any[] | null
}

const initialState: CompetitorState = {
  competitors: [],
  competitor: null,
  posts: [],
  instagramPosts: [],
  instagramReels: [],
  ads: []
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
    },
    setPosts: (state, action: PayloadAction<any[]>) => {
      state.posts = action.payload;
    },
    setInstagramPosts: (state, action: PayloadAction<any[]>) => {
      state.instagramPosts = action.payload;
    },
    setInstagramReels: (state, action: PayloadAction<any[]>) => {
      state.instagramReels = action.payload;
    },
    setAds: (state, action: PayloadAction<any[]>) => {
      state.ads = action.payload;
    }
  }
});

export const { setCompetitors, setCompetitor, setPosts, setInstagramPosts, setInstagramReels, setAds } = competitorSlice.actions;
export default competitorSlice.reducer;