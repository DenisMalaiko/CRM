import {createSlice} from "@reduxjs/toolkit";

type ManagerState = {
  sessions: any[];
  currentSession: any;
  currentMessages: any;
}

const initialState = {
  sessions: [],
  currentSession: null,
  currentMessages: null,
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setCurrentMessages: (state, action) => {
      state.currentMessages = action.payload;
    },
  }
});

export const { setSessions, setCurrentSession, setCurrentMessages } = managerSlice.actions;
export default managerSlice.reducer;