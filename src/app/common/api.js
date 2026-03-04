import axios from 'axios';
import EventBus from "./eventBus";
import secureLocalStorage from "react-secure-storage";


const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});


api.interceptors.request.use(
    (config) => {
        if (secureLocalStorage.getItem("user")) {
            const token = `${JSON.parse(secureLocalStorage.getItem("user")).token}`;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);


async function refreshAccessToken() {
    const refreshToken = `${JSON.parse(secureLocalStorage.getItem("user")).refreshToken}`;
    const response = await axios.post(process.env.REACT_APP_API_URL + '/api/v1/auth/' + 'refresh-token', { refreshToken });
    secureLocalStorage.setItem("user", JSON.stringify(response.data.response_body));
    return response.data.response_body.token;
}

// Create a list to hold the request queue
const refreshAndRetryQueue = [];

// Flag to prevent multiple token refresh requests
let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401)) {
            if (!isRefreshing) {

                isRefreshing = true;
                try {
                    // Refresh the access token
                    const newAccessToken = await refreshAccessToken();

                    // Update the request headers with the new access token
                    error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // Retry all requests in the queue with the new token
                    await refreshAndRetryQueue.forEach(async ({ config, resolve, reject }) => {
                        await api
                            .request(config)
                            .then((response) => resolve(response))
                            .catch((err) => reject(err));
                    });

                    // Clear the queue
                    refreshAndRetryQueue.length = 0;

                    // Retry the original request
                    return api(originalRequest);
                } catch (refreshError) {
                    console.log(refreshError);
                    secureLocalStorage.removeItem("user");
                    window.location = "/login";
                } finally {
                    isRefreshing = false;
                }
            }

            // Add the original request to the queue
            return new Promise((resolve, reject) => {
                refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
            });

        }
        else if (error.response && (error.response.status === 498)) {
            secureLocalStorage.removeItem("user");
            window.location = "/login";
        }

        // Return a Promise rejection if the status code is not 401
        return Promise.reject(error);
    }
);

export default api