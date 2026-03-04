import api from '../common/api';

const API_URL = 'api/v1/user/';




const getAccount = (userId) => {
    return api.get(API_URL + userId + "/me");
}

const updateProfile = (userId, firstName, lastName, dateOfBirth, phone) => {
    return api.put(API_URL + userId + "/profile-update", { firstName, lastName, dateOfBirth, phone });
}

const getPayoutDetails = (userId) => {
    return api.get(API_URL + userId + "/payout");
}

const updatePayoutDetails = (userId, payoutEmailAddress, payoutPayerID) => {
    return api.put(API_URL + userId + "/payout-update", { payoutEmailAddress, payoutPayerID });
}

const getAllContributionByUserId = (userId, page, pageSize) => {
    return api.get(API_URL + userId + "/contributions/" + page + "/" + pageSize);
}

const getSubscriptionHistory = (userId, page, pageSize) => {
    return api.get(API_URL + userId + "/subscription-history/" + page + "/" + pageSize);
}

const getSubscriptionsPayments = (userId, page, pageSize) => {
    return api.get(API_URL + userId + "/subscription-payments/" + page + "/" + pageSize);
}

const getSubscription = (userId) => {
    return api.get(API_URL + userId + "/subscription");
}

const getSubscriptionPlans = (userId) => {
    return api.get(API_URL + userId + "/subscription-plans");
}

const getSocialMediaByUserId = (userId) => {
    return api.get(API_URL + userId + "/social-media-links");
}

const addOrUpdateSocialMediaLinks = (userId, social) => {
    return api.post(API_URL + userId + "/social-media-links", { social });
}

const getUserSettings = (userId) => {
    return api.get(API_URL + userId + "/settings");
}

const updateUserSettings = (userId, settings) => {
    return api.post(API_URL + userId + "/settings", { settings });
}

const getMyApps = (userId) => {
    return api.get(API_URL + userId + "/apps");
}

const createApp = (userId, name) => {
    return api.post(API_URL + userId + "/apps", { name });
}

const getUserReferrals = (userId) => {
    return api.get(API_URL + userId + "/referrals");
}

const getIdentityVerificationStatus = (userId) => {
    return api.get(API_URL + userId + "/identity-verification-status");
}

const uploadProfileImage = (userId, removePhoto, file) => {
    const data = new FormData();
    data.append(`file`, file);

    if (removePhoto) {
        data.append('removePhoto', 'true');
    }

    return api.post(API_URL + userId + '/media-upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

const contactUs = (firstName, lastName, email, message) => {
    return api.post(API_URL + "contact-us", { firstName, lastName, email, message });
}



const UserService = {
    getAccount,
    updateProfile,
    getPayoutDetails,
    updatePayoutDetails,
    getAllContributionByUserId,
    getSubscriptionHistory,
    getSubscriptionsPayments,
    getSubscription,
    getSubscriptionPlans,
    getSocialMediaByUserId,
    addOrUpdateSocialMediaLinks,
    getUserSettings,
    updateUserSettings,
    getMyApps,
    createApp,
    getUserReferrals,
    getIdentityVerificationStatus,
    uploadProfileImage,
    contactUs
}

export default UserService;