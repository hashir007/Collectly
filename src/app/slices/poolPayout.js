import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import { PoolPayoutService } from "../services/poolPayout.service";

// Async thunks
export const getPoolPayouts = createAsyncThunk(
    "poolPayout/getPoolPayouts",
    async ({ poolId, params = {} }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.getPoolPayouts(poolId, params);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getPayoutById = createAsyncThunk(
    "poolPayout/getPayoutById",
    async ({ payoutId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.getPayoutById(payoutId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const createPayout = createAsyncThunk(
    "poolPayout/createPayout",
    async ({ poolId, payoutData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.createPayout(poolId, payoutData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Payout created successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const updatePayoutStatus = createAsyncThunk(
    "poolPayout/updatePayoutStatus",
    async ({ payoutId, statusData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.updatePayoutStatus(payoutId, statusData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Payout status updated successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const cancelPayout = createAsyncThunk(
    "poolPayout/cancelPayout",
    async ({ payoutId, cancelData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.cancelPayout(payoutId, cancelData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Payout cancelled successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getPayoutStats = createAsyncThunk(
    "poolPayout/getPayoutStats",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.getPayoutStats(poolId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getEligibleMembers = createAsyncThunk(
    "poolPayout/getEligibleMembers",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutService.getEligibleMembers(poolId);
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
    poolPayouts: [],
    payoutSelected: null,
    payoutStats: null,
    eligibleMembers: [],
    loading: false,
    success: false,
    pagination: {}
};

const poolPayoutSlice = createSlice({
    name: "poolPayout",
    initialState,
    reducers: {
        clearPayouts: (state) => {
            state.poolPayouts = [];
            state.pagination = {};
        },
        clearSelectedPayout: (state) => {
            state.payoutSelected = null;
        },
        clearPayoutStats: (state) => {
            state.payoutStats = null;
        },
        clearEligibleMembers: (state) => {
            state.eligibleMembers = [];
        },
        resetPayoutState: (state) => {
            state.poolPayouts = [];
            state.payoutSelected = null;
            state.payoutStats = null;
            state.eligibleMembers = [];
            state.loading = false;
            state.success = false;
            state.pagination = {};
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Pool Payouts
            .addCase(getPoolPayouts.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getPoolPayouts.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.poolPayouts = action.payload.payouts;
                state.pagination = action.payload.pagination;
            })
            .addCase(getPoolPayouts.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Payout By ID
            .addCase(getPayoutById.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getPayoutById.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.payoutSelected = action.payload.payout;
            })
            .addCase(getPayoutById.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Create Payout
            .addCase(createPayout.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(createPayout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Add new payout to the beginning of the list
                state.poolPayouts.unshift(action.payload.payout);
            })
            .addCase(createPayout.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Update Payout Status
            .addCase(updatePayoutStatus.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(updatePayoutStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update payout in the list
                const index = state.poolPayouts.findIndex(p => p.id === action.payload.payout.id);
                if (index !== -1) {
                    state.poolPayouts[index] = action.payload.payout;
                }
                // Update selected payout if it's the same
                if (state.payoutSelected && state.payoutSelected.id === action.payload.payout.id) {
                    state.payoutSelected = action.payload.payout;
                }
            })
            .addCase(updatePayoutStatus.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Cancel Payout
            .addCase(cancelPayout.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(cancelPayout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update payout in the list
                const index = state.poolPayouts.findIndex(p => p.id === action.payload.payout.id);
                if (index !== -1) {
                    state.poolPayouts[index] = action.payload.payout;
                }
                // Update selected payout if it's the same
                if (state.payoutSelected && state.payoutSelected.id === action.payload.payout.id) {
                    state.payoutSelected = action.payload.payout;
                }
            })
            .addCase(cancelPayout.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Payout Stats
            .addCase(getPayoutStats.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getPayoutStats.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.payoutStats = action.payload.stats;
            })
            .addCase(getPayoutStats.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Eligible Members
            .addCase(getEligibleMembers.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getEligibleMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.eligibleMembers = action.payload.members;
            })
            .addCase(getEligibleMembers.rejected, (state) => {
                state.loading = false;
                state.success = false;
            });
    }
});

const { reducer } = poolPayoutSlice;
export const {
    clearPayouts,
    clearSelectedPayout,
    clearPayoutStats,
    clearEligibleMembers,
    resetPayoutState
} = poolPayoutSlice.actions
export default reducer;