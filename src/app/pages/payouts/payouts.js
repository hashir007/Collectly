import classNames from "./payouts.module.css";
import React, { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Table, Badge, Card, Alert, Tabs, Tab, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { Hourglass } from 'react-loader-spinner';

import {
    getPool
} from "../../slices/pool";

import {
    getPoolPayouts,
    getPayoutById,
    createPayout,
    updatePayoutStatus,
    cancelPayout,
    getPayoutStats,
    getEligibleMembers,
    clearPayouts,
    clearSelectedPayout,
    clearPayoutStats,
    clearEligibleMembers
} from "../../slices/poolPayout";

import {
    castVote,
    getVotingResults,
    getEligibleVoters,
    canUserVote,
    startVoting,
    clearVotingResults,
    clearEligibleVoters
} from "../../slices/poolPayoutVoting";

import {
    getVotingSettings,
    updateVotingSettings,
    toggleVoting,
    getVotingAnalytics,
    clearVotingSettings
} from "../../slices/poolVotingSettings";

import {
    getPayoutSettings,
    updatePayoutSettings,
    validatePayoutAmount,
    checkDailyPayoutLimit,
    getPayoutSettingsAnalytics,
    clearPayoutSettings
} from "../../slices/poolPayoutSettings";


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
};

const Payouts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const PoolID = urlParams.get("id");
    const { user: currentUser } = useSelector((state) => state.auth || {});
    const { poolSelected } = useSelector((state) => state.pool || {});


    const {
        poolPayouts = [],
        payoutSelected,
        payoutStats = {},
        eligibleMembers = [],
        loading: payoutsLoading,
        success: payoutsSuccess,
        pagination
    } = useSelector((state) => state.poolPayout || {});

    const {
        votingResults = {},
        eligibleVoters = [],
        votingStatus,
        loading: votingLoading,
        success: votingSuccess
    } = useSelector((state) => state.poolPayoutVoting || {});

    const {
        votingSettings = {},
        votingAnalytics = {},
        loading: settingsLoading,
        success: settingsSuccess
    } = useSelector((state) => state.poolVotingSettings || {});

    const {
        payoutSettings = {},
        payoutSettingsAnalytics = {},
        dailyLimit = null,
        validationResult = { isValid: true, errors: [] },
        loading: payoutSettingsLoading,
        success: payoutSettingsSuccess
    } = useSelector((state) => state.poolPayoutSettings || {});

    // Local state
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [showPayoutDetailsModal, setShowPayoutDetailsModal] = useState(false);
    const [showVotingModal, setShowVotingModal] = useState(false);
    const [showVotingResultsModal, setShowVotingResultsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [payoutToFail, setPayoutToFail] = useState(null);
    const [enableVoting, setEnableVoting] = useState(false);
    const [userVotingEligibility, setUserVotingEligibility] = useState({});
    const [activeTab, setActiveTab] = useState("payout");
    const [amountValidation, setAmountValidation] = useState({ isValid: true, errors: [] });
    const [votingEligibilityCache, setVotingEligibilityCache] = useState({});
    const [payoutVotingStatus, setPayoutVotingStatus] = useState({});


    // Replace the existing canUserVoteOnPayout function with this:
    const canUserVoteOnPayout = useCallback(async (payout) => {
        if (!currentUser || !payout?.id || !payout?.voting_enabled) {
            return {
                canVote: false,
                hasVoted: false,
                reason: 'User not logged in or voting not enabled'
            };
        }

        // Check if voting is active
        if (payout.voting_status !== 'active') {
            return {
                canVote: false,
                hasVoted: false,
                reason: `Voting is ${payout.voting_status}`
            };
        }

        // Check if voting period has ended
        if (payout.voting_ends_at && new Date() > new Date(payout.voting_ends_at)) {
            return {
                canVote: false,
                hasVoted: false,
                reason: 'Voting period has ended',
                votingEnded: true
            };
        }

        // Check cache first
        if (votingEligibilityCache[payout.id] !== undefined) {
            return votingEligibilityCache[payout.id];
        }

        try {
            const action = await dispatch(canUserVote({ payoutId: payout.id }));

            // Handle the response properly
            if (action.payload?.votingStatus) {
                const eligibility = action.payload.votingStatus;

                const fullEligibility = {
                    canVote: eligibility.canVote || false,
                    hasVoted: eligibility.hasVoted || false,
                    reason: eligibility.reason || 'Unknown',
                    currentVote: eligibility.currentVote,
                    votingPower: eligibility.votingPower || 1,
                    votingEndsAt: eligibility.votingEndsAt || payout.voting_ends_at,
                    votingEnded: eligibility.votingEnded || false,
                    votingStartsAt: eligibility.votingStartsAt || payout.voting_starts_at,
                    votingType: eligibility.votingType,
                    payoutAmount: payout.amount,
                    poolId: payout.poolID
                };

                // Update cache
                setVotingEligibilityCache(prev => ({
                    ...prev,
                    [payout.id]: fullEligibility
                }));

                return fullEligibility;
            } else {
                throw new Error('No voting status returned');
            }
        } catch (error) {
            console.error('Error checking voting eligibility:', error);

            const errorEligibility = {
                canVote: false,
                hasVoted: false,
                reason: 'Error checking eligibility',
                error: error.message
            };

            setVotingEligibilityCache(prev => ({
                ...prev,
                [payout.id]: errorEligibility
            }));

            return errorEligibility;
        }
    }, [currentUser, dispatch, votingEligibilityCache]);

    // Fetch initial data
    useEffect(() => {
        if (PoolID) {
            dispatch(getPool({ poolID: PoolID }));
            dispatch(getPoolPayouts({ poolId: PoolID }));
            dispatch(getEligibleMembers({ poolId: PoolID }));
            dispatch(getVotingSettings({ poolId: PoolID }));
            dispatch(getPayoutStats({ poolId: PoolID }));
            dispatch(getPayoutSettings({ poolId: PoolID }));
            dispatch(getVotingAnalytics({ poolId: PoolID }));
            dispatch(getPayoutSettingsAnalytics({ poolId: PoolID }));
            dispatch(checkDailyPayoutLimit({ poolId: PoolID }));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearPayouts());
            dispatch(clearEligibleMembers());
            dispatch(clearVotingSettings());
            dispatch(clearPayoutSettings());
            dispatch(clearSelectedPayout());
            dispatch(clearVotingResults());
            dispatch(clearEligibleVoters());
        };
    }, [PoolID, dispatch]);

    // When a payout is selected, check whether current user can vote
    useEffect(() => {
        if (selectedPayout && currentUser) {
            dispatch(canUserVote({ payoutId: selectedPayout.id }))
                .then((action) => {
                    if (action?.payload?.votingStatus) {
                        setUserVotingEligibility(action.payload.votingStatus);
                    } else {
                        setUserVotingEligibility({});
                    }
                })
                .catch((error) => {
                    console.error('Error checking voting eligibility:', error);
                    setUserVotingEligibility({});
                });
        } else {
            setUserVotingEligibility({});
        }
    }, [selectedPayout, currentUser, dispatch]);

    useEffect(() => {
        const loadVotingEligibility = async () => {
            if (!poolPayouts || poolPayouts.length === 0) return;

            // Only check for payouts with active voting
            const activePayouts = poolPayouts.filter(p =>
                p.voting_enabled &&
                p.voting_status === 'active' &&
                p.voting_ends_at &&
                new Date() < new Date(p.voting_ends_at)
            );

            if (activePayouts.length === 0) {
                setPayoutVotingStatus({});
                return;
            }

            // Load eligibility for each active payout
            const eligibilityPromises = activePayouts.map(async (payout) => {
                try {
                    const eligibility = await canUserVoteOnPayout(payout);
                    return { id: payout.id, eligibility };
                } catch (error) {
                    console.error(`Error loading eligibility for payout ${payout.id}:`, error);
                    return {
                        id: payout.id,
                        eligibility: {
                            canVote: false,
                            hasVoted: false,
                            reason: 'Error loading eligibility'
                        }
                    };
                }
            });

            try {
                const results = await Promise.allSettled(eligibilityPromises);
                const statusMap = {};

                results.forEach(result => {
                    if (result.status === 'fulfilled' && result.value) {
                        const { id, eligibility } = result.value;
                        statusMap[id] = eligibility;
                    }
                });

                setPayoutVotingStatus(statusMap);
            } catch (error) {
                console.error('Error loading voting eligibility:', error);
            }
        };

        loadVotingEligibility();
    }, [poolPayouts, canUserVoteOnPayout]);

    useEffect(() => {
        if (!poolPayouts) return;

        // Only clear cache for payouts that no longer exist
        setVotingEligibilityCache(prev => {
            const currentPayoutIds = poolPayouts.map(p => p.toString());
            const newCache = { ...prev };
            let changed = false;

            Object.keys(newCache).forEach(cachedId => {
                if (!currentPayoutIds.includes(cachedId)) {
                    delete newCache[cachedId];
                    changed = true;
                }
            });

            return changed ? newCache : prev;
        });

        setPayoutVotingStatus(prev => {
            const currentPayoutIds = poolPayouts.map(p => p.toString());
            const newStatus = { ...prev };
            let changed = false;

            Object.keys(newStatus).forEach(cachedId => {
                if (!currentPayoutIds.includes(cachedId)) {
                    delete newStatus[cachedId];
                    changed = true;
                }
            });

            return changed ? newStatus : prev;
        });
    }, [poolPayouts]);

    // Validate payout amount in real-time
    const validateAmount = useCallback((amount) => {
        if (!amount || Number(amount) <= 0) {
            setAmountValidation({ isValid: true, errors: [] });
            return;
        }

        dispatch(validatePayoutAmount({
            poolId: PoolID,
            amount: parseFloat(amount)
        })).then((action) => {
            if (action?.payload) {
                setAmountValidation(action.payload.validation || { isValid: true, errors: [] });
            }
        });
    }, [PoolID, dispatch]);

    // Create new payout with validation
    const handleCreatePayout = useCallback((formValue, { setSubmitting }) => {
        const { recipientId, amount, description, enableVoting: payloadEnableVoting } = formValue;

        dispatch(validatePayoutAmount({
            poolId: PoolID,
            amount: parseFloat(amount)
        })).then((validationAction) => {
            if (validationAction?.payload) {
                const validation = validationAction.payload.validation;

                if (!validation.isValid) {
                    setSubmitting(false);
                    alert(`Validation failed: ${validation.errors.join(', ')}`);
                    return;
                }

                // Check daily limit
                dispatch(checkDailyPayoutLimit({ poolId: PoolID })).then((limitAction) => {
                    if (limitAction?.payload) {
                        const limit = limitAction.payload;

                        if (limit.exceeded) {
                            setSubmitting(false);
                            alert(`Daily payout limit exceeded.  Used:  ${limit.used}/${limit.limit}`);
                            return;
                        }

                        // Proceed with payout creation
                        dispatch(createPayout({
                            poolId: PoolID,
                            payoutData: {
                                poolID: parseInt(PoolID, 10),
                                recipientId: parseInt(recipientId, 10),
                                amount: parseFloat(amount),
                                description,
                                created_by: currentUser?.user?.id,
                                enable_voting: payloadEnableVoting || false
                            }
                        })).then((action) => {
                            setSubmitting(false);
                            if (action?.payload) {
                                setShowPayoutModal(false);
                                setEnableVoting(false);
                                dispatch(getPoolPayouts({ poolId: PoolID }));
                                dispatch(getPayoutStats({ poolId: PoolID }));
                                dispatch(checkDailyPayoutLimit({ poolId: PoolID }));
                            } else {
                                setSubmitting(false);
                            }
                        });
                    } else {
                        setSubmitting(false);
                    }
                });
            } else {
                setSubmitting(false);
            }
        });
    }, [PoolID, dispatch, currentUser]);

    // Settings updates
    const handleUpdateVotingSettings = useCallback((settings) => {
        dispatch(updateVotingSettings({
            poolId: PoolID,
            settingsData: settings
        })).then((action) => {
            if (action?.payload) {
                dispatch(getVotingSettings({ poolId: PoolID }));
            }
        });
    }, [PoolID, dispatch]);

    const handleUpdatePayoutSettings = useCallback((settings) => {
        dispatch(updatePayoutSettings({
            poolId: PoolID,
            settingsData: settings
        })).then((action) => {
            if (action?.payload) {
                dispatch(getPayoutSettings({ poolId: PoolID }));
            }
        });
    }, [PoolID, dispatch]);

    const handleToggleVoting = useCallback((enabled) => {
        dispatch(toggleVoting({
            poolId: PoolID,
            toggleData: {
                enabled: enabled
            }
        })).then((action) => {
            if (action?.payload) {
                dispatch(getVotingSettings({ poolId: PoolID }));
            }
        });
    }, [PoolID, dispatch]);

    // Voting actions
    const handleCastVote = useCallback((payoutId, voteType, comments = '') => {
        if (!payoutId || !voteType) return;

        dispatch(castVote({
            payoutId,
            voteData: { voteType: voteType, comments: comments }
        })).then((action) => {
            if (action?.payload) {
                setShowVotingModal(false);
                setSelectedPayout(null);

                // Clear cache for this payout
                setVotingEligibilityCache(prev => {
                    const newCache = { ...prev };
                    delete newCache[payoutId];
                    return newCache;
                });

                // Update local state immediately
                setPayoutVotingStatus(prev => ({
                    ...prev,
                    [payoutId]: {
                        canVote: false,
                        hasVoted: true,
                        currentVote: voteType,
                        reason: 'Already voted',
                        votedAt: new Date().toISOString()
                    }
                }));

                // Refresh data
                dispatch(getPoolPayouts({ poolId: PoolID }));
                dispatch(getPayoutStats({ poolId: PoolID }));

                // If we have the payout details, refresh those too
                if (selectedPayout?.id === payoutId) {
                    dispatch(getPayoutById({ payoutId }));
                    dispatch(getVotingResults({ payoutId }));
                }

                // Show success message
                alert(`Vote cast successfully: ${voteType}`);
            }
        }).catch(error => {
            console.error('Failed to cast vote:', error);
            alert(`Failed to cast vote: ${error.message}`);
        });
    }, [PoolID, dispatch, selectedPayout]);

    // View payout details
    const handleViewPayoutDetails = useCallback((payout) => {
        setSelectedPayout(payout);
        dispatch(getPayoutById({ payoutId: payout.id })).then((action) => {
            if (action?.payload) {
                const payoutWithDetails = action?.payload?.payout;
                setSelectedPayout(payoutWithDetails);

                if (payoutWithDetails.voting_enabled) {
                    dispatch(getVotingResults({ payoutId: payout.id }));
                    dispatch(getEligibleVoters({ payoutId: payout.id }));
                    dispatch(canUserVote({ payoutId: payout.id })).then((voteAction) => {
                        if (voteAction?.payload) {
                            setUserVotingEligibility(voteAction.payload);
                        }
                    });
                }
            }
        });
        setShowPayoutDetailsModal(true);
    }, [dispatch]);

    // Admin payout actions
    const handleUpdatePayoutStatus = useCallback((payoutId, status, failureReason = null) => {
        dispatch(updatePayoutStatus({
            payoutId,
            statusData: {
                status: status,
                failureReason: failureReason
            }
        })).then((action) => {
            if (action?.payload) {
                dispatch(getPoolPayouts({ poolId: PoolID }));
                dispatch(getPayoutStats({ poolId: PoolID }));
                dispatch(getPayoutSettingsAnalytics({ poolId: PoolID }));
            }
        });
    }, [PoolID, dispatch]);

    const handleCancelPayout = useCallback((payoutId, reason = 'Cancelled by user') => {
        dispatch(cancelPayout({
            payoutId,
            reason
        })).then((action) => {
            if (action?.payload) {
                dispatch(getPoolPayouts({ poolId: PoolID }));
                dispatch(getPayoutStats({ poolId: PoolID }));
                dispatch(getPayoutSettingsAnalytics({ poolId: PoolID }));
            }
        });
    }, [PoolID, dispatch]);

    const handleStartVoting = useCallback((payoutId, durationHours = 72) => {
        dispatch(startVoting({
            payoutId,
            durationHours
        })).then((action) => {
            if (action?.payload) {
                dispatch(getPoolPayouts({ poolId: PoolID }));
                dispatch(getPayoutStats({ poolId: PoolID }));
            }
        });
    }, [PoolID, dispatch]);

    const handleFailPayout = useCallback((payoutId, failureReason) => {
        handleUpdatePayoutStatus(payoutId, 'failed', failureReason);
        setShowFailureModal(false);
        setPayoutToFail(null);
    }, [handleUpdatePayoutStatus]);

    // Helpers
    const getVotingStatusVariant = (votingStatus) => {
        if (!votingStatus) return 'secondary';
        switch (votingStatus.toLowerCase()) {
            case 'active': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            case 'not_started': return 'secondary';
            default: return 'secondary';
        }
    };

    const getVotingResultVariant = (votingResult) => {
        if (!votingResult) return 'secondary';
        switch (votingResult.toLowerCase()) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'pending': return 'warning';
            case 'failed': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusVariant = (status) => {
        if (!status) return 'secondary';
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'danger';
            case 'processing': return 'info';
            case 'pending_voting': return 'info';
            case 'cancelled': return 'secondary';
            default: return 'secondary';
        }
    };

    const isVotingActive = (payout) => {
        if (!payout?.voting_enabled || payout?.voting_status !== 'active') return false;
        if (payout.voting_ends_at && new Date() > new Date(payout.voting_ends_at)) return false;
        return true;
    };

    const formatTimeRemaining = (endDate) => {
        if (!endDate) return '';
        const now = new Date();
        const end = new Date(endDate);
        const diffMs = end - now;
        if (diffMs <= 0) return 'Ended';
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    const calculateVotingSuccessRate = () => {
        const votingPayouts = (poolPayouts || []).filter(p => p.voting_enabled);
        const approvedPayouts = votingPayouts.filter(p => p.voting_result === 'approved');
        return votingPayouts.length > 0 ?
            `${approvedPayouts.length}/${votingPayouts.length}` : '0/0';
    };

    const getRecipientDisplay = (payout) => {
        if (payout?.recipient) {
            return {
                name: payout.recipient.username || `${payout.recipient.firstName || ''} ${payout.recipient.lastName || ''}`.trim(),
                email: payout.recipient.email,
                photo: payout.recipient.photo
            };
        }
        return {
            name: 'Unknown',
            email: '',
            photo: null
        };
    };

    // For VOTE button (during active voting)
    const shouldShowVoteButton = useCallback((payout) => {
        if (!payout || !currentUser) return false;

        // ✅ CRITICAL FIX 1: Check if POOL voting is enabled in settings
        if (!votingSettings?.voting_enabled) {
            console.log('Vote button hidden: Pool voting is disabled');
            return false;
        }

        // ✅ CRITICAL FIX 2: Check if THIS payout has voting enabled
        if (!payout.voting_enabled) {
            console.log('Vote button hidden: Payout voting is disabled');
            return false;
        }

        // Only for active voting
        if (payout.voting_status !== 'active') {
            console.log(`Vote button hidden: Voting status is ${payout.voting_status}`);
            return false;
        }

        // Check if voting period hasn't ended
        if (payout.voting_ends_at && new Date() > new Date(payout.voting_ends_at)) {
            console.log('Vote button hidden: Voting period has ended');
            return false;
        }

        // User must not be the recipient
        if (payout.recipientId === currentUser?.user?.id) {
            console.log('Vote button hidden: User is recipient');
            return false;
        }

        // User must not be the creator
        if (payout.createdby === currentUser?.user?.id) {
            console.log('Vote button hidden: User is creator');
            return false;
        }

        // Get eligibility from cache or state
        const eligibility = payoutVotingStatus[payout.id];

        // If no eligibility cached yet, show loading state
        if (!eligibility) {
            console.log('Vote button: Loading eligibility...');
            return null; // Return null to indicate loading
        }

        // User must be eligible to vote and hasn't voted yet
        const canVote = eligibility.canVote === true && eligibility.hasVoted === false;

        if (!canVote) {
            console.log(`Vote button hidden: Eligibility - canVote: ${eligibility.canVote}, hasVoted: ${eligibility.hasVoted}`);
        }

        return canVote;
    }, [currentUser, payoutVotingStatus, votingSettings]);

    // For APPROVE/REJECT buttons (after voting ends)
    const shouldShowApproveRejectButtons = useCallback((payout) => {
        if (!payout || !currentUser) return false;

        // Only pool owner can see these
        const isPoolOwner = currentUser?.user?.id === poolSelected?.poolOwner?.id;
        if (!isPoolOwner) return false;

        // Must be processing status
        if (payout.status !== 'processing') return false;

        // Voting must be completed
        if (payout.voting_status !== 'completed') return false;

        // Must have a voting result
        if (!payout.voting_result || payout.voting_result === 'pending') {
            return false;
        }

        // Check if payout hasn't been completed yet
        if (payout.completed_at) {
            return false; // Already completed
        }

        // ✅ NEW: Check voting result for button display logic
        // Show Approve button only if voting result is 'approved'
        // Show Reject button if voting result is 'rejected' or 'failed'
        return payout.voting_result === 'approved' ||
            payout.voting_result === 'rejected' ||
            payout.voting_result === 'failed';
    }, [currentUser, poolSelected]);

    const getVotingResultDisplay = (payout, votingSettings) => {
        // If pool voting is disabled, show disabled status
        if (!votingSettings?.voting_enabled) {
            return {
                text: 'System Disabled',
                variant: 'secondary',
                icon: 'bi-slash-circle'
            };
        }

        // If payout doesn't have voting enabled
        if (!payout?.voting_enabled) {
            return {
                text: 'No Voting',
                variant: 'light',
                icon: 'bi-dash-circle'
            };
        }

        // Check voting status and result
        const votingStatus = payout?.voting_status || 'not_started';
        const votingResult = payout?.voting_result || 'pending';

        switch (votingStatus) {
            case 'active':
                return {
                    text: 'Voting Active',
                    variant: 'warning',
                    icon: 'bi-clock-history'
                };

            case 'completed':
                switch (votingResult) {
                    case 'approved':
                        return {
                            text: 'Approved',
                            variant: 'success',
                            icon: 'bi-check-circle'
                        };
                    case 'rejected':
                        return {
                            text: 'Rejected',
                            variant: 'danger',
                            icon: 'bi-x-circle'
                        };
                    case 'failed':
                        return {
                            text: 'Failed',
                            variant: 'danger',
                            icon: 'bi-exclamation-circle'
                        };
                    case 'cancelled':
                        return {
                            text: 'Cancelled',
                            variant: 'secondary',
                            icon: 'bi-slash-circle'
                        };
                    default:
                        return {
                            text: 'Pending Result',
                            variant: 'warning',
                            icon: 'bi-hourglass'
                        };
                }

            case 'cancelled':
                return {
                    text: 'Cancelled',
                    variant: 'secondary',
                    icon: 'bi-slash-circle'
                };

            case 'not_started':
                return {
                    text: 'Not Started',
                    variant: 'light',
                    icon: 'bi-dash-circle'
                };

            default:
                return {
                    text: 'Unknown',
                    variant: 'secondary',
                    icon: 'bi-question-circle'
                };
        }
    };

    const getVotingResultTooltip = (payout) => {
        if (!votingSettings?.voting_enabled) {
            return "Pool voting system is disabled. Contact pool owner to enable.";
        }

        if (!payout?.voting_enabled) {
            return "This payout was created without community voting.";
        }

        switch (payout.voting_result) {
            case 'approved':
                return "The community voted to approve this payout.";
            case 'rejected':
                return "The community voted to reject this payout.";
            case 'failed':
                return "Voting failed to meet requirements (quorum or threshold).";
            case 'cancelled':
                return "Voting was cancelled by the pool owner.";
            default:
                if (payout.voting_status === 'active') {
                    return "Voting is currently active. Community members can vote.";
                }
                return "Voting result is pending.";
        }
    };


    return (
        <>
            <main className="container-xl my-4 my-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button
                        className="btn btn-outline-secondary rounded-xl"
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                    <div>
                        <h5 className="fw-semibold mb-1">Pool Payouts Management</h5>
                        <p className="text-muted mb-0">Manage payouts, voting, and settings</p>
                    </div>
                    <div className="d-flex gap-2">
                        {(Object.keys(poolSelected).length > 0) && (currentUser?.user?.id === poolSelected?.poolOwner.id) && (
                            <Button
                                variant="outline-info"
                                className="rounded-xl"
                                onClick={() => setShowAnalyticsModal(true)}
                                disabled={payoutsLoading}
                            >
                                <i className="bi bi-graph-up me-1"></i> Analytics
                            </Button>
                        )}
                        {(Object.keys(poolSelected).length > 0) && (currentUser?.user?.id === poolSelected?.poolOwner.id) && (
                            <>
                                <Button
                                    variant="outline-secondary"
                                    className="rounded-xl"
                                    onClick={() => setShowSettingsModal(true)}
                                    disabled={payoutsLoading}
                                >
                                    <i className="bi bi-gear me-1"></i> Settings
                                </Button>
                                <Button
                                    variant="primary"
                                    className="rounded-xl"
                                    onClick={() => setShowPayoutModal(true)}
                                    disabled={payoutsLoading}
                                >
                                    <i className="bi bi-plus-circle me-1"></i> New Payout
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-2">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-sm text-muted">Total Payouts</div>
                                    <i className="bi bi-cash-stack text-success"></i>
                                </div>
                                <div className="fs-2 fw-bold mt-1">
                                    {formatCurrency(payoutStats?.totalPayouts || poolPayouts.reduce((sum, payout) => sum + (payout.amount || 0), 0))}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-2">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-sm text-muted">Completed</div>
                                    <i className="bi bi-check-circle-fill text-success"></i>
                                </div>
                                <div className="fs-2 fw-bold mt-1">
                                    {payoutStats?.byStatus?.find(s => s.status === 'completed')?.count ||
                                        poolPayouts.filter(p => p.status === 'completed').length}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-2">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-sm text-muted">Pending Voting</div>
                                    <i className="bi bi-clock-history text-warning"></i>
                                </div>
                                <div className="fs-2 fw-bold mt-1">
                                    {payoutStats?.byVotingStatus?.find(s => s.voting_status === 'active')?.count ||
                                        poolPayouts.filter(p => p.voting_status === 'active').length}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-2">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-sm text-muted">Voting Success</div>
                                    <i className="bi bi-graph-up-arrow text-info"></i>
                                </div>
                                <div className="fs-2 fw-bold mt-1">
                                    {calculateVotingSuccessRate()}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-2">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-sm text-muted">Daily Limit</div>
                                    <i className="bi bi-calendar-check text-primary"></i>
                                </div>
                                <div className="fs-2 fw-bold mt-1">
                                    {dailyLimit ? `${dailyLimit.used}/${dailyLimit.limit}` : '0/0'}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-2">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-sm text-muted">Voting Enabled</div>
                                    <i className={`bi ${votingSettings?.voting_enabled ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'}`}></i>
                                </div>
                                <div className="fs-2 fw-bold mt-1">
                                    {votingSettings?.voting_enabled ? 'Yes' : 'No'}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* Payouts Table */}
                {payoutsLoading ? (
                    <div className="d-flex justify-content-center my-5">
                        <Hourglass visible={true} height="50" width="50" />
                    </div>
                ) : (
                    <Card>
                        <Table hover className="mb-0">
                            {/* In the Table Header section, add a new column for Voting Result */}
                            <thead className="bg-light">
                                <tr>
                                    <th>Recipient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Voting Status</th>
                                    <th>Voting Result</th> {/* NEW COLUMN */}
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {poolPayouts && poolPayouts.length > 0 ? (
                                    poolPayouts.map((payout, index) => {
                                        const payoutId = payout?.id || `payout-${index}`;
                                        const recipient = getRecipientDisplay(payout);
                                        const amount = payout?.amount || 0;
                                        const status = payout?.status || 'unknown';
                                        const createdAt = payout?.createdAt || new Date().toISOString();
                                        const isPoolOwner = currentUser?.user?.id === poolSelected?.poolOwner?.id;

                                        // Get voting result display
                                        const votingResultDisplay = getVotingResultDisplay(payout, votingSettings);

                                        return (
                                            <tr key={payoutId}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={recipient.photo || "https://placehold.net/avatar.svg"}
                                                            alt="Recipient"
                                                            className="rounded-circle me-2"
                                                            style={{ width: "35px", height: "35px", objectFit: "cover" }}
                                                            onError={(e) => {
                                                                e.target.src = "https://placehold.net/avatar.svg";
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{recipient.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    {formatCurrency(amount)}
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusVariant(status)} className="rounded-pill">
                                                        {(status).toString().replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {(() => {
                                                        // Check if pool voting is enabled
                                                        const isPoolVotingEnabled = votingSettings?.voting_enabled;

                                                        if (!isPoolVotingEnabled) {
                                                            // Pool voting is disabled - show disabled status
                                                            return (
                                                                <Badge bg="secondary" className="rounded-pill">
                                                                    <i className="bi bi-slash-circle me-1"></i>
                                                                    System Disabled
                                                                </Badge>
                                                            );
                                                        }

                                                        // Pool voting is enabled, check payout voting status
                                                        if (!payout.voting_enabled) {
                                                            return <small className="text-muted">No voting</small>;
                                                        }

                                                        // Payout has voting enabled
                                                        return (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Badge bg={getVotingStatusVariant(payout.voting_status)} className="rounded-pill">
                                                                    {(payout.voting_status || 'not_started').toString().replace('_', ' ')}
                                                                </Badge>
                                                                {payout.voting_status === 'active' && payout.voting_ends_at && (
                                                                    <small className="text-muted">
                                                                        {formatTimeRemaining(payout.voting_ends_at)}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* NEW: Voting Result Column */}
                                                <td>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip id={`tooltip-${payoutId}`}>
                                                                {getVotingResultTooltip(payout)}
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Badge
                                                            bg={votingResultDisplay.variant}
                                                            className="rounded-pill d-flex align-items-center gap-1"
                                                            style={{ width: 'fit-content', cursor: 'help' }}
                                                        >
                                                            <i className={`bi ${votingResultDisplay.icon}`}></i>
                                                            {votingResultDisplay.text}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                </td>

                                                <td>
                                                    <div className="text-sm">
                                                        {moment(createdAt).format("MMM Do YYYY")}
                                                    </div>
                                                    <small className="text-muted">
                                                        {moment(createdAt).format("h:mm A")}
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        {/* View Details Button (always shown) */}
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="rounded-xl"
                                                            onClick={() => handleViewPayoutDetails(payout)}
                                                            disabled={votingLoading}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </Button>

                                                        {shouldShowVoteButton(payout) === null ? (
                                                            // Loading state
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="rounded-xl"
                                                                disabled
                                                            >
                                                                <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                                                            </Button>
                                                        ) : shouldShowVoteButton(payout) ? (
                                                            <Button
                                                                variant="outline-info"
                                                                size="sm"
                                                                className="rounded-xl"
                                                                onClick={() => {
                                                                    setSelectedPayout(payout);
                                                                    setShowVotingModal(true);
                                                                }}
                                                                disabled={votingLoading}
                                                            >
                                                                <i className="bi bi-check2-all"></i> Vote
                                                            </Button>
                                                        ) : null}

                                                        {/* Voting Results Button - Update condition */}
                                                        {payout?.voting_enabled &&
                                                            votingSettings?.voting_enabled &&
                                                            (payout?.voting_status === 'completed' || payout?.voting_status === 'active') && (
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="rounded-xl"
                                                                    onClick={() => {
                                                                        setSelectedPayout(payout);
                                                                        setShowVotingResultsModal(true);
                                                                    }}
                                                                    disabled={votingLoading}
                                                                >
                                                                    <i className="bi bi-graph-up"></i> Results
                                                                </Button>
                                                            )}

                                                        {/* Pool Owner Actions (existing logic) */}
                                                        {isPoolOwner && (
                                                            <>
                                                                {payout.status === 'pending' && payout.voting_status === 'not_started' && (
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        size="sm"
                                                                        className="rounded-xl"
                                                                        onClick={() => handleStartVoting(payout.id)}
                                                                        disabled={votingLoading || !votingSettings?.voting_enabled}
                                                                    >
                                                                        <i className="bi bi-play-circle"></i> Start Vote
                                                                    </Button>
                                                                )}

                                                                {/* Approve/Reject Buttons - show when status=processing AND voting_status=completed */}
                                                                {shouldShowApproveRejectButtons(payout) && (
                                                                    <div className="d-flex gap-1">
                                                                        {/* Show Approve button only if voting result is 'approved' */}
                                                                        {payout.voting_result === 'approved' && (
                                                                            <Button
                                                                                variant="success"
                                                                                size="sm"
                                                                                className="rounded-xl"
                                                                                onClick={() => handleUpdatePayoutStatus(payout.id, 'completed')}
                                                                                disabled={payoutsLoading}
                                                                            >
                                                                                <i className="bi bi-check-lg"></i> Approve
                                                                            </Button>
                                                                        )}

                                                                        {/* Show Reject button if voting result is 'rejected' or 'failed' */}
                                                                        {(payout.voting_result === 'rejected' || payout.voting_result === 'failed') && (
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                className="rounded-xl"
                                                                                onClick={() => {
                                                                                    setPayoutToFail(payout);
                                                                                    setShowFailureModal(true);
                                                                                }}
                                                                                disabled={payoutsLoading}
                                                                            >
                                                                                <i className="bi bi-x-lg"></i> Reject
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {(status === 'pending' || status === 'pending_voting') && (
                                                                    <Button
                                                                        variant="outline-dark"
                                                                        size="sm"
                                                                        className="rounded-xl"
                                                                        onClick={() => handleCancelPayout(payoutId, 'Cancelled by pool owner')}
                                                                        disabled={payoutsLoading}
                                                                    >
                                                                        <i className="bi bi-x-circle"></i>
                                                                    </Button>
                                                                )}

                                                            </>)}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5"> {/* Updated colSpan to 7 */}
                                            <i className="bi bi-cash-coin display-4 text-muted"></i>
                                            <p className="text-muted mt-3">No payouts yet</p>
                                            <small className="text-muted">
                                                Create your first payout to get started
                                            </small>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                )}
            </main>

            {/* Create Payout Modal */}
            <Modal show={showPayoutModal} onHide={() => setShowPayoutModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-cash-coin me-2"></i> Create New Payout
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            recipientId: "",
                            amount: "",
                            description: "",
                            enableVoting: votingSettings?.voting_enabled || false
                        }}
                        validationSchema={Yup.object().shape({
                            recipientId: Yup.string().required("Recipient is required"),
                            amount: Yup.number()
                                .required("Amount is required")
                                .min(payoutSettings?.min_payout_amount || 1, `Amount must be at least ${formatCurrency(payoutSettings?.min_payout_amount || 1)}`)
                                .max(payoutSettings?.max_payout_amount || (poolSelected?.total_contributed || 10000), `Amount cannot exceed ${formatCurrency(payoutSettings?.max_payout_amount || (poolSelected?.total_contributed || 10000))}`),
                            description: Yup.string().required("Description is required")
                        })}
                        onSubmit={handleCreatePayout}
                    >
                        {({ errors, touched, values, setFieldValue, isSubmitting }) => (
                            <Form>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Recipient</label>
                                        <Field
                                            as="select"
                                            name="recipientId"
                                            className={`form-select rounded-xl ${errors.recipientId && touched.recipientId ? 'is-invalid' : ''}`}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Select a member</option>
                                            {(eligibleMembers || []).map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.username} - {formatCurrency(member.availableBalance)}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="recipientId" component="div" className="text-danger mt-1" />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Amount</label>
                                        <div className="input-group">
                                            <span className="input-group-text">$</span>
                                            <Field
                                                type="number"
                                                name="amount"
                                                className={`form-control ${errors.amount && touched.amount ? 'is-invalid' : ''}`}
                                                placeholder="Enter amount"
                                                step="0.01"
                                                disabled={isSubmitting}
                                                onBlur={(e) => validateAmount(e.target.value)}
                                            />
                                        </div>
                                        <ErrorMessage name="amount" component="div" className="text-danger mt-1" />
                                        {!amountValidation.isValid && (
                                            <Alert variant="danger" className="mt-2 py-2">
                                                <small>{amountValidation.errors.join(', ')}</small>
                                            </Alert>
                                        )}
                                        <small className="text-muted">
                                            Pool balance: {formatCurrency(poolSelected?.total_contributed || 0)} |
                                            Min: {formatCurrency(payoutSettings?.min_payout_amount || 1)} |
                                            Max: {formatCurrency(payoutSettings?.max_payout_amount || (poolSelected?.total_contributed || 10000))}
                                        </small>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Description</label>
                                        <Field
                                            as="textarea"
                                            name="description"
                                            rows="3"
                                            className={`form-control rounded-xl ${errors.description && touched.description ? 'is-invalid' : ''}`}
                                            placeholder="Describe the purpose of this payout"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="description" component="div" className="text-danger mt-1" />
                                    </div>

                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <Field
                                                type="checkbox"
                                                name="enableVoting"
                                                className="form-check-input"
                                                id="enableVoting"
                                                onChange={(e) => {
                                                    setFieldValue('enableVoting', e.target.checked);
                                                    setEnableVoting(e.target.checked);
                                                }}
                                                disabled={!votingSettings?.voting_enabled || isSubmitting}
                                                checked={values.enableVoting}
                                            />
                                            <label className="form-check-label fw-semibold" htmlFor="enableVoting">
                                                Enable Community Voting
                                                {!votingSettings?.voting_enabled && (
                                                    <small className="text-warning ms-2">(Voting system is disabled in settings)</small>
                                                )}
                                            </label>
                                        </div>
                                        <small className="text-muted">
                                            When enabled, pool members must vote to approve this payout before it can be processed.
                                        </small>
                                    </div>

                                    {values.enableVoting && votingSettings?.voting_enabled && (
                                        <div className="col-12">
                                            <Alert variant="info" className="mb-0">
                                                <i className="bi bi-info-circle me-2"></i>
                                                <strong>Voting Enabled: </strong> This payout will require approval from pool members through voting.
                                                The voting period will be {votingSettings?.voting_duration || 72} hours.
                                                Approval requires {votingSettings?.voting_threshold || 51}% of votes.
                                            </Alert>
                                        </div>
                                    )}

                                    {dailyLimit && (
                                        <div className="col-12">
                                            <Alert variant={dailyLimit.exceeded ? 'warning' : 'success'} className="mb-0">
                                                <i className={`bi ${dailyLimit.exceeded ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-2`}></i>
                                                <strong>Daily Payouts: </strong> {dailyLimit.used}/{dailyLimit.limit} used today
                                                {dailyLimit.exceeded && ' - Limit exceeded!'}
                                            </Alert>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex gap-2 justify-content-end">
                                        <Button
                                            variant="outline-secondary"
                                            className="rounded-xl"
                                            onClick={() => setShowPayoutModal(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="rounded-xl"
                                            disabled={isSubmitting || (dailyLimit?.exceeded && ((Object.keys(poolSelected).length > 0) && (currentUser?.user?.id === poolSelected?.poolOwner.id)))}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-cash-coin me-1"></i> Create Payout
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>

            {/* Settings Modal */}
            <SettingsModal
                show={showSettingsModal}
                onHide={() => setShowSettingsModal(false)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                payoutSettings={payoutSettings}
                votingSettings={votingSettings}
                onUpdatePayoutSettings={handleUpdatePayoutSettings}
                onUpdateVotingSettings={handleUpdateVotingSettings}
                onToggleVoting={handleToggleVoting}
                payoutSettingsLoading={payoutSettingsLoading}
                settingsLoading={settingsLoading}
            />

            {/* Analytics Modal */}
            <AnalyticsModal
                show={showAnalyticsModal}
                onHide={() => setShowAnalyticsModal(false)}
                payoutStats={payoutStats}
                votingAnalytics={votingAnalytics}
                payoutSettingsAnalytics={payoutSettingsAnalytics}
                poolPayouts={poolPayouts}
            />

            {/* Voting Results Modal */}
            <VotingResultsModal
                show={showVotingResultsModal}
                onHide={() => setShowVotingResultsModal(false)}
                selectedPayout={selectedPayout}
                votingResults={votingResults}
            />

            {/* Voting Modal */}
            <VotingModal
                show={showVotingModal}
                onHide={() => setShowVotingModal(false)}
                selectedPayout={selectedPayout}
                onCastVote={handleCastVote}
                votingLoading={votingLoading}
                formatCurrency={formatCurrency}
                formatTimeRemaining={formatTimeRemaining}
            />

            {/* Payout Details Modal */}
            <PayoutDetailsModal
                show={showPayoutDetailsModal}
                onHide={() => setShowPayoutDetailsModal(false)}
                selectedPayout={selectedPayout}
                canUserVoteOnPayout={canUserVoteOnPayout}
                isVotingActive={isVotingActive}
                votingLoading={votingLoading}
                onShowVotingModal={() => setShowVotingModal(true)}
                getRecipientDisplay={getRecipientDisplay}
                getStatusVariant={getStatusVariant}
                getVotingStatusVariant={getVotingStatusVariant}
                getVotingResultVariant={getVotingResultVariant}
                formatCurrency={formatCurrency}
                formatTimeRemaining={formatTimeRemaining}
            />

            {/* Failure Reason Modal */}
            <FailureReasonModal
                show={showFailureModal}
                onHide={() => {
                    setShowFailureModal(false);
                    setPayoutToFail(null);
                }}
                payout={payoutToFail}
                onSubmit={handleFailPayout}
                formatCurrency={formatCurrency}
            />
        </>
    );
};



const SettingsModal = ({
    show, onHide, activeTab, setActiveTab,
    payoutSettings, votingSettings,
    onUpdatePayoutSettings, onUpdateVotingSettings, onToggleVoting,
    payoutSettingsLoading, settingsLoading
}) => (
    <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>
                <i className="bi bi-gear me-2"></i> Pool Settings
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="payout" title="Payout Settings">
                    <PayoutSettingsForm
                        settings={payoutSettings}
                        onUpdate={onUpdatePayoutSettings}
                        loading={payoutSettingsLoading}
                    />
                </Tab>
                <Tab eventKey="voting" title="Voting Settings">
                    <VotingSettingsForm
                        settings={votingSettings}
                        onUpdate={onUpdateVotingSettings}
                        onToggle={onToggleVoting}
                        loading={settingsLoading}
                    />
                </Tab>
            </Tabs>
        </Modal.Body>
    </Modal>
);

const AnalyticsModal = ({ show, onHide, payoutStats, votingAnalytics, payoutSettingsAnalytics, poolPayouts }) => (
    <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
            <Modal.Title>
                <i className="bi bi-graph-up me-2"></i> Pool Analytics
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <AnalyticsDashboard
                payoutStats={payoutStats}
                votingAnalytics={votingAnalytics}
                payoutSettingsAnalytics={payoutSettingsAnalytics}
                poolPayouts={poolPayouts}
            />
        </Modal.Body>
    </Modal>
);

const VotingResultsModal = ({ show, onHide, selectedPayout, votingResults }) => {
    const votes = votingResults?.votes || [];
    return (<Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>
                <i className="bi bi-graph-up me-2"></i> Voting Results
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {selectedPayout && (
                <div className="row g-3">
                    <div className="col-12">
                        <h6 className="fw-semibold mb-3">Payout to {selectedPayout.recipient?.username || 'Unknown'}</h6>
                    </div>

                    <div className="col-md-6">
                        <Card className="border-0 bg-light">
                            <Card.Body className="text-center">
                                <div className="fs-2 fw-bold text-success">
                                    {(selectedPayout.approval_percentage ?? 0).toFixed(1)}%
                                </div>
                                <small className="text-muted">Approval Rate</small>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-md-6">
                        <Card className="border-0 bg-light">
                            <Card.Body className="text-center">
                                <div className="fs-2 fw-bold text-primary">
                                    {selectedPayout.total_votes ?? 0}
                                </div>
                                <small className="text-muted">Total Votes</small>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-12">
                        <h6 className="fw-semibold mb-2">Vote Distribution</h6>
                        <div className="progress mb-2" style={{ height: '30px' }}>
                            <div
                                className="progress-bar bg-success"
                                style={{ width: `${((selectedPayout.approve_votes || 0) / ((selectedPayout.total_votes || 1))) * 100}%` }}
                            >
                                {selectedPayout.approve_votes || 0} Approve
                            </div>
                            <div
                                className="progress-bar bg-danger"
                                style={{ width: `${((selectedPayout.reject_votes || 0) / ((selectedPayout.total_votes || 1))) * 100}%` }}
                            >
                                {selectedPayout.reject_votes || 0} Reject
                            </div>
                            <div
                                className="progress-bar bg-warning"
                                style={{ width: `${((selectedPayout.abstain_votes || 0) / ((selectedPayout.total_votes || 1))) * 100}%` }}
                            >
                                {selectedPayout.abstain_votes || 0} Abstain
                            </div>
                        </div>
                    </div>

                    {/* Safely check for votes array */}
                    {votes.length > 0 ? (
                        <div className="col-12">
                            <h6 className="fw-semibold mb-3">Recent Votes</h6>
                            <div className="list-group">
                                {votes.slice(0, 5).map((vote, index) => (
                                    <div key={vote.id || index} className="list-group-item border-0 bg-light mb-2 rounded">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={vote.voter?.photo_id || "https://placehold.net/avatar. svg"}
                                                alt="Voter"
                                                className="rounded-circle me-3"
                                                style={{ width: "35px", height: "35px", objectFit: "cover" }}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{vote.voter?.username || 'Unknown Voter'}</div>
                                            </div>
                                            <Badge
                                                bg={vote.vote_type === 'approve' ? 'success' : vote.vote_type === 'reject' ? 'danger' : 'warning'}
                                                className="rounded-pill"
                                            >
                                                {vote.vote_type || 'unknown'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="col-12">
                            <div className="text-center py-3">
                                <i className="bi bi-info-circle text-muted fs-1"></i>
                                <p className="text-muted mt-2">No votes recorded yet</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" className="rounded-xl" onClick={onHide}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
    );
};

const VotingModal = ({ show, onHide, selectedPayout, onCastVote, votingLoading, formatCurrency, formatTimeRemaining }) => {
    const [isCasting, setIsCasting] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null);

    const handleVoteClick = (voteType) => {
        if (!selectedPayout || isCasting) return;

        setSelectedVote(voteType);
        setIsCasting(true);

        onCastVote(selectedPayout.id, voteType).finally(() => {
            setIsCasting(false);
            setSelectedVote(null);
        });
    };


    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-check2-all me-2"></i> Cast Your Vote
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedPayout && (
                    <div className="text-center">
                        <h6 className="fw-semibold mb-3">Vote on Payout to {selectedPayout.recipient?.username || 'Unknown'}</h6>
                        <p className="text-muted mb-4">
                            Amount: <strong>{formatCurrency(selectedPayout.amount)}</strong>
                            <br />
                            {selectedPayout.description}
                        </p>

                        <div className="row g-3">
                            <div className="col-4">
                                <Button
                                    variant="success"
                                    className="w-100 rounded-xl py-3"
                                    onClick={() => handleVoteClick('approve')}
                                    disabled={votingLoading || isCasting}
                                >
                                    {isCasting && selectedVote === 'approve' ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2"></div>
                                            Voting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg fs-4 d-block mb-1"></i>
                                            Approve
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="col-4">
                                <Button
                                    variant="outline-secondary"
                                    className="w-100 rounded-xl py-3"
                                    onClick={() => onCastVote(selectedPayout.id, 'abstain')}
                                    disabled={votingLoading}
                                >
                                    <i className="bi bi-dash-lg fs-4 d-block mb-1"></i>
                                    Abstain
                                </Button>
                            </div>
                            <div className="col-4">
                                <Button
                                    variant="danger"
                                    className="w-100 rounded-xl py-3"
                                    onClick={() => onCastVote(selectedPayout.id, 'reject')}
                                    disabled={votingLoading}
                                >
                                    <i className="bi bi-x-lg fs-4 d-block mb-1"></i>
                                    Reject
                                </Button>
                            </div>
                        </div>

                        {selectedPayout.voting_ends_at && (
                            <div className="mt-3 text-muted">
                                <small>
                                    Voting ends:  {moment(selectedPayout.voting_ends_at).format("MMM Do, h:mm A")}
                                    <br />
                                    ({formatTimeRemaining(selectedPayout.voting_ends_at)} remaining)
                                </small>
                            </div>
                        )}
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

const PayoutDetailsModal = ({
    show, onHide, selectedPayout, canUserVoteOnPayout, isVotingActive,
    votingLoading, onShowVotingModal, getRecipientDisplay,
    getStatusVariant, getVotingStatusVariant, getVotingResultVariant,
    formatCurrency, formatTimeRemaining
}) => {
    const recipient = selectedPayout ? getRecipientDisplay(selectedPayout) : { name: 'Unknown', email: '', photo: null };

    const [eligibility, setEligibility] = useState(null);
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkVotingEligibility = async () => {
            if (!selectedPayout || !isVotingActive(selectedPayout)) {
                if (isMounted) {
                    setEligibility(null);
                    setCheckingEligibility(false);
                }
                return;
            }

            if (isMounted) setCheckingEligibility(true);

            try {
                const eligibilityData = await canUserVoteOnPayout(selectedPayout);
                if (isMounted) {
                    setEligibility(eligibilityData);
                    setCheckingEligibility(false);
                }
            } catch (error) {
                console.error('Error checking voting eligibility:', error);
                if (isMounted) {
                    setEligibility({
                        canVote: false,
                        hasVoted: false,
                        reason: 'Error checking eligibility'
                    });
                    setCheckingEligibility(false);
                }
            }
        };

        checkVotingEligibility();

        return () => {
            isMounted = false;
        };
    }, [selectedPayout, canUserVoteOnPayout, isVotingActive]);


    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-info-circle me-2"></i> Payout Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedPayout ? (
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="d-flex align-items-center mb-3">
                                <img
                                    src={recipient.photo || "https://placehold.net/avatar.svg"}
                                    alt="Recipient"
                                    className="rounded-circle me-3"
                                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                />
                                <div>
                                    <h6 className="fw-bold mb-1">{recipient.name}</h6>
                                    <p className="text-muted mb-0">{recipient.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <Card className="border-0 bg-light">
                                <Card.Body className="py-3">
                                    <small className="text-muted d-block">Amount</small>
                                    <div className="fw-bold fs-5 text-success">
                                        {formatCurrency(selectedPayout.amount)}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="col-md-6">
                            <Card className="border-0 bg-light">
                                <Card.Body className="py-3">
                                    <small className="text-muted d-block">Status</small>
                                    <div>
                                        <Badge bg={getStatusVariant(selectedPayout.status)} className="rounded-pill">
                                            {(selectedPayout.status || '').toString().replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        {/* Failure Reason Display */}
                        {selectedPayout.status === 'failed' && selectedPayout.failureReason && (
                            <div className="col-12">
                                <Card className="border-0 bg-danger bg-opacity-10">
                                    <Card.Body className="py-3">
                                        <small className="text-danger d-block fw-semibold">
                                            <i className="bi bi-exclamation-triangle me-1"></i> Failure Reason
                                        </small>
                                        <p className="fw-medium mb-0 text-dark mt-2">
                                            {selectedPayout.failureReason}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </div>
                        )}

                        {/* Voting information */}
                        {selectedPayout.voting_enabled && (
                            <div className="col-12">
                                <Card className="border-0 bg-info bg-opacity-10">
                                    <Card.Body>
                                        <h6 className="fw-semibold mb-3">
                                            <i className="bi bi-check2-all me-2"></i> Voting Information
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <small className="text-muted d-block">Voting Status</small>
                                                <Badge bg={getVotingStatusVariant(selectedPayout.voting_status)}>
                                                    {(selectedPayout.voting_status || '').toString().replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted d-block">Final Result</small>
                                                <Badge bg={getVotingResultVariant(selectedPayout.voting_result)}>
                                                    {selectedPayout.voting_result || 'Pending'}
                                                </Badge>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted d-block">Approval</small>
                                                <div className="fw-bold">{(selectedPayout.approval_percentage ?? 0).toFixed(1)}%</div>
                                            </div>
                                            <div className="col-12">
                                                <small className="text-muted d-block">Vote Distribution</small>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="text-success">
                                                        <i className="bi bi-check-lg me-1"></i>
                                                        {selectedPayout.approve_votes || 0} Approve
                                                    </span>
                                                    <span className="text-danger">
                                                        <i className="bi bi-x-lg me-1"></i>
                                                        {selectedPayout.reject_votes || 0} Reject
                                                    </span>
                                                    <span className="text-warning">
                                                        <i className="bi bi-dash-lg me-1"></i>
                                                        {selectedPayout.abstain_votes || 0} Abstain
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedPayout.voting_ends_at && (
                                                <div className="col-12">
                                                    <small className="text-muted d-block">
                                                        Voting {selectedPayout.voting_status === 'active' ? 'ends' : 'ended'}
                                                    </small>
                                                    <div className="fw-medium">
                                                        {moment(selectedPayout.voting_ends_at).format("MMM Do YYYY, h:mm A")}
                                                        {selectedPayout.voting_status === 'active' && (
                                                            <span className="text-warning ms-2">
                                                                ({formatTimeRemaining(selectedPayout.voting_ends_at)} remaining)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        )}

                        <div className="col-12">
                            <Card className="border-0 bg-light">
                                <Card.Body className="py-3">
                                    <small className="text-muted d-block">Description</small>
                                    <p className="fw-medium mb-0">{selectedPayout.description}</p>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="col-md-6">
                            <small className="text-muted d-block">Created Date</small>
                            <div className="fw-medium">
                                {moment(selectedPayout.createdAt).format("MMM Do YYYY, h:mm A")}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <small className="text-muted d-block">Last Updated</small>
                            <div className="fw-medium">
                                {moment(selectedPayout.updatedAt).format("MMM Do YYYY, h:mm A")}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <i className="bi bi-exclamation-triangle text-warning display-4"></i>
                        <p className="text-muted mt-3">No payout details available</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                {/* Updated: Use the state value instead of calling the async function directly */}
                {selectedPayout &&
                    !['failed', 'completed', 'cancelled'].includes(selectedPayout.status) &&
                    eligibility?.canVote === true &&
                    eligibility?.hasVoted === false &&
                    !checkingEligibility && (
                        <Button
                            variant="info"
                            className="rounded-xl"
                            onClick={onShowVotingModal}
                            disabled={votingLoading}
                        >
                            <i className="bi bi-check2-all me-1"></i> Cast Vote
                        </Button>
                    )}
                <Button
                    variant="primary"
                    className="rounded-xl"
                    onClick={onHide}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const PayoutSettingsForm = ({ settings = {}, onUpdate, loading }) => {
    return (
        <Formik
            enableReinitialize
            initialValues={{
                max_payout_amount: settings?.max_payout_amount ?? 10000,
                min_payout_amount: settings?.min_payout_amount ?? 1,
                require_approval: settings?.require_approval ?? false,
                approval_threshold: settings?.approval_threshold ?? 500,
                max_daily_payouts: settings?.max_daily_payouts ?? 10,
                allowed_payout_methods: settings?.allowed_payout_methods ?? ['bank_transfer', 'paypal']
            }}
            onSubmit={(values, { setSubmitting }) => {
                onUpdate(values);
                setSubmitting(false);
            }}
        >
            {({ values }) => (
                <Form>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Max Payout Amount</label>
                            <Field
                                type="number"
                                name="max_payout_amount"
                                className="form-control"
                                step="0.01"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Min Payout Amount</label>
                            <Field
                                type="number"
                                name="min_payout_amount"
                                className="form-control"
                                step="0.01"
                            />
                        </div>
                        <div className="col-12">
                            <div className="form-check form-switch">
                                <Field
                                    type="checkbox"
                                    name="require_approval"
                                    className="form-check-input"
                                    id="require_approval"
                                />
                                <label className="form-check-label fw-semibold" htmlFor="require_approval">
                                    Require Approval for Large Payouts
                                </label>
                            </div>
                        </div>
                        {values.require_approval && (
                            <div className="col-12">
                                <label className="form-label fw-semibold">Approval Threshold</label>
                                <Field
                                    type="number"
                                    name="approval_threshold"
                                    className="form-control"
                                    step="0.01"
                                />
                            </div>
                        )}
                        <div className="col-12">
                            <label className="form-label fw-semibold">Max Daily Payouts</label>
                            <Field
                                type="number"
                                name="max_daily_payouts"
                                className="form-control"
                            />
                        </div>
                        <div className="col-12">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Settings'}
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

const VotingSettingsForm = ({ settings = {}, onUpdate, onToggle, loading }) => {
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Voting System</h6>
                <Button
                    variant={settings?.voting_enabled ? 'danger' : 'success'}
                    onClick={() => onToggle(!settings?.voting_enabled)}
                    disabled={loading}
                >
                    {settings?.voting_enabled ? 'Disable Voting' : 'Enable Voting'}
                </Button>
            </div>

            <Formik
                enableReinitialize
                initialValues={{
                    voting_threshold: settings?.voting_threshold ?? 51,
                    voting_duration: settings?.voting_duration ?? 72,
                    min_voters: settings?.min_voters ?? 1,
                    voting_type: settings?.voting_type ?? 'one_member_one_vote',
                    auto_approve: settings?.auto_approve ?? false,
                    allow_abstain: settings?.allow_abstain ?? true,
                    require_quorum: settings?.require_quorum ?? false,
                    quorum_percentage: settings?.quorum_percentage ?? 50
                }}
                onSubmit={(values, { setSubmitting }) => {
                    onUpdate(values);
                    setSubmitting(false);
                }}
            >
                {({ values }) => (
                    <Form>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Voting Threshold (%)</label>
                                <Field
                                    type="number"
                                    name="voting_threshold"
                                    className="form-control"
                                    min="1"
                                    max="100"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Voting Duration (hours)</label>
                                <Field
                                    type="number"
                                    name="voting_duration"
                                    className="form-control"
                                    min="1"
                                    max="720"
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-semibold">Voting Type</label>
                                <Field as="select" name="voting_type" className="form-select">                                   
                                    <option value="one_member_one_vote">One Member, One Vote</option>
                                    <option value="one_share_one_vote">One Share, One Vote</option>
                                    <option value="weighted_by_contribution">Weighted by Contribution</option>
                                </Field>
                            </div>
                            <div className="col-12">
                                <div className="form-check form-switch">
                                    <Field
                                        type="checkbox"
                                        name="auto_approve"
                                        className="form-check-input"
                                        id="auto_approve"
                                    />
                                    <label className="form-check-label fw-semibold" htmlFor="auto_approve">
                                        Auto-approve when threshold met
                                    </label>
                                </div>
                            </div>
                            <div className="col-12">
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Updating.. .' : 'Update Voting Settings'}
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

const AnalyticsDashboard = ({ payoutStats = {}, votingAnalytics = {}, payoutSettingsAnalytics = {}, poolPayouts = [] }) => {
    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    // Helper function to format percentages
    const formatPercent = (value) => {
        return `${parseFloat(value || 0).toFixed(1)}%`;
    };

    // Calculate total payouts if not provided
    const totalPayouts = payoutStats?.totalPayouts || poolPayouts.reduce((s, p) => s + (p.amount || 0), 0);

    // Extract voting analytics with fallbacks
    const {
        total_voting_payouts = 0,
        total_votes = 0,
        total_eligible_voters = 0,
        payout_outcomes = {},
        overall_approval_rate = 0,
        average_approval_rate = 0,
        average_participation = 0,
        voting_efficiency = 0,
        vote_distribution = {},
        recent_activity = {},
        most_active_voters = [],
        performance = {}
    } = votingAnalytics;

    const {
        approved = 0,
        rejected = 0,
        pending = 0
    } = payout_outcomes;

    const {
        approve_percentage = 0,
        reject_percentage = 0,
        abstain_percentage = 0
    } = vote_distribution;

    const {
        quorum_achievement_rate = 0,
        average_voting_duration = 0,
        success_rate = 0
    } = performance;

    return (
        <div className="row g-3">
            {/* Main Statistics Row */}
            <div className="col-md-3">
                <Card className="h-100">
                    <Card.Header className="bg-primary text-white">
                        <h6 className="mb-0">Total Payouts</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <h4 className="text-primary">{formatCurrency(totalPayouts)}</h4>
                        <small className="text-muted">Total Amount Distributed</small>
                    </Card.Body>
                </Card>
            </div>

            <div className="col-md-3">
                <Card className="h-100">
                    <Card.Header className="bg-success text-white">
                        <h6 className="mb-0">Voting Activity</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <h4 className="text-success">{total_votes}</h4>
                        <small className="text-muted">Total Votes Cast</small>
                        <div className="mt-2">
                            <small className="text-muted">
                                {recent_activity?.votes_last_30_days || 0} votes in last 30 days
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="col-md-3">
                <Card className="h-100">
                    <Card.Header className="bg-info text-white">
                        <h6 className="mb-0">Approval Rate</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <h4 className="text-info">{formatPercent(overall_approval_rate)}</h4>
                        <small className="text-muted">Overall Approval</small>
                        <div className="mt-2">
                            <small className="text-muted">
                                Avg: {formatPercent(average_approval_rate)}
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="col-md-3">
                <Card className="h-100">
                    <Card.Header className="bg-warning text-white">
                        <h6 className="mb-0">Participation</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <h4 className="text-warning">{formatPercent(average_participation)}</h4>
                        <small className="text-muted">Average Participation</small>
                        <div className="mt-2">
                            <small className="text-muted">
                                {total_eligible_voters} eligible voters
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Payout Outcomes Row */}
            <div className="col-md-4">
                <Card className="h-100">
                    <Card.Header>
                        <h6 className="mb-0">Payout Outcomes</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Approved: </span>
                            <strong className="text-success">{approved}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Rejected:</span>
                            <strong className="text-danger">{rejected}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Pending: </span>
                            <strong className="text-warning">{pending}</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <span>Total Voting Payouts:</span>
                            <strong>{total_voting_payouts}</strong>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Vote Distribution */}
            <div className="col-md-4">
                <Card className="h-100">
                    <Card.Header>
                        <h6 className="mb-0">Vote Distribution</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-success">Approve:</span>
                            <strong>{formatPercent(approve_percentage)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-danger">Reject: </span>
                            <strong>{formatPercent(reject_percentage)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-info">Abstain:</span>
                            <strong>{formatPercent(abstain_percentage)}</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <span>Voting Efficiency:</span>
                            <strong className="text-success">{formatPercent(voting_efficiency)}</strong>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Performance Metrics */}
            <div className="col-md-4">
                <Card className="h-100">
                    <Card.Header>
                        <h6 className="mb-0">Performance Metrics</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Quorum Achievement:</span>
                            <strong className="text-success">{formatPercent(quorum_achievement_rate)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Success Rate:</span>
                            <strong className="text-success">{formatPercent(success_rate)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Avg Voting Duration:</span>
                            <strong>{average_voting_duration ? `${average_voting_duration}h` : 'N/A'}</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <span>Active Voters:</span>
                            <strong>{most_active_voters.length}</strong>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Recent Activity Chart */}
            {recent_activity?.daily_votes && recent_activity.daily_votes.length > 0 && (
                <div className="col-12">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">Recent Voting Activity (Last 7 Days)</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                {recent_activity.daily_votes.map((day, index) => (
                                    <div key={index} className="col">
                                        <div className="text-center">
                                            <div className="fw-bold">{day.votes}</div>
                                            <small className="text-muted d-block">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
                                            <div className="mt-1">
                                                <small className="text-success">{day.approves}✓</small>
                                                <small className="text-danger ms-2">{day.rejects}✗</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Most Active Voters */}
            {most_active_voters.length > 0 && (
                <div className="col-12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">🏆 Most Active Voters</h6>
                            <span className="badge bg-primary">{most_active_voters.length} voters</span>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                {most_active_voters.map((voter, index) => (
                                    <div key={voter.voter?.id || index} className="col-lg-6 col-xl-4 mb-3">
                                        <div className="d-flex align-items-center p-3 border rounded bg-light">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center mb-1">
                                                    <span className="fw-bold text-dark me-2">
                                                        #{index + 1} {voter.voter?.username || 'Unknown User'}
                                                    </span>
                                                    {index < 3 && (
                                                        <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-danger'}`}>
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        {voter.voteCount} vote{voter.voteCount !== 1 ? 's' : ''}
                                                    </small>
                                                    <small className="text-muted">
                                                        Last:  {new Date(voter.lastVoted).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
};

const FailureReasonModal = ({ show, onHide, payout, onSubmit, formatCurrency }) => {
    const [failureReason, setFailureReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!failureReason.trim()) {
            alert('Please provide a failure reason');
            return;
        }
        setIsSubmitting(true);
        onSubmit(payout?.id, failureReason);
        setFailureReason('');
        setIsSubmitting(false);
    };

    const handleClose = () => {
        setFailureReason('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-x-circle me-2 text-danger"></i> Mark Payout as Failed
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {payout && (
                    <>
                        <Alert variant="warning" className="mb-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            You are about to mark this payout as failed.  This action cannot be undone.
                        </Alert>

                        <div className="mb-3">
                            <strong>Recipient:</strong> {payout.recipient?.username || 'Unknown'}
                            <br />
                            <strong>Amount:</strong> {formatCurrency(payout.amount)}
                            <br />
                            <strong>Description:</strong> {payout.description}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Failure Reason <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Enter the reason why this payout failed (e.g., insufficient funds, invalid account, etc.)"
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <small className="text-muted">
                                This reason will be visible to the recipient and other administrators.
                            </small>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="outline-secondary"
                    className="rounded-xl"
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    className="rounded-xl"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !failureReason.trim()}
                >
                    {isSubmitting ? (
                        <>
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            Marking as Failed...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-x-circle me-1"></i> Mark as Failed
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Payouts;