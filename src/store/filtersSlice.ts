import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { logout } from "./authSlice";

export type SortOrder = "asc" | "desc";
export type SortBy = "price" | "alphabet";

interface FiltersState {
  sortBy: SortBy;
  order: SortOrder;
}

const initialState: FiltersState = {
  sortBy: "price",
  order: "asc",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<FiltersState>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { setFilters } = filtersSlice.actions;
export default filtersSlice.reducer;