import { configureStore } from "@reduxjs/toolkit";
import streakReducer from "./reducers/streak";

export const store = configureStore({
  reducer: {
    streak: streakReducer,
  },
});
