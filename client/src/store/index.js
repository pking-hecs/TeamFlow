import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import teamsReducer from "./teamsSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamsReducer,
  },
});
