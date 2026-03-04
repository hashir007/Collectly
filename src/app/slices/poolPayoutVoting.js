import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import { PoolPayoutVotingService } from "../services/poolPayoutVoting.service";

// Async thunks
export const castVote = createAsyncThunk(
    "poolPayoutVoting/castVote",
    async ({ payoutId, voterId, voteData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutVotingService.castVote(payoutId, voterId, voteData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Vote cast successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getVotingResults = createAsyncThunk(
    "poolPayoutVoting/getVotingResults",
    async ({ payoutId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutVotingService.getVotingResults(payoutId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getEligibleVoters = createAsyncThunk(
    "poolPayoutVoting/getEligibleVoters",
    async ({ payoutId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutVotingService.getEligibleVoters(payoutId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const canUserVote = createAsyncThunk(
    "poolPayoutVoting/canUserVote",
    async ({ payoutId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutVotingService.checkVotingStatus(payoutId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const startVoting = createAsyncThunk(
    "poolPayoutVoting/startVoting",
    async ({ payoutId, votingData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutVotingService.startVoting(payoutId, votingData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Voting started successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getUserVotingHistory = createAsyncThunk(
    "poolPayoutVoting/getUserVotingHistory",
    async ({ params = {} }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutVotingService.getUserVotingHistory(params);
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
    votingResults: { votes: [] },
    eligibleVoters: [],
    votingStatus: null,
    votingHistory: [],
    loading: false,
    success: false,
    votingHistoryPagination: {}
};

const poolPayoutVotingSlice = createSlice({
    name: "poolPayoutVoting",
    initialState,
    reducers: {
        clearVotingResults: (state) => {
            state.votingResults = null;
        },
        clearEligibleVoters: (state) => {
            state.eligibleVoters = [];
        },
        clearVotingStatus: (state) => {
            state.votingStatus = null;
        },
        clearVotingHistory: (state) => {
            state.votingHistory = [];
            state.votingHistoryPagination = {};
        },
        resetVotingState: (state) => {
            state.votingResults = null;
            state.eligibleVoters = [];
            state.votingStatus = null;
            state.votingHistory = [];
            state.loading = false;
            state.success = false;
            state.votingHistoryPagination = {};
        }
    },
    extraReducers: (builder) => {
        builder
            // Cast Vote
            .addCase(castVote.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(castVote.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(castVote.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Voting Results
            .addCase(getVotingResults.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getVotingResults.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingResults = action.payload.votingResults;
            })
            .addCase(getVotingResults.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Eligible Voters
            .addCase(getEligibleVoters.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getEligibleVoters.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.eligibleVoters = action.payload.voters;
            })
            .addCase(getEligibleVoters.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Check Voting Status
            .addCase(canUserVote.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(canUserVote.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingStatus = action.payload.votingStatus;
            })
            .addCase(canUserVote.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Start Voting
            .addCase(startVoting.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(startVoting.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(startVoting.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get User Voting History
            .addCase(getUserVotingHistory.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getUserVotingHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.votingHistory = action.payload.votes || [];
                state.votingHistoryPagination = action.payload.pagination || {};
            })
            .addCase(getUserVotingHistory.rejected, (state) => {
                state.loading = false;
                state.success = false;
            });
    }
});


const { reducer } = poolPayoutVotingSlice;
export const {
    clearVotingResults,
    clearEligibleVoters,
    clearVotingStatus,
    clearVotingHistory,
    resetVotingState
} = poolPayoutVotingSlice.actions
export default reducer;