import { createSlice } from "@reduxjs/toolkit";

interface ProfileEditingState {
  isEditing: boolean;
}
const initialState: ProfileEditingState = { isEditing: false };
const profileEditingSlice = createSlice({
  name: "profileEditing",
  initialState,
  reducers: {
    beginProfileEditing(state) {
      state.isEditing = true;
    },
    finishProfileEditing(state) {
      state.isEditing = false;
    },
  },
});
export const { beginProfileEditing, finishProfileEditing } = profileEditingSlice.actions;
export const profileEditingReducer = profileEditingSlice.reducer;
