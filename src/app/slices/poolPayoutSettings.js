import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import { PoolPayoutSettingsService } from "../services/poolPayoutSettings.service";

// Async thunks
export const getPayoutSettings = createAsyncThunk(
    "poolPayoutSettings/getPayoutSettings",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutSettingsService.getPayoutSettings(poolId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const updatePayoutSettings = createAsyncThunk(
    "poolPayoutSettings/updatePayoutSettings",
    async ({ poolId, settingsData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutSettingsService.updatePayoutSettings(poolId, settingsData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: "Payout settings updated successfully", type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const validatePayoutAmount = createAsyncThunk(
    "poolPayoutSettings/validatePayoutAmount",
    async ({ poolId, amount }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutSettingsService.validatePayoutAmount(poolId, amount);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const checkDailyPayoutLimit = createAsyncThunk(
    "poolPayoutSettings/checkDailyPayoutLimit",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutSettingsService.checkDailyPayoutLimit(poolId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getPayoutSettingsAnalytics = createAsyncThunk(
    "poolPayoutSettings/getPayoutSettingsAnalytics",
    async ({ poolId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolPayoutSettingsService.getPayoutSettingsAnalytics(poolId);
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
    payoutSettings: null,
    amountValidation: null,
    dailyLimit: null,
    payoutAnalytics: null,
    loading: false,
    success: false
};

const poolPayoutSettingsSlice = createSlice({
    name: "poolPayoutSettings",
    initialState,
    reducers: {
        clearPayoutSettings: (state) => {
            state.payoutSettings = null;
        },
        clearAmountValidation: (state) => {
            state.amountValidation = null;
        },
        clearDailyLimit: (state) => {
            state.dailyLimit = null;
        },
        clearPayoutAnalytics: (state) => {
            state.payoutAnalytics = null;
        },
        resetPayoutSettingsState: (state) => {
            state.payoutSettings = null;
            state.amountValidation = null;
            state.dailyLimit = null;
            state.payoutAnalytics = null;
            state.loading = false;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Payout Settings
            .addCase(getPayoutSettings.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getPayoutSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.payoutSettings = action.payload.payoutSettings;
            })
            .addCase(getPayoutSettings.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Update Payout Settings
            .addCase(updatePayoutSettings.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(updatePayoutSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.payoutSettings = action.payload.payoutSettings;
            })
            .addCase(updatePayoutSettings.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Validate Payout Amount
            .addCase(validatePayoutAmount.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(validatePayoutAmount.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.amountValidation = action.payload.validation;
            })
            .addCase(validatePayoutAmount.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Check Daily Payout Limit
            .addCase(checkDailyPayoutLimit.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(checkDailyPayoutLimit.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.dailyLimit = action.payload.dailyLimit;
            })
            .addCase(checkDailyPayoutLimit.rejected, (state) => {
                state.loading = false;
                state.success = false;
            })
            // Get Payout Settings Analytics
            .addCase(getPayoutSettingsAnalytics.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(getPayoutSettingsAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.payoutAnalytics = action.payload.analytics;
            })
            .addCase(getPayoutSettingsAnalytics.rejected, (state) => {
                state.loading = false;
                state.success = false;
            });
    }
});


const { reducer } = poolPayoutSettingsSlice;
export const {
    clearPayoutSettings,
    clearAmountValidation,
    clearDailyLimit,
    clearPayoutAnalytics,
    resetPayoutSettingsState
} = poolPayoutSettingsSlice.actions
export default reducer;


