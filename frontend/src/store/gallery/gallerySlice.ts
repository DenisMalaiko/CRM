import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GalleryState = {
  photos: any[];
}

const initialState: GalleryState = {
  photos: [],
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setGalleryPhotos: (state, action: PayloadAction<any[]>) => {
      state.photos = action.payload;
    },
  },
});

export const { setGalleryPhotos } = gallerySlice.actions;
export default gallerySlice.reducer;