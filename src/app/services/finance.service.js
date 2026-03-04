import api from '../common/api';

const API_URL = 'api/v1/finance/';



const getFinalContributionAmount = (userId, amount) => {
    return api.get(API_URL + "final-contribution-amount/" + userId + "/" + amount);
}

const createPaypalOrder = (contributionAmount, discountedContributionAmount, Id, discount, type) => {
    return api.post(API_URL + "create-paypal-order", {
        contributionAmount, discountedContributionAmount, Id, discount, type
    });
}

const capturePaypalOrder = (orderId, Id, userId, type) => {
    return api.post(API_URL + "capture-paypal-order", {
        orderId,
        Id,
        userId,
        type
    });
}

const getTotalPoolPaymentByMonths = () => {
    return api.get(API_URL + "total-pool-payment-by-months");
}

const getTotalPoolPaymentByWeek = () => {
    return api.get(API_URL + "total-pool-payment-by-week");
}

const FinanceServices = {
    getFinalContributionAmount,
    createPaypalOrder,
    capturePaypalOrder,
    getTotalPoolPaymentByMonths,
    getTotalPoolPaymentByWeek
}



export default FinanceServices;