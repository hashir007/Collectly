// slices/subscription.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SubscriptionService from '../services/subscription.service';

export const createPaypalSubscription = createAsyncThunk(
    'subscription/createPaypalSubscription',
    async ({ planId, subscriptionAmount, finalAmount, discount, userId, type }, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.createSubscription({
                planId,
                subscriptionAmount,
                finalAmount,
                discount,
                type
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const capturePaypalSubscription = createAsyncThunk(
    'subscription/capturePaypalSubscription',
    async ({ subscriptionId, planId, userId, type }, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.captureSubscription({
                subscriptionId,
                planId,
                type
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getSubscriptionDetailsAction = createAsyncThunk(
    'subscription/getDetails',
    async (subscriptionId, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.getSubscriptionDetails(subscriptionId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const cancelSubscriptionAction = createAsyncThunk(
    'subscription/cancel',
    async ({ subscriptionId, reason }, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.cancelSubscription({
                subscriptionId,
                reason
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getCurrentSubscriptionAction = createAsyncThunk(
    'subscription/getCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.getCurrentSubscription();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUserSubscriptionsAction = createAsyncThunk(
    'subscription/getUserSubscriptions',
    async ({ page, limit } = {}, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.getUserSubscriptions({ page, limit });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState: {
        subscriptionScheme: null,
        subscriptionPlans: [],
        currentSubscription: null,
        userSubscriptions: [],
        loading: false,
        error: null,
        approvalUrl: null,
        subscriptionId: null
    },
    reducers: {
        clearSubscriptionError: (state) => {
            state.error = null;
        },
        setSubscriptionPlans: (state, action) => {
            state.subscriptionPlans = action.payload;
        },
        clearSubscriptionData: (state) => {
            state.approvalUrl = null;
            state.subscriptionId = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create PayPal Subscription
            .addCase(createPaypalSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaypalSubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.subscriptionId = action.payload.subscriptionId;
                state.approvalUrl = action.payload.approvalUrl;
                state.currentSubscription = action.payload.subscription;
            })
            .addCase(createPaypalSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Capture PayPal Subscription
            .addCase(capturePaypalSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(capturePaypalSubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSubscription = action.payload;
            })
            .addCase(capturePaypalSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Current Subscription
            .addCase(getCurrentSubscriptionAction.fulfilled, (state, action) => {
                state.currentSubscription = action.payload;
            })
            // Get User Subscriptions
            .addCase(getUserSubscriptionsAction.fulfilled, (state, action) => {
                state.userSubscriptions = action.payload.subscriptions;
            });
    }
});

const { reducer } = subscriptionSlice;
export const {
    clearSubscriptionError, setSubscriptionPlans, clearSubscriptionData
} = subscriptionSlice.actions
export default reducer;