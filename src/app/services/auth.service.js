import api from '../common/api';
import secureLocalStorage from "react-secure-storage";

const API_URL = "api/v1/auth/";

const register = (username, email, password, firstName, lastName, date_of_birth, phone, referral) => {
  return api.post(API_URL + "register", {
    username,
    email,
    password,
    firstName,
    lastName,
    date_of_birth,
    phone,
    referral
  });
};

const login = (username, password) => {
  return api.post(API_URL + "login", {
    username,
    password,
  });
};

const logout = () => {
  secureLocalStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(secureLocalStorage.getItem("user"));
};

const createForgotPassword = (email, callbackUrl) => {
  return api.post(API_URL + "create-forgot-password", {
    email,
    callbackUrl
  });
};

const resetPassword = (token, password) => {
  return api.post(API_URL + "reset-password", {
    token,
    password
  });
};

const changeAccountPassword = (userId, oldPassword, newPassword) => {
  return api.post(API_URL + userId + "/change-account-password", {
    oldPassword,
    newPassword
  });
};

const getApps = () => {
  return api.get(API_URL + "apps");
}

const createApps = (name) => {
  return api.post(API_URL + "apps", {
    name
  });
}

const createEmailVerificationRequest = (userId, callbackUrl) => {
  return api.post(API_URL + "user/" + userId + "/email-verification-request", { callbackUrl });
}

const verifyEmail = (token) => {
  return api.get(API_URL + "email-verification?token=" + token);
}

const haveAccountMarkedForDeletion = (userId, password, reason) => {
  return api.post(API_URL + userId + "/delete-account", { password, reason });
}

const getNotificationsUnRead = (userId, page, pageSize) => {
  return api.get(API_URL + userId + "/notifications-unread/" + page + "/" + pageSize);
}

const getNotifications = (userId, page, pageSize, isRead) => {
  return api.post(API_URL + userId + "/notifications/list/" + page + "/" + pageSize, {
    isRead
  });
}

const notificationsMarkRead = (userId, notificationId) => {
  return api.post(API_URL + userId + "/notifications/mark-as-read/" + notificationId);
}

const notificationDelete = (userId, notificationId) => {
  return api.post(API_URL + userId + "/notifications/delete/" + notificationId);
}

const downloadPersonalData = (userId) => {
  return api.get(API_URL + userId + "/download-data");
}



const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  createForgotPassword,
  resetPassword,
  changeAccountPassword,
  getApps,
  createApps,
  createEmailVerificationRequest,
  haveAccountMarkedForDeletion,
  getNotificationsUnRead,
  getNotifications,
  notificationsMarkRead,
  notificationDelete,
  downloadPersonalData,
  verifyEmail
}

export default AuthService;
