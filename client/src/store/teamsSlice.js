import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamsAPI } from "../services/api.js";

export const fetchUserTeams = createAsyncThunk(
  "teams/fetchUserTeams",
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamsAPI.getUserTeams();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch teams");
    }
  }
);

const teamsSlice = createSlice({
  name: "teams",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default teamsSlice.reducer;
