import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import AuthService from "../services/auth.service";


const user = JSON.parse(secureLocalStorage.getItem("user"));


export const register = createAsyncThunk(
    "auth/register",
    async ({ username, email, password, firstName, lastName, date_of_birth, phone, referral }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.register(username, email, password, firstName, lastName, date_of_birth, phone, referral);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async ({ username, password }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.login(username, password);
            secureLocalStorage.setItem("user", JSON.stringify(response.data.response_body));
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return { user: response.data.response_body };
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        await AuthService.logout();
    }
);

export const createForgotPassword = createAsyncThunk(
    "auth/createForgotPassword",
    async ({ email, callbackUrl }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.createForgotPassword(email, callbackUrl);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ token, password }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.resetPassword(token, password);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const createEmailVerificationRequest = createAsyncThunk(
    "auth/createEmailVerificationRequest",
    async ({ userId, callbackUrl }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.createEmailVerificationRequest(userId, callbackUrl);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            thunkAPI.dispatch(setMessage(message));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const verifyEmail = createAsyncThunk(
    "auth/verifyEmail",
    async ({ token }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.verifyEmail(token);
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

export const haveAccountMarkedForDeletion = createAsyncThunk(
    "auth/haveAccountMarkedForDeletion",
    async ({ userId, password, reason }, thunkAPI) => {
        try {
            const response = await AuthService.haveAccountMarkedForDeletion(userId,password, reason);
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage(message));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getNotificationsUnRead = createAsyncThunk(
    "auth/getNotificationsUnRead",
    async ({ userId, page, pageSize }, thunkAPI) => {
        try {
            const response = await AuthService.getNotificationsUnRead(userId, page, pageSize);
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage(message));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const getNotifications = createAsyncThunk(
    "auth/getNotifications",
    async ({ userId, page, pageSize, isRead }, thunkAPI) => {
        try {
            const response = await AuthService.getNotifications(userId, page, pageSize, isRead);
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setMessage(message));
            return thunkAPI.rejectWithValue();
        }
    }
);

export const changeAccountPassword = createAsyncThunk(
    "auth/changeAccountPassword",
    async ({ userId, oldPassword, newPassword }, thunkAPI) => {
        try {
            // Basic parameter check
            if (!userId || !oldPassword || !newPassword) {
                throw new Error("Missing required parameters");
            }

            thunkAPI.dispatch(setProgress(30));

            const response = await AuthService.changeAccountPassword(userId, oldPassword, newPassword);

            thunkAPI.dispatch(setProgress(80));


            const successMessage = response.data.response_message;
            const responseData = response.data.response_body;

            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({
                message: successMessage,
                type: 'success'
            }));

            return responseData || { success: true, userId };

        } catch (error) {
            // Ensure progress is completed even on error
            thunkAPI.dispatch(setProgress(100));

            let errorMessage;

            // Handle structured error response
            if (error.response?.data?.response_message) {
                const serverError = error.response.data.response_message;

                if (typeof serverError === 'object' && serverError.type === 'ValidationError') {
                    // Validation error with structured message
                    errorMessage = serverError.message;
                } else if (typeof serverError === 'string') {
                    // Simple string error message
                    errorMessage = serverError;
                } else {
                    // Fallback for other object types
                    errorMessage = "Validation error occurred";
                }

            } else if (error.response?.data) {
                // Fallback if response data exists but structure is different
                errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : "Password change failed";
            } else if (error.message) {
                // Network errors or other client-side errors
                errorMessage = error.message;
            } else {
                errorMessage = "Password change failed. Please try again.";
            }

            thunkAPI.dispatch(setMessage({
                message: errorMessage,
                type: 'error'
            }));

            // Return meaningful error payload
            return thunkAPI.rejectWithValue({
                message: errorMessage,
                status: error.response?.status,
                responseCode: error.response?.data?.response_code,
                serverError: error.response?.data?.response_message,
                userId: userId
            });
        }
    }
);

export const notificationsMarkRead = createAsyncThunk(
    "auth/notificationsMarkRead",
    async ({ userId, notificationId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.notificationsMarkRead(userId, notificationId);
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

export const notificationDelete = createAsyncThunk(
    "auth/notificationDelete",
    async ({ userId, notificationId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.notificationDelete(userId, notificationId);
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

export const downloadPersonalData = createAsyncThunk(
    "auth/downloadPersonalData",
    async ({ userId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await AuthService.downloadPersonalData(userId);
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
    user: user,
    isLoggedIn: !!user,
    loading: false,
    accountDeleteRequests: [],
    notificationUnread: {},
    notification: {}
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoggedIn = false;
                state.loading = false;
            })
            .addCase(login.pending, (state, action) => {
                state.isLoggedIn = false;
                state.user = null;
                state.loading = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoggedIn = false;
                state.user = null;
                state.loading = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = true;
                state.user = action.payload.user;
                state.loading = false;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.isLoggedIn = false;
                state.user = null;
            })
            .addCase(createEmailVerificationRequest.fulfilled, (state, action) => {

            })
            .addCase(createEmailVerificationRequest.rejected, (state, action) => {

            })
            .addCase(haveAccountMarkedForDeletion.fulfilled, (state, action) => {
                state.accountDeleteRequests = action.payload
            })
            .addCase(haveAccountMarkedForDeletion.rejected, (state, action) => {

            })
            .addCase(getNotificationsUnRead.fulfilled, (state, action) => {
                state.notificationUnread = action.payload;
            })
            .addCase(getNotificationsUnRead.rejected, (state, action) => {

            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.notification = action.payload;
            })
            .addCase(getNotifications.rejected, (state, action) => {

            })
            .addCase(resetPassword.fulfilled, (state, action) => {

            })
            .addCase(resetPassword.rejected, (state, action) => {

            })
            .addCase(notificationsMarkRead.fulfilled, (state, action) => {

            })
            .addCase(notificationsMarkRead.rejected, (state, action) => {

            })
            .addCase(notificationDelete.fulfilled, (state, action) => {

            })
            .addCase(notificationDelete.rejected, (state, action) => {

            })
            .addCase(downloadPersonalData.fulfilled, (state, action) => {

            })
            .addCase(downloadPersonalData.rejected, (state, action) => {

            })
            .addCase(verifyEmail.fulfilled, (state, action) => {

            })
            .addCase(verifyEmail.rejected, (state, action) => {

            })
    }
});


const { reducer } = authSlice;

export default reducer;