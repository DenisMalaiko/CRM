import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { TBusinessProfile } from '../../models/BusinessProfile';

type ProfileState = {
  profiles: TBusinessProfile[] | null
}

const initialState: ProfileState = {
  profiles: null
}

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<TBusinessProfile[]>) => {
      state.profiles = action.payload;
    }
  }
});

export const { setProfiles } = profileSlice.actions;
export default profileSlice.reducer;