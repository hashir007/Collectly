import classNames from "./poolMember.module.css";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import { Hourglass } from 'react-loader-spinner';
import { Modal, Card, Badge, Table, Button, Dropdown } from 'react-bootstrap';
import moment from "moment";
import {
    getMemberDetails,
    updateMemberRole,
    removeMemberFromPool,
    getMemberContributions,
    getMemberActivity,
    clearMemberState
} from "../../slices/pool";

const PoolMember = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const memberId = searchParams.get("memberId");
    const poolId = searchParams.get("poolId");

    const {
        memberDetails,
        memberContributions,
        memberActivity,
        loading
    } = useSelector((state) => state.pool);

    const [activeTab, setActiveTab] = useState('overview');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (memberId && poolId) {
            dispatch(getMemberDetails({ poolID: poolId, memberID: memberId }));
            dispatch(getMemberContributions({ poolID: poolId, memberID: memberId }));
            dispatch(getMemberActivity({ poolID: poolId, memberID: memberId }));
        }

        // Cleanup function to clear member state when component unmounts
        return () => {
            dispatch(clearMemberState());
        };
    }, [dispatch, memberId, poolId]);

    const handleRoleUpdate = useCallback((newRole) => {
        dispatch(updateMemberRole({
            poolID: poolId,
            memberID: memberId,
            role: newRole
        })).then(() => {
            setShowRoleModal(false);
            // Refresh member details to get updated role
            dispatch(getMemberDetails({ poolID: poolId, memberID: memberId }));
        });
    }, [dispatch, memberId, poolId]);

    const handleRemoveMember = useCallback(() => {
        dispatch(removeMemberFromPool({
            poolID: poolId,
            memberID: memberId
        })).then(() => {
            setShowRemoveModal(false);
            navigate(`/pool-details?id=${poolId}`);
        });
    }, [dispatch, memberId, poolId, navigate]);

    // Function to get social media icon based on platform
    const getSocialMediaIcon = (platform) => {
        const platformLower = platform.toLowerCase();
        switch (platformLower) {
            case 'facebook': return 'bi-facebook';
            case 'twitter': return 'bi-twitter';
            case 'instagram': return 'bi-instagram';
            case 'linkedin': return 'bi-linkedin';
            case 'youtube': return 'bi-youtube';
            case 'tiktok': return 'bi-tiktok';
            case 'vimeo': return 'bi-vimeo';
            case 'github': return 'bi-github';
            case 'discord': return 'bi-discord';
            case 'telegram': return 'bi-telegram';
            case 'whatsapp': return 'bi-whatsapp';
            case 'snapchat': return 'bi-snapchat';
            case 'reddit': return 'bi-reddit';
            case 'pinterest': return 'bi-pinterest';
            default: return 'bi-link-45deg';
        }
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: 'bi-info-circle' },
        { key: 'contributions', label: 'Contributions', icon: 'bi-cash-stack' },
        { key: 'activity', label: 'Activity', icon: 'bi-activity' }
    ];

    if (!memberId || !poolId) {
        return <Navigate to="/pools" />;
    }

    // Check if any member-related data is loading
    const isLoading = loading.memberDetails || loading.memberContributions || loading.memberActivity;

    if (isLoading && !memberDetails) {
        return (
            <div className="d-flex justify-content-center my-5">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    colors={['#FFD59B', '#FFC371']}
                />
            </div>
        );
    }

    return (
        <div className="container-xl my-4 my-md-5">
            {/* Header Section */}
            <div className="row">
                <div className="col-12">
                    <Card className="glass rounded-2xl border-soft shadow-soft overflow-hidden">
                        <Card.Body className="p-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={classNames.memberAvatar}>
                                            <img
                                                src={memberDetails?.photo || "https://via.placeholder.com/80"}
                                                alt={memberDetails?.username}
                                                className="rounded-circle"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="h2 fw-extrabold mb-1">
                                                {memberDetails?.username || "Member"}
                                            </h1>
                                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                                <Badge
                                                    bg={memberDetails?.role === 'admin' ? 'primary' : 'secondary'}
                                                    className="fs-6"
                                                >
                                                    {memberDetails?.role || 'member'}
                                                </Badge>
                                                <span className="text-muted">
                                                    <i className="bi bi-calendar me-1"></i>
                                                    Joined {moment(memberDetails?.joinedAt).fromNow()}
                                                </span>
                                                <span className="text-muted">
                                                    <i className="bi bi-cash-coin me-1"></i>
                                                    ${memberDetails?.totalContributed || 0} contributed
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 text-md-end">
                                    {memberDetails?.canManage && (
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant="outline-secondary"
                                                className="rounded-xl"
                                                disabled={loading.updateRole}
                                            >
                                                {loading.updateRole ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-gear me-2"></i>
                                                        Manage Member
                                                    </>
                                                )}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() => {
                                                        setSelectedRole(memberDetails.role);
                                                        setShowRoleModal(true);
                                                    }}
                                                >
                                                    <i className="bi bi-person-gear me-2"></i>
                                                    Change Role
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item
                                                    className="text-danger"
                                                    onClick={() => setShowRemoveModal(true)}
                                                >
                                                    <i className="bi bi-person-x me-2"></i>
                                                    Remove from Pool
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}
                                    <Button
                                        variant="outline-primary"
                                        className="rounded-xl ms-2"
                                        onClick={() => navigate(`/pool-details?id=${poolId}`)}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back to Pool
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <Card className="glass rounded-2xl border-soft text-center h-100">
                        <Card.Body className="p-3">
                            <div className={classNames.statIcon}>
                                <i className="bi bi-cash-coin text-success"></i>
                            </div>
                            <h3 className="fw-bold mt-2">${memberDetails?.totalContributed || 0}</h3>
                            <p className="text-muted mb-0">Total Contributed</p>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="glass rounded-2xl border-soft text-center h-100">
                        <Card.Body className="p-3">
                            <div className={classNames.statIcon}>
                                <i className="bi bi-clock-history text-info"></i>
                            </div>
                            <h3 className="fw-bold mt-2">{memberDetails?.contributionCount || 0}</h3>
                            <p className="text-muted mb-0">Total Contributions</p>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="glass rounded-2xl border-soft text-center h-100">
                        <Card.Body className="p-3">
                            <div className={classNames.statIcon}>
                                <i className="bi bi-calendar-check text-warning"></i>
                            </div>
                            <h3 className="fw-bold mt-2">
                                {memberDetails?.daysInPool || 0}
                            </h3>
                            <p className="text-muted mb-0">Days in Pool</p>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="glass rounded-2xl border-soft text-center h-100">
                        <Card.Body className="p-3">
                            <div className={classNames.statIcon}>
                                <i className="bi bi-trophy text-primary"></i>
                            </div>
                            <h3 className="fw-bold mt-2">
                                #{memberDetails?.rank || 'N/A'}
                            </h3>
                            <p className="text-muted mb-0">Pool Rank</p>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="row mt-4">
                <div className="col-12">
                    <Card className="glass rounded-2xl border-soft">
                        <Card.Body className="p-0">
                            <div className={classNames.tabNavigation}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`${classNames.tabButton} ${activeTab === tab.key ? classNames.tabActive : ''
                                            }`}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <i className={`${tab.icon} me-2`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-4">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h5 className="fw-semibold mb-3">Member Information</h5>
                                            <div className={classNames.infoGrid}>
                                                <div className={classNames.infoItem}>
                                                    <span className={classNames.infoLabel}>
                                                        <i className="bi bi-person me-2"></i>
                                                        Username
                                                    </span>
                                                    <span className={classNames.infoValue}>
                                                        {memberDetails?.username}
                                                    </span>
                                                </div>                                              
                                                <div className={classNames.infoItem}>
                                                    <span className={classNames.infoLabel}>
                                                        <i className="bi bi-shield me-2"></i>
                                                        Role
                                                    </span>
                                                    <span className={classNames.infoValue}>
                                                        <Badge bg={memberDetails?.role === 'admin' ? 'primary' : 'secondary'}>
                                                            {memberDetails?.role}
                                                        </Badge>
                                                    </span>
                                                </div>
                                                <div className={classNames.infoItem}>
                                                    <span className={classNames.infoLabel}>
                                                        <i className="bi bi-calendar me-2"></i>
                                                        Member Since
                                                    </span>
                                                    <span className={classNames.infoValue}>
                                                        {moment(memberDetails?.joinedAt).format('MMMM Do, YYYY')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Social Media Links */}
                                            {memberDetails?.socialMediaLinks && memberDetails.socialMediaLinks.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="fw-semibold mb-3">Social Media</h5>
                                                    <div className={classNames.socialLinks}>
                                                        {memberDetails.socialMediaLinks.map((link) => (
                                                            <a
                                                                key={link.id}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={classNames.socialLink}
                                                                title={`Visit ${link.platform}`}
                                                            >
                                                                <i className={`bi ${getSocialMediaIcon(link.platform)} me-2`}></i>
                                                                {link.platform}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <h5 className="fw-semibold mb-3">Contribution Progress</h5>
                                            <div className={classNames.progressContainer}>
                                                <div className={classNames.progressHeader}>
                                                    <span>Pool Goal Progress</span>
                                                    <span>{memberDetails?.contributionPercentage || 0}%</span>
                                                </div>
                                                <div className={classNames.progressBar}>
                                                    <div
                                                        className={classNames.progressFill}
                                                        style={{ width: `${memberDetails?.contributionPercentage || 0}%` }}
                                                    ></div>
                                                </div>
                                                <div className={classNames.progressStats}>
                                                    <div className={classNames.progressStat}>
                                                        <span>Member's Share</span>
                                                        <strong>${memberDetails?.totalContributed || 0}</strong>
                                                    </div>
                                                    <div className={classNames.progressStat}>
                                                        <span>Pool Total</span>
                                                        <strong>${memberDetails?.poolTotal || 0}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Contributions Tab */}
                                {activeTab === 'contributions' && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="fw-semibold mb-0">Contribution History</h5>
                                            <div className="text-muted">
                                                Total: ${memberDetails?.totalContributed || 0}
                                            </div>
                                        </div>
                                        {loading.memberContributions ? (
                                            <div className="text-center py-5">
                                                <Hourglass
                                                    visible={true}
                                                    height="40"
                                                    width="40"
                                                    colors={['#FFD59B', '#FFC371']}
                                                />
                                                <p className="text-muted mt-3">Loading contributions...</p>
                                            </div>
                                        ) : memberContributions?.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table hover className={classNames.contributionsTable}>
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Amount</th>
                                                            <th>Type</th>
                                                            <th>Status</th>
                                                            <th>Transaction ID</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {memberContributions.map((contribution, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {moment(contribution.date).format('MMM Do, YYYY')}
                                                                </td>
                                                                <td className="fw-semibold">
                                                                    ${contribution.amount}
                                                                </td>
                                                                <td>
                                                                    <Badge bg="info" className="text-capitalize">
                                                                        {contribution.type}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Badge
                                                                        bg={contribution.status === 'completed' ? 'success' : 'warning'}
                                                                    >
                                                                        {contribution.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className={classNames.transactionId}>
                                                                    {contribution.transactionId}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="bi bi-cash-coin display-4 text-muted"></i>
                                                <p className="text-muted mt-3">No contributions found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Activity Tab */}
                                {activeTab === 'activity' && (
                                    <div>
                                        <h5 className="fw-semibold mb-4">Recent Activity</h5>
                                        {loading.memberActivity ? (
                                            <div className="text-center py-5">
                                                <Hourglass
                                                    visible={true}
                                                    height="40"
                                                    width="40"
                                                    colors={['#FFD59B', '#FFC371']}
                                                />
                                                <p className="text-muted mt-3">Loading activity...</p>
                                            </div>
                                        ) : memberActivity?.length > 0 ? (
                                            <div className={classNames.activityTimeline}>
                                                {memberActivity.map((activity, index) => (
                                                    <div key={index} className={classNames.activityItem}>
                                                        <div className={classNames.activityIcon}>
                                                            <i className={`bi ${activity.icon || 'bi-activity'} ${classNames[activity.type]}`}></i>
                                                        </div>
                                                        <div className={classNames.activityContent}>
                                                            <div className={classNames.activityTitle}>
                                                                {activity.title}
                                                            </div>
                                                            <div className={classNames.activityDescription}>
                                                                {activity.description}
                                                            </div>
                                                            <div className={classNames.activityTime}>
                                                                {moment(activity.timestamp).fromNow()}
                                                            </div>
                                                        </div>
                                                        {activity.amount && (
                                                            <div className={classNames.activityAmount}>
                                                                ${activity.amount}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="bi bi-activity display-4 text-muted"></i>
                                                <p className="text-muted mt-3">No recent activity</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Change Role Modal */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-person-gear me-2"></i>
                        Change Member Role
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Select New Role</label>
                        <select
                            className="form-select rounded-xl"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            disabled={loading.updateRole}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>
                    <div className="alert alert-info bg-info bg-opacity-10 border-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Admins can manage pool settings and members.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowRoleModal(false)}
                        disabled={loading.updateRole}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleRoleUpdate(selectedRole)}
                        disabled={loading.updateRole}
                    >
                        {loading.updateRole ? (
                            <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Updating...
                            </>
                        ) : (
                            'Update Role'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Remove Member Modal */}
            <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Remove Member
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-warning bg-warning bg-opacity-10 border-0">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Warning:</strong> This action cannot be undone. The member will be immediately removed from the pool.
                    </div>
                    <p>
                        Are you sure you want to remove <strong>{memberDetails?.username}</strong> from the pool?
                    </p>
                    {memberDetails?.totalContributed > 0 && (
                        <div className="alert alert-info bg-info bg-opacity-10 border-0">
                            <i className="bi bi-info-circle me-2"></i>
                            This member has contributed ${memberDetails.totalContributed} to the pool.
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowRemoveModal(false)}
                        disabled={loading.removeMember}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleRemoveMember}
                        disabled={loading.removeMember}
                    >
                        {loading.removeMember ? (
                            <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Removing...
                            </>
                        ) : (
                            'Remove Member'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PoolMember;