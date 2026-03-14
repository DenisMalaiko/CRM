import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GalleryState = {
  photos: any[];
  defaultPhotos: any[];
}

const initialState: GalleryState = {
  photos: [],
  defaultPhotos: [],
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
  },
});

export const { setGalleryPhotos, setDefaultGalleryPhotos } = gallerySlice.actions;
export default gallerySlice.reducer;