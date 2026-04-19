import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamsApi } from '../services/api.js';
// ─── Sample data for design testing (remove when backend is ready) ────────────
const SAMPLE_TEAMS = [];
const SAMPLE_CURRENT_TEAM = null;
export const fetchTeams = createAsyncThunk('teams/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await teamsApi.getAll();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch teams');
  }
});
export const fetchTeam = createAsyncThunk('teams/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await teamsApi.getById(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch team');
  }
});
export const createTeam = createAsyncThunk('teams/create', async (data, { rejectWithValue }) => {
  try {
    const res = await teamsApi.create(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create team');
  }
});
export const updateTeam = createAsyncThunk('teams/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await teamsApi.update(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update team');
  }
});
export const deleteTeam = createAsyncThunk('teams/delete', async (id, { rejectWithValue }) => {
  try {
    await teamsApi.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete team');
  }
});
export const addTeamMember = createAsyncThunk('teams/addMember', async ({ teamId, email, role }, { rejectWithValue }) => {
  try {
    const res = await teamsApi.addMember(teamId, { email, role });
    return { teamId, member: res.data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add member');
  }
});
export const updateTeamMember = createAsyncThunk('teams/updateMember', async ({ teamId, userId, role }, { rejectWithValue }) => {
  try {
    await teamsApi.updateMember(teamId, userId, { role });
    return { teamId, userId, role };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update role');
  }
});
export const removeTeamMember = createAsyncThunk('teams/removeMember', async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await teamsApi.removeMember(teamId, userId);
    return { teamId, userId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to remove member');
  }
});

export const fetchUserTeams = fetchTeams; // Alias for backward compatibility with older components

// ─── Slice ────────────────────────────────────────────────────────────────────
const teamsSlice = createSlice({
  name: 'teams',
  initialState: {
    teams:         SAMPLE_TEAMS,        // pre-loaded sample data for design testing
    currentTeam:   SAMPLE_CURRENT_TEAM, // pre-loaded so side panel works
    loading:       false,
    actionLoading: false,
    error:         null,
    actionError:   null,
    items: [], // to be backward compatible
  },
  reducers: {
    clearActionError(state) { state.actionError = null; },
    clearCurrentTeam(state) { state.currentTeam = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchTeams
      .addCase(fetchTeams.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeams.fulfilled, (s, a) => { s.loading = false; s.teams = a.payload; s.items = a.payload; })
      .addCase(fetchTeams.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      // fetchTeam (detail panel)
      .addCase(fetchTeam.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeam.fulfilled, (s, a) => { s.loading = false; s.currentTeam = a.payload; })
      .addCase(fetchTeam.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      // createTeam
      .addCase(createTeam.pending,   (s) => { s.actionLoading = true; s.actionError = null; })
      .addCase(createTeam.fulfilled, (s, a) => { s.actionLoading = false; s.teams.unshift(a.payload); s.items.unshift(a.payload); })
      .addCase(createTeam.rejected,  (s, a) => { s.actionLoading = false; s.actionError = a.payload; })
      // updateTeam
      .addCase(updateTeam.pending,   (s) => { s.actionLoading = true; s.actionError = null; })
      .addCase(updateTeam.fulfilled, (s, a) => {
        s.actionLoading = false;
        const idx = s.teams.findIndex((t) => t.id === a.payload.id);
        if (idx !== -1) {
          s.teams[idx] = { ...s.teams[idx], ...a.payload };
          s.items[idx] = s.teams[idx];
        }
        if (s.currentTeam?.id === a.payload.id) s.currentTeam = { ...s.currentTeam, ...a.payload };
      })
      .addCase(updateTeam.rejected,  (s, a) => { s.actionLoading = false; s.actionError = a.payload; })
      // deleteTeam
      .addCase(deleteTeam.pending,   (s) => { s.actionLoading = true; s.actionError = null; })
      .addCase(deleteTeam.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.teams = s.teams.filter((t) => t.id !== a.payload);
        s.items = s.items.filter((t) => t.id !== a.payload);
        if (s.currentTeam?.id === a.payload) s.currentTeam = null;
      })
      .addCase(deleteTeam.rejected,  (s, a) => { s.actionLoading = false; s.actionError = a.payload; })
      // addTeamMember
      .addCase(addTeamMember.pending,   (s) => { s.actionLoading = true; s.actionError = null; })
      .addCase(addTeamMember.fulfilled, (s, a) => {
        s.actionLoading = false;
        if (s.currentTeam?.id === a.payload.teamId) {
          s.currentTeam.members.push(a.payload.member);
          s.currentTeam.member_count = (s.currentTeam.member_count || 0) + 1;
        }
        const t = s.teams.find((t) => t.id === a.payload.teamId);
        if (t) t.member_count = (t.member_count || 0) + 1;
      })
      .addCase(addTeamMember.rejected, (s, a) => { s.actionLoading = false; s.actionError = a.payload; })
      // updateTeamMember
      .addCase(updateTeamMember.fulfilled, (s, a) => {
        if (s.currentTeam?.id === a.payload.teamId) {
          const m = s.currentTeam.members.find((m) => m.id === a.payload.userId);
          if (m) m.role = a.payload.role;
        }
      })
      // removeTeamMember
      .addCase(removeTeamMember.pending,   (s) => { s.actionLoading = true; s.actionError = null; })
      .addCase(removeTeamMember.fulfilled, (s, a) => {
        s.actionLoading = false;
        if (s.currentTeam?.id === a.payload.teamId) {
          s.currentTeam.members = s.currentTeam.members.filter((m) => m.id !== a.payload.userId);
          s.currentTeam.member_count = Math.max(0, (s.currentTeam.member_count || 1) - 1);
        }
        const t = s.teams.find((t) => t.id === a.payload.teamId);
        if (t) t.member_count = Math.max(0, (t.member_count || 1) - 1);
      })
      .addCase(removeTeamMember.rejected, (s, a) => { s.actionLoading = false; s.actionError = a.payload; });
  },
});
export const { clearActionError, clearCurrentTeam } = teamsSlice.actions;
export const selectTeams         = (state) => state.teams.teams;
export const selectCurrentTeam   = (state) => state.teams.currentTeam;
export const selectTeamsLoading  = (state) => state.teams.loading;
export const selectActionLoading = (state) => state.teams.actionLoading;
export const selectTeamsError    = (state) => state.teams.error;
export const selectActionError   = (state) => state.teams.actionError;
export default teamsSlice.reducer;
