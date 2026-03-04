import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import FinanceService from "../services/finance.service";

const user = JSON.parse(secureLocalStorage.getItem("user"));



export const getFinalContributionAmount = createAsyncThunk(
    "finance/getFinalContributionAmount",
    async ({ userId, amount }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await FinanceService.getFinalContributionAmount(userId, amount);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const createPaypalOrder = createAsyncThunk(
    "finance/createPaypalOrder",
    async ({ contributionAmount, discountedContributionAmount, Id, discount, type }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await FinanceService.createPaypalOrder(contributionAmount, discountedContributionAmount, Id, discount, type);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const capturePaypalOrder = createAsyncThunk(
    "finance/capturePaypalOrder",
    async ({ orderId, Id, userId, type }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await FinanceService.capturePaypalOrder(orderId, Id, userId, type);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getTotalPoolPaymentByMonths = createAsyncThunk(
    "finance/getTotalPoolPaymentByMonths",
    async ({ }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await FinanceService.getTotalPoolPaymentByMonths();
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getTotalPoolPaymentByWeek = createAsyncThunk(
    "finance/getTotalPoolPaymentByWeek",
    async ({ }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await FinanceService.getTotalPoolPaymentByWeek();
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    contributionScheme: {},
    order: {},
    monthChart: [],
    monthChartTicks: [],
    weekChart: [],
    weekChartTicks: []
};

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {
        // You can add any synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFinalContributionAmount.fulfilled, (state, action) => {
                state.contributionScheme = action.payload.ContributionAmount;
            })
            .addCase(getFinalContributionAmount.rejected, (state, action) => {
                state.contributionScheme = {};
            })
            .addCase(createPaypalOrder.fulfilled, (state, action) => {
                state.order = action.payload;
            })
            .addCase(createPaypalOrder.rejected, (state, action) => {
                state.order = {};
            })
            .addCase(capturePaypalOrder.fulfilled, (state, action) => {
                // Handle successful payment capture if needed
            })
            .addCase(capturePaypalOrder.rejected, (state, action) => {
                // Handle payment capture failure if needed
            })
            .addCase(getTotalPoolPaymentByMonths.fulfilled, (state, action) => {
                const monthChartData = action.payload.Contribution || [];

                // Update month chart data
                state.monthChart = [["Month", "Contributed"], ...monthChartData];

                // Calculate ticks for month chart
                const maxMonthTicksValue = Math.max(...monthChartData.map(x => x[1]), 0);
                state.monthChartTicks = calculateTicks(maxMonthTicksValue);
            })
            .addCase(getTotalPoolPaymentByMonths.rejected, (state, action) => {
                // Reset month chart data on error
                state.monthChart = [["Month", "Contributed"]];
                state.monthChartTicks = [0, 10, 20, 30];
            })
            .addCase(getTotalPoolPaymentByWeek.fulfilled, (state, action) => {
                const weekChartData = action.payload.Contribution || [];

                // Update week chart data
                state.weekChart = [["Week", "Previous", "Current"], ...weekChartData];

                // Calculate ticks for week chart
                // Get max value from both previous and current week data
                const maxPrevious = Math.max(...weekChartData.map(x => x[1]), 0);
                const maxCurrent = Math.max(...weekChartData.map(x => x[2]), 0);
                const maxWeekTicksValue = Math.max(maxPrevious, maxCurrent);

                state.weekChartTicks = calculateTicks(maxWeekTicksValue);
            })
            .addCase(getTotalPoolPaymentByWeek.rejected, (state, action) => {
                // Reset week chart data on error
                state.weekChart = [["Week", "Previous", "Current"]];
                state.weekChartTicks = [0, 10, 20, 30];
            });
    }
});

// Helper function to calculate chart ticks
const calculateTicks = (maxValue) => {
    if (maxValue === 0) {
        return [0, 10, 20, 30];
    }

    const ticks = [];
    const step = maxValue <= 50 ? 5 : Math.ceil(maxValue / 10);

    for (let i = 0; i <= maxValue + step; i += step) {
        ticks.push(i);
    }

    return ticks;
};


const { reducer } = financeSlice;
export const {

} = financeSlice.actions
export default reducer;