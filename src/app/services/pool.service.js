import api from '../common/api';

const API_URL = 'api/v1/pool/';


const getPoolDefaultSettings = () => {
  return api.get(API_URL + "default-settings");
}

const filterPools = (page, pageSize, term, joined, owner, closed, opened, orderBy) => {
  return api.post(API_URL + "list/" + page + "/" + pageSize + "?term=" + term, {
    joined: joined,
    owner: owner,
    closed: closed,
    opened: opened,
    orderBy: orderBy
  });
}

const getPool = (poolID) => {
  return api.get(API_URL + poolID);
}

const filterPoolMembers = (poolID, term, filter) => {
  return api.post(API_URL + poolID + "/members?term=" + term, filter);
}

const makeMemberAdmin = (PoolID, memberID) => {
  return api.post(API_URL + "member-role", {
    PoolID,
    memberID
  });
}

const getMemberGoals = (poolID) => {
  return api.get(API_URL + poolID + "/member-goals/");
}

const sendInvitation = (poolID, mode, recipients, returnUrl) => {
  return api.post(API_URL + poolID + "/invite/" + mode, { recipients, returnUrl });
}

const requestToJoinPool = (poolID, referral_code) => {
  return api.post(API_URL + poolID + "/join-request", { referral_code });
}

const getPendingJoinRequests = (poolID) => {
  return api.get(API_URL + poolID + "/join-requests");
}

const getJoinPoolDetails = (poolID) => {
  return api.get(API_URL + poolID + "/join-details");
}

const updatePoolJoiningRequest = (poolID, memberID, requestId, action) => {
  return api.post(API_URL + poolID + "/join-request/" + requestId + "/member/" + memberID, { action });
}

const updatePool = (poolID, poolData) => {
  return api.put(API_URL + poolID, {
    ...poolData
  });
}

const uploadPoolImage = (poolID, file) => {
  const data = new FormData();
  data.append(`file`, file);
  return api.post(API_URL + poolID + '/media-upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

const poolDeleteRequest = (poolID) => {
  return api.post(API_URL + poolID + "/delete-request");
}

const createPool = (poolData) => {
  return api.post(API_URL, {
    ...poolData
  });
}

const submitReport = (poolID, categories, primaryReason, additionalDetails, reporterId) => {
  return api.post(API_URL + poolID + "/report", { categories, primaryReason, additionalDetails, reporterId });
}

const getMemberDetails = (poolID, memberID) => {
  return api.get(API_URL + poolID + `/members/${memberID}`);
}

const updateMemberRole = (poolID, memberID, role) => {
  return api.patch(API_URL + poolID + `/members/${memberID}/role`, { role });
}

const removeMemberFromPool = (poolID, memberID) => {
  return api.delete(API_URL + poolID + `/members/${memberID}`);
}

const getMemberContributions = (poolID, memberID) => {
  return api.get(API_URL + poolID + `/members/${memberID}/contributions`);
}

const getMemberActivity = (poolID, memberID) => {
  return api.get(API_URL + poolID + `/members/${memberID}/activity`);
}


const PoolService = {
  makeMemberAdmin,
  filterPools,
  getPool,
  getPoolDefaultSettings,
  filterPoolMembers,
  getMemberGoals,
  sendInvitation,
  requestToJoinPool,
  getPendingJoinRequests,
  getJoinPoolDetails,
  updatePoolJoiningRequest,
  updatePool,
  uploadPoolImage,
  poolDeleteRequest,
  createPool,
  submitReport,
  getMemberDetails,
  updateMemberRole,
  removeMemberFromPool,
  getMemberContributions,
  getMemberActivity
}



export default PoolService;