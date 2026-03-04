import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import messageReducer from './slices/message';
import loaderReducer from './slices/loader';
import generalReducer from './slices/general';
import poolReducer from './slices/pool';
import userReducer from './slices/user';
import financeReducer from './slices/finance';
import subscriptionReducer from './slices/subscription';
import poolPayoutReducer from './slices/poolPayout';
import poolPayoutVotingReducer from './slices/poolPayoutVoting';
import poolVotingSettingsReducer from './slices/poolVotingSettings';
import poolPayoutSettingsReducer from './slices/poolPayoutSettings';


const reducer = {
    auth: authReducer,
    message: messageReducer,
    loader: loaderReducer,
    general: generalReducer,
    pool: poolReducer,
    user: userReducer,
    finance: financeReducer,
    subscription: subscriptionReducer,
    poolPayout: poolPayoutReducer,
    poolPayoutVoting: poolPayoutVotingReducer,
    poolVotingSettings: poolVotingSettingsReducer,
    poolPayoutSettings: poolPayoutSettingsReducer
};

export const store = configureStore({
    reducer: reducer,
    devTools: true
});

