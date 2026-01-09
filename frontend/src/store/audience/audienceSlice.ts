import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TAudience} from "../../models/Audience";

type AudienceState = {
  audiences: TAudience[] | null;
};

const initialState: AudienceState = {
  audiences: null,
};

const audienceSlice = createSlice({
  name: 'audience',
  initialState,
  reducers: {
    setAudiences: (state, action: PayloadAction<TAudience[]>) => {
      state.audiences = action.payload
    }
  },
});

export const { setAudiences } = audienceSlice.actions;
export default audienceSlice.reducer;