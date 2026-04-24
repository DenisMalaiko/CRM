import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GalleryState = {
  photos: any[];
  defaultPhotos: any[];
  aiPhotos: any[];
}

const initialState: GalleryState = {
  photos: [],
  defaultPhotos: [],
  aiPhotos: [],
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setGalleryPhotos: (state, action: PayloadAction<any[]>) => {
      state.photos = action.payload;
    },
    setDefaultGalleryPhotos: (state, action: PayloadAction<any[]>) => {
      state.defaultPhotos = action.payload;
    },
    setAiPhotosGalleryPhotos: (state, action: PayloadAction<any[]>) => {
      state.aiPhotos = action.payload;
    },
  },
});

export const { setGalleryPhotos, setDefaultGalleryPhotos, setAiPhotosGalleryPhotos } = gallerySlice.actions;
export default gallerySlice.reducer;