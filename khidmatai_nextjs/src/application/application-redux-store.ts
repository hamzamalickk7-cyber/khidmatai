import { configureStore } from "@reduxjs/toolkit";
import { profileEditingReducer } from "@/modules/profile/state/profile-editing-slice";

export const applicationReduxStore = configureStore({ reducer: { profileEditing: profileEditingReducer } });
export type ApplicationRootState = ReturnType<typeof applicationReduxStore.getState>;
export type ApplicationDispatch = typeof applicationReduxStore.dispatch;
