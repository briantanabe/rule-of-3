import { configureStore } from "@reduxjs/toolkit";
import streakReducer from "../features/counter/streak";

export const store = configureStore({
  reducer: {
    streak: streakReducer,
  },
});
