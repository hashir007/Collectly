import api from '../common/api';

const API_URL = 'api/v1/subscription/';

const createSubscription = (data) => {
    return api.post(API_URL + "create", data);
}

const captureSubscription = (data) => {
    return api.post(API_URL + "capture", data);
}

const getSubscriptionDetails = (subscriptionId) => {
    return api.get(API_URL + "details/" + subscriptionId);
}

const cancelSubscription = (data) => {
    return api.post(API_URL + "cancel", data);
}

const getCurrentSubscription = () => {
    return api.get(API_URL + "current");
}

const getUserSubscriptions = (params = {}) => {
    return api.get(API_URL + "user", { params });
}

const SubscriptionService = {
    createSubscription,
    captureSubscription,
    getSubscriptionDetails,
    cancelSubscription,
    getCurrentSubscription,
    getUserSubscriptions
}

export default SubscriptionService;