import api from '../common/api';

const API_URL = 'api/v1/';

// Voting Settings Services
export const PoolVotingSettingsService = {
    // Get voting settings for a pool
    getVotingSettings: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/voting-settings`);
    },

    // Update voting settings
    updateVotingSettings: (poolId, settingsData) => {
        return api.put(API_URL + `pools/${poolId}/voting-settings`, settingsData);
    },

    // Enable/disable voting for a pool
    toggleVoting: (poolId, toggleData) => {
        return api.post(API_URL + `pools/${poolId}/voting-settings/toggle`, toggleData);
    },

    // Get voting analytics for a pool
    getVotingAnalytics: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/voting-analytics`);
    }
};