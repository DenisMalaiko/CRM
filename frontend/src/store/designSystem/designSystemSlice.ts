import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TDesignSystem } from "../../models/DesignSystem";

type DesignSystemState = {
  presets: TDesignSystem[];
  businessSystems: TDesignSystem[];
  selected: TDesignSystem | null;
  panelOpen: boolean;
};

const initialState: DesignSystemState = {
  presets: [],
  businessSystems: [],
  selected: null,
  panelOpen: false,
};

const designSystemSlice = createSlice({
  name: "designSystem",
  initialState,
  reducers: {
    setPresets(state, action: PayloadAction<TDesignSystem[]>) {
      state.presets = action.payload;
    },
    setBusinessSystems(state, action: PayloadAction<TDesignSystem[]>) {
      state.businessSystems = action.payload;
    },
    setSelected(state, action: PayloadAction<TDesignSystem | null>) {
      state.selected = action.payload;
      state.panelOpen = action.payload !== null;
    },
    closePanel(state) {
      state.panelOpen = false;
      state.selected = null;
    },
    addBusinessSystem(state, action: PayloadAction<TDesignSystem>) {
      state.businessSystems.unshift(action.payload);
    },
    updateBusinessSystem(state, action: PayloadAction<TDesignSystem>) {
      const idx = state.businessSystems.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (idx !== -1) state.businessSystems[idx] = action.payload;
      if (state.selected?.id === action.payload.id)
        state.selected = action.payload;
    },
    removeBusinessSystem(state, action: PayloadAction<string>) {
      state.businessSystems = state.businessSystems.filter(
        (s) => s.id !== action.payload,
      );
      if (state.selected?.id === action.payload) {
        state.selected = null;
        state.panelOpen = false;
      }
    },
    setActiveSystem(state, action: PayloadAction<string>) {
      state.businessSystems.forEach((s) => { s.isActive = false; });
      const target = state.businessSystems.find((s) => s.id === action.payload);
      if (target) target.isActive = true;
      if (state.selected) {
        state.selected.isActive = state.selected.id === action.payload;
      }
    },
  },
});

export const {
  setPresets,
  setBusinessSystems,
  setSelected,
  closePanel,
  addBusinessSystem,
  updateBusinessSystem,
  removeBusinessSystem,
  setActiveSystem,
} = designSystemSlice.actions;

export default designSystemSlice.reducer;
