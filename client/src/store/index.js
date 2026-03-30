import { configureStore } from '@reduxjs/toolkit';
import teamsReducer from './teamsSlice.js';
const store = configureStore({
  reducer: {
    teams: teamsReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});
export default store;
