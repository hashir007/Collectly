import api from '../common/api';

const API_URL = 'api/v1/';

// Payout Voting Services
export const PoolPayoutVotingService = {
    // Cast a vote on a payout
    castVote: (payoutId, voterId, voteData) => {
        return api.post(API_URL + `payouts/${payoutId}/vote?voterId=` + voterId, voteData);
    },

    // Get voting results
    getVotingResults: (payoutId) => {
        return api.get(API_URL + `payouts/${payoutId}/voting-results`);
    },

    // Get eligible voters for a payout
    getEligibleVoters: (payoutId) => {
        return api.get(API_URL + `payouts/${payoutId}/eligible-voters`);
    },

    // Check if user can vote
    checkVotingStatus: (payoutId) => {
        return api.get(API_URL + `payouts/${payoutId}/voting-status`);
    },

    // Start voting for a payout (admin function)
    startVoting: (payoutId, votingData) => {
        return api.post(API_URL + `payouts/${payoutId}/start-voting`, votingData);
    },

    // Get user's voting history
    getUserVotingHistory: (params = {}) => {
        return api.get(API_URL + `user/voting-history`, { params });
    }
};