import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import { setProgress } from "./loader";
import secureLocalStorage from "react-secure-storage";

import PoolService from "../services/pool.service";

const user = JSON.parse(secureLocalStorage.getItem("user"));



export const filterPools = createAsyncThunk(
    "pool/filterPools",
    async ({ page, pageSize, term, joined, owner, closed, opened, orderBy }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.filterPools(page, pageSize, term, joined, owner, closed, opened, orderBy);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getPool = createAsyncThunk(
    "pool/getPool",
    async ({ poolID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.getPool(poolID);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getPoolDefaultSettings = createAsyncThunk(
    "pool/getPoolDefaultSettings",
    async ({ }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.getPoolDefaultSettings();
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const filterPoolMembers = createAsyncThunk(
    "pool/filterPoolMembers",
    async ({ poolID, term, filter }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.filterPoolMembers(poolID, term, filter);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const makeMemberAdmin = createAsyncThunk(
    "pool/makeMemberAdmin",
    async ({ PoolID, memberID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.makeMemberAdmin(PoolID, memberID);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: 'Member made admin successfully', type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getMemberGoals = createAsyncThunk(
    "pool/getMemberGoals",
    async ({ PoolID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.getMemberGoals(PoolID);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const sendInvitation = createAsyncThunk(
    "pool/sendInvitation",
    async ({ PoolID, mode, recipients, returnUrl }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.sendInvitation(PoolID, mode, recipients, returnUrl);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: 'Invite sent', type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getPoolJoin = createAsyncThunk(
    "pool/getPoolJoin",
    async ({ poolID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.getJoinPoolDetails(poolID);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const requestToJoinPool = createAsyncThunk(
    "pool/requestToJoinPool",
    async ({ poolID, referral_code }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.requestToJoinPool(poolID, referral_code);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const getPendingJoinRequests = createAsyncThunk(
    "pool/getPendingJoinRequests",
    async ({ poolID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.getPendingJoinRequests(poolID);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const updatePoolJoiningRequest = createAsyncThunk(
    "pool/updatePoolJoiningRequest",
    async ({ poolID, memberID, requestId, action }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.updatePoolJoiningRequest(poolID, requestId, memberID, action);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const uploadPoolImage = createAsyncThunk(
    "pool/uploadPoolImage",
    async ({ poolID, file }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.uploadPoolImage(poolID, file);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updatePool = createAsyncThunk(
    "pool/updatePool",
    async ({ poolID, poolData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.updatePool(poolID, poolData);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const poolDeleteRequest = createAsyncThunk(
    "pool/poolDeleteRequest",
    async ({ poolID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.poolDeleteRequest(poolID);
            thunkAPI.dispatch(setProgress(100));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const createPool = createAsyncThunk(
    "pool/createPool",
    async ({ poolData }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.createPool(poolData);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: response.data.response_message, type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const submitReport = createAsyncThunk(
    "pool/submitReport",
    async ({ poolID, categories, reason, additionalDetails, reporterId }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.submitReport(poolID, categories, reason, additionalDetails, reporterId);
            thunkAPI.dispatch(setProgress(100));

            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const getMemberDetails = createAsyncThunk(
    "pool/getMemberDetails",
    async ({ poolID, memberID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolService.getMemberDetails(poolID, memberID);
            thunkAPI.dispatch(setProgress(100));

            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateMemberRole = createAsyncThunk(
    "pool/updateMemberRole",
    async ({ poolID, memberID, role }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.updateMemberRole(poolID, memberID, role);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: 'Member role updated successfully', type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const removeMemberFromPool = createAsyncThunk(
    "pool/removeMemberFromPool",
    async ({ poolID, memberID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(50));
            const response = await PoolService.removeMemberFromPool(poolID, memberID);
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: 'Member removed successfully', type: 'success' }));
            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getMemberContributions = createAsyncThunk(
    "pool/getMemberContributions",
    async ({ poolID, memberID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolService.getMemberContributions(poolID, memberID);
            thunkAPI.dispatch(setProgress(100));

            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getMemberActivity = createAsyncThunk(
    "pool/getMemberActivity",
    async ({ poolID, memberID }, thunkAPI) => {
        try {
            thunkAPI.dispatch(setProgress(30));
            const response = await PoolService.getMemberActivity(poolID, memberID);
            thunkAPI.dispatch(setProgress(100));

            return (response && response.data && response.data.response_body);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.response_message) || error.message || error.toString();
            thunkAPI.dispatch(setProgress(100));
            thunkAPI.dispatch(setMessage({ message: message, type: 'error' }));
            return thunkAPI.rejectWithValue(message);
        }
    }
);



const initialState = {
    pools: {},
    poolSelected: {},
    filteredPoolMembers: [],
    defaultSettings: {},
    topContributors: [],
    poolJoining: {},
    poolJoiningRequests: [],
    memberDetails: null,
    memberContributions: [],
    memberActivity: [],
    loading: {
        memberDetails: false,
        memberContributions: false,
        memberActivity: false,
        updateRole: false,
        removeMember: false
    },
    error: {
        memberDetails: null,
        memberContributions: null,
        memberActivity: null,
        updateRole: null,
        removeMember: null
    }
};

const poolSlice = createSlice({
    name: 'pool',
    initialState,
    reducers: {
        clearMemberState: (state) => {
            state.memberDetails = null;
            state.memberContributions = [];
            state.memberActivity = [];
            state.loading.memberDetails = false;
            state.loading.memberContributions = false;
            state.loading.memberActivity = false;
            state.loading.updateRole = false;
            state.loading.removeMember = false;
            state.error.memberDetails = null;
            state.error.memberContributions = null;
            state.error.memberActivity = null;
            state.error.updateRole = null;
            state.error.removeMember = null;
        },
        // Clear member details specifically
        clearMemberDetails: (state) => {
            state.memberDetails = null;
            state.loading.memberDetails = false;
            state.error.memberDetails = null;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(filterPools.fulfilled, (state, action) => {
                const pools = action.payload.Pools;

                if (state.pools && state.pools.items && state.pools.items.length > 0) {

                    if (pools.page == 1) {
                        state.pools = pools;
                    } else {

                        const newItems = pools.items.filter(
                            (newItem) => !state.pools.items.some((existingItem) => existingItem.id === newItem.id)
                        );

                        state.pools = {
                            ...state.pools,
                            items: [...state.pools.items, ...newItems],
                            total: pools.total,
                            page: pools.page,
                            pageSize: pools.pageSize
                        };
                    }

                } else {
                    state.pools = pools;
                }
            })
            .addCase(filterPools.rejected, (state, action) => {
                state.pools = [];
            })
            .addCase(getPool.fulfilled, (state, action) => {
                state.poolSelected = action.payload.Pool;
            })
            .addCase(getPool.rejected, (state, action) => {
                state.poolSelected = {};
            })
            .addCase(getPoolDefaultSettings.fulfilled, (state, action) => {
                state.defaultSettings = action.payload.Default;
            })
            .addCase(getPoolDefaultSettings.rejected, (state, action) => {
                state.defaultSettings = {};
            })
            .addCase(filterPoolMembers.fulfilled, (state, action) => {
                state.filteredPoolMembers = action.payload.Members;
            })
            .addCase(filterPoolMembers.rejected, (state, action) => {
                state.filteredPoolMembers = [];
            })
            .addCase(makeMemberAdmin.fulfilled, (state, action) => {

            })
            .addCase(makeMemberAdmin.rejected, (state, action) => {

            })
            .addCase(getMemberGoals.fulfilled, (state, action) => {

                let goals = action.payload.Members;

                const topContributors = goals
                    .filter(c => c.totalContributed > 0)
                    .sort((a, b) => b.totalContributed - a.totalContributed)
                    .map((contributor, index) => ({
                        username: contributor.username,
                        totalContributed: contributor.totalContributed,
                        photo: contributor.photo,
                        memberID: contributor.memberID,
                        contributionPercentage: (contributor.contributionPercentage || 0).toFixed(1)
                    }));

                state.topContributors = topContributors;
            })
            .addCase(getMemberGoals.rejected, (state, action) => {
                state.topContributors = [];
            })
            .addCase(sendInvitation.fulfilled, (state, action) => {
            })
            .addCase(sendInvitation.rejected, (state, action) => {
            })
            .addCase(getPoolJoin.fulfilled, (state, action) => {
                state.poolJoining = action.payload.Pool;
            })
            .addCase(getPoolJoin.rejected, (state, action) => {
            })
            .addCase(requestToJoinPool.fulfilled, (state, action) => {

            })
            .addCase(requestToJoinPool.rejected, (state, action) => {
            })
            .addCase(getPendingJoinRequests.fulfilled, (state, action) => {
                state.poolJoiningRequests = action.payload.Requests;
            })
            .addCase(getPendingJoinRequests.rejected, (state, action) => {
            })
            .addCase(updatePoolJoiningRequest.fulfilled, (state, action) => {

            })
            .addCase(updatePoolJoiningRequest.rejected, (state, action) => {
            })
            .addCase(uploadPoolImage.fulfilled, (state, action) => {

            })
            .addCase(uploadPoolImage.rejected, (state, action) => {
            })
            .addCase(updatePool.fulfilled, (state, action) => {
                state.poolSelected = action.payload.Pool;
            })
            .addCase(updatePool.rejected, (state, action) => {
            })
            .addCase(poolDeleteRequest.fulfilled, (state, action) => {

            })
            .addCase(poolDeleteRequest.rejected, (state, action) => {
            })
            .addCase(createPool.fulfilled, (state, action) => {

            })
            .addCase(createPool.rejected, (state, action) => {
            })
            .addCase(submitReport.fulfilled, (state, action) => {

            })
            .addCase(submitReport.rejected, (state, action) => {
            })
            .addCase(getMemberDetails.pending, (state) => {
                state.loading.memberDetails = true;
                state.error.memberDetails = null;
            })
            .addCase(getMemberDetails.fulfilled, (state, action) => {
                state.loading.memberDetails = false;
                state.memberDetails = action.payload.Member;
            })
            .addCase(getMemberDetails.rejected, (state, action) => {
                state.loading.memberDetails = false;
                state.error.memberDetails = action.payload;
                state.memberDetails = null;
            })

            .addCase(updateMemberRole.pending, (state) => {
                state.loading.updateRole = true;
                state.error.updateRole = null;
            })
            .addCase(updateMemberRole.fulfilled, (state, action) => {
                state.loading.updateRole = false;
                // Update member in filteredPoolMembers if present
                const updatedMember = action.payload.Member;
                if (updatedMember && state.filteredPoolMembers) {
                    const index = state.filteredPoolMembers.findIndex(member => member.memberID === updatedMember.memberID);
                    if (index !== -1) {
                        state.filteredPoolMembers[index] = updatedMember;
                    }
                }
                // Also update in memberDetails if it's the same member
                if (state.memberDetails && state.memberDetails.memberID === updatedMember.memberID) {
                    state.memberDetails = updatedMember;
                }
            })
            .addCase(updateMemberRole.rejected, (state, action) => {
                state.loading.updateRole = false;
                state.error.updateRole = action.payload;
            })

            .addCase(removeMemberFromPool.pending, (state) => {
                state.loading.removeMember = true;
                state.error.removeMember = null;
            })
            .addCase(removeMemberFromPool.fulfilled, (state, action) => {
                state.loading.removeMember = false;
                // Remove member from filteredPoolMembers
                const removedMemberID = action.meta.arg.memberID;
                state.filteredPoolMembers = state.filteredPoolMembers.filter(member => member.memberID !== removedMemberID);
                // Clear member details if it's the same member
                if (state.memberDetails && state.memberDetails.memberID === removedMemberID) {
                    state.memberDetails = null;
                }
            })
            .addCase(removeMemberFromPool.rejected, (state, action) => {
                state.loading.removeMember = false;
                state.error.removeMember = action.payload;
            })

            .addCase(getMemberContributions.pending, (state) => {
                state.loading.memberContributions = true;
                state.error.memberContributions = null;
            })
            .addCase(getMemberContributions.fulfilled, (state, action) => {
                state.loading.memberContributions = false;
                state.memberContributions = action.payload.Contributions || [];
            })
            .addCase(getMemberContributions.rejected, (state, action) => {
                state.loading.memberContributions = false;
                state.error.memberContributions = action.payload;
                state.memberContributions = [];
            })

            .addCase(getMemberActivity.pending, (state) => {
                state.loading.memberActivity = true;
                state.error.memberActivity = null;
            })
            .addCase(getMemberActivity.fulfilled, (state, action) => {
                state.loading.memberActivity = false;
                state.memberActivity = action.payload.Activity || [];
            })
            .addCase(getMemberActivity.rejected, (state, action) => {
                state.loading.memberActivity = false;
                state.error.memberActivity = action.payload;
                state.memberActivity = [];
            });


    }
});


const { reducer } = poolSlice;
export const {
    clearMemberState, clearMemberDetails
} = poolSlice.actions
export default reducer;