import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import { PoolVotingSettingsService } from "../services/poolVotingSettings.service";

// Async thunks
export const getVotingSettings = createAsyncThunk(
    "poolVotingSettings/getVotingSettings",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolVotingSettingsService.getVotingSettings(poolId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const updateVotingSettings = createAsyncThunk(
    "poolVotingSettings/updateVotingSettings",
    async ({ poolId, settingsData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolVotingSettingsService.updateVotingSettings(poolId, settingsData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Voting settings updated successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const toggleVoting = createAsyncThunk(
    "poolVotingSettings/toggleVoting",
    async ({ poolId, toggleData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolVotingSettingsService.toggleVoting(poolId, toggleData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({
                message: `Voting ${toggleData.enabled ? 'enabled' : 'disabled'} successfully`,
                type: 'success'
            }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getVotingAnalytics = createAsyncThunk(
    "poolVotingSettings/getVotingAnalytics",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolVotingSettingsService.getVotingAnalytics(poolId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

const initialState = {
    votingSettings: null,
    votingAnalytics: null,
    loading: false,
    success: false
};

const poolVotingSettingsSlice = createSlice({
    name: "poolVotingSettings",
    initialState,
    reducers: {
        clearVotingSettings: (state) => {
            state.votingSettings = null;
        },
        clearVotingAnalytics: (state) => {
            state.votingAnalytics = null;
        },
        resetVotingSettingsState: (state) => {
            state.votingSettings = null;
            state.votingAnalytics = null;
            state.loading = false;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Voting Settings
            .addCase(getVotingSettings.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getVotingSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingSettings = action.payload.votingSettings;
            })
            .addCase(getVotingSettings.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Update Voting Settings
            .addCase(updateVotingSettings.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(updateVotingSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingSettings = action.payload.votingSettings;
            })
            .addCase(updateVotingSettings.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Toggle Voting
            .addCase(toggleVoting.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(toggleVoting.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingSettings = action.payload.votingSettings;
            })
            .addCase(toggleVoting.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Voting Analytics
            .addCase(getVotingAnalytics.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getVotingAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingAnalytics = action.payload.analytics;
            })
            .addCase(getVotingAnalytics.rejected, (state) => {
                state.loading = false;
                state.success = false;
            });
    }
});


const { reducer } = poolVotingSettingsSlice;
export const {
    clearVotingSettings,
    clearVotingAnalytics,
    resetVotingSettingsState
} = poolVotingSettingsSlice.actions
export default reducer;