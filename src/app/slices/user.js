import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import UserService from "../services/user.service";


const user = JSON.parse(secureLocalStorage.getItem("user"));


export const getAccount = createAsyncThunk(
    "user/getAccount",
    async ({ userId }, thunkAPI) => {
        try {
            const response = await UserService.getAccount(userId);
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const updateProfile = createAsyncThunk(
    "user/updateProfile",
    async ({ userId, firstName, lastName, dateOfBirth, phone }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.updateProfile(userId, firstName, lastName, dateOfBirth, phone);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getPayoutDetails = createAsyncThunk(
    "user/getPayoutDetails",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getPayoutDetails(userId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const updatePayoutDetails = createAsyncThunk(
    "user/updatePayoutDetails",
    async ({ userId, payoutEmailAddress, payoutPayerID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.updatePayoutDetails(userId, payoutEmailAddress, payoutPayerID);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getAllContributionByUserId = createAsyncThunk(
    "user/getAllContributionByUserId",
    async ({ userId, page, pageSize }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getAllContributionByUserId(userId, page, pageSize);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getSubscriptionHistory = createAsyncThunk(
    "user/getSubscriptionHistory",
    async ({ userId, page, pageSize }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getSubscriptionHistory(userId, page, pageSize);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getSubscriptionsPayments = createAsyncThunk(
    "user/getSubscriptionsPayments",
    async ({ userId, page, pageSize }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getSubscriptionsPayments(userId, page, pageSize);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getSubscription = createAsyncThunk(
    "user/getSubscription",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getSubscription(userId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getSubscriptionPlans = createAsyncThunk(
    "user/getSubscriptionPlans",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getSubscriptionPlans(userId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getSocialMediaByUserId = createAsyncThunk(
    "user/getSocialMediaByUserId",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getSocialMediaByUserId(userId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const addOrUpdateSocialMediaLinks = createAsyncThunk(
    "user/addOrUpdateSocialMediaLinks",
    async ({ userId, social }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.addOrUpdateSocialMediaLinks(userId, social);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getUserSettings = createAsyncThunk(
    "user/getUserSettings",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getUserSettings(userId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const updateUserSettings = createAsyncThunk(
    "user/updateUserSettings",
    async ({ userId, settings }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.updateUserSettings(userId, settings);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getMyApps = createAsyncThunk(
    "user/getMyApps",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getMyApps(userId);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const createApp = createAsyncThunk(
    "user/createApp",
    async ({ userId, name }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.createApp(userId, name);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);


export const getUserReferrals = createAsyncThunk(
    "user/getUserReferrals",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getUserReferrals(userId);
            thunkAPI.dispatch(setProgress(100));

            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);


export const getIdentityVerificationStatus = createAsyncThunk(
    "user/getIdentityVerificationStatus",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.getIdentityVerificationStatus(userId);
            thunkAPI.dispatch(setProgress(100));

            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);


export const uploadProfileImage = createAsyncThunk(
    "user/uploadProfileImage",
    async ({ userId, removePhoto, file }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.uploadProfileImage(userId, removePhoto, file);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const contactUs = createAsyncThunk(
    "user/contactUs",
    async ({ firstName, lastName, email, message }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await UserService.contactUs(firstName, lastName, email, message);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue();
        }
    }
);


const initialState = {
    me: {},
    payout: {},
    contributions: {},
    subscription: {},
    subscriptionHistory: {},
    subscriptionsPayments: {},
    subscriptionPlans: [],
    socialMedia: {},
    settings: {},
    apps: {},
    referrals: {},
    identityVerificationStatus: {}
};


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAccount.fulfilled, (state, action) => {
                state.me = action.payload.Account;
            })
            .addCase(getAccount.rejected, (state, action) => {
                state.me = {};
            })
            .addCase(updateProfile.fulfilled, (state, action) => {

            })
            .addCase(updateProfile.rejected, (state, action) => {

            })
            .addCase(getPayoutDetails.fulfilled, (state, action) => {
                state.payout = action.payload.Payout;
            })
            .addCase(getPayoutDetails.rejected, (state, action) => {
                state.payout = {}
            })
            .addCase(updatePayoutDetails.fulfilled, (state, action) => {

            })
            .addCase(updatePayoutDetails.rejected, (state, action) => {

            })
            .addCase(getAllContributionByUserId.fulfilled, (state, action) => {
                state.contributions = action.payload.Contributions;
            })
            .addCase(getAllContributionByUserId.rejected, (state, action) => {

            })
            .addCase(getSubscription.fulfilled, (state, action) => {
                state.subscription = action.payload.Subscription;
            })
            .addCase(getSubscription.rejected, (state, action) => {

            })
            .addCase(getSubscriptionsPayments.fulfilled, (state, action) => {
                state.subscriptionsPayments = action.payload.SubscriptionPayment;
            })
            .addCase(getSubscriptionsPayments.rejected, (state, action) => {

            })
            .addCase(getSubscriptionHistory.fulfilled, (state, action) => {
                state.subscriptionHistory = action.payload.SubscriptionHistory;
            })
            .addCase(getSubscriptionHistory.rejected, (state, action) => {

            })
            .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
                state.subscriptionPlans = action.payload.Plans;
            })
            .addCase(getSubscriptionPlans.rejected, (state, action) => {

            })
            .addCase(getSocialMediaByUserId.fulfilled, (state, action) => {
                state.socialMedia = action.payload.SocialMediaLinks;
            })
            .addCase(getSocialMediaByUserId.rejected, (state, action) => {

            })
            .addCase(addOrUpdateSocialMediaLinks.fulfilled, (state, action) => {
                state.socialMedia = action.payload.SocialMediaLinks;
            })
            .addCase(addOrUpdateSocialMediaLinks.rejected, (state, action) => {

            })
            .addCase(getUserSettings.fulfilled, (state, action) => {
                state.settings = action.payload.Settings;
            })
            .addCase(getUserSettings.rejected, (state, action) => {

            })
            .addCase(updateUserSettings.fulfilled, (state, action) => {
                state.settings = action.payload.Settings;
            })
            .addCase(updateUserSettings.rejected, (state, action) => {

            })
            .addCase(getMyApps.fulfilled, (state, action) => {
                state.apps = action.payload.Apps;
            })
            .addCase(getMyApps.rejected, (state, action) => {

            })
            .addCase(createApp.fulfilled, (state, action) => {
                state.apps = action.payload.Apps;
            })
            .addCase(createApp.rejected, (state, action) => {

            })
            .addCase(getUserReferrals.fulfilled, (state, action) => {
                state.referrals = action.payload.Referrals;
            })
            .addCase(getUserReferrals.rejected, (state, action) => {

            })
            .addCase(getIdentityVerificationStatus.fulfilled, (state, action) => {
                state.identityVerificationStatus = action.payload.IdentityVerificationStatus;
            })
            .addCase(getIdentityVerificationStatus.rejected, (state, action) => {

            })
            .addCase(uploadProfileImage.fulfilled, (state, action) => {

            })
            .addCase(uploadProfileImage.rejected, (state, action) => {

            })
            .addCase(contactUs.fulfilled, (state, action) => {

            })
            .addCase(contactUs.rejected, (state, action) => {

            })
    }
});


const { reducer } = userSlice;
export const {

} = userSlice.actions
export default reducer;