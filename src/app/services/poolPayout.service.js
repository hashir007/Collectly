import api from '../common/api';

const API_URL = 'api/v1/';

// Payout Services
export const PoolPayoutService = {
    // Get all payouts for a pool
    getPoolPayouts: (poolId, params = {}) => {
        return api.get(API_URL + `pools/${poolId}/payouts`, { params });
    },

    // Get payout by ID
    getPayoutById: (payoutId) => {
        return api.get(API_URL + `payouts/${payoutId}`);
    },

    // Create new payout
    createPayout: (poolId, payoutData) => {
        return api.post(API_URL + `pools/${poolId}/payouts`, payoutData);
    },

    // Update payout status
    updatePayoutStatus: (payoutId, statusData) => {
        return api.put(API_URL + `payouts/${payoutId}/status`, statusData);
    },

    // Cancel payout
    cancelPayout: (payoutId, cancelData) => {
        return api.post(API_URL + `payouts/${payoutId}/cancel`, cancelData);
    },

    // Get payout statistics
    getPayoutStats: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/payouts/stats`);
    },

    // Get eligible members for payout
    getEligibleMembers: (poolId) => {
        return api.get(API_URL + `pools/${poolId}/payouts/eligible-members`);
    }
};