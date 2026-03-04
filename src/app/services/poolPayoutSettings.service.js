import api from '../common/api';

const API_URL = 'api/v1/';

// Payout Settings Services
export const PoolPayoutSettingsService = {
    // Get payout settings for a pool
    getPayoutSettings: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/payout-settings`);
    },

    // Update payout settings
    updatePayoutSettings: (poolId, settingsData) => {
        return api.put(API_URL + `pools/${poolId}/payout-settings`, settingsData);
    },

    // Validate payout amount against settings
    validatePayoutAmount: (poolId, amount) => {
        return api.post(API_URL + `pools/${poolId}/payout-settings/validate-amount`, { amount });
    },

    // Check daily payout limit
    checkDailyPayoutLimit: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/payout-settings/daily-limit`);
    },

    // Get payout settings analytics
    getPayoutSettingsAnalytics: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/payout-settings/analytics`);
    }
};