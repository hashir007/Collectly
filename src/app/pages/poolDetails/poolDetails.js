import classNames from "./poolDetails.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { Hourglass } from 'react-loader-spinner';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { ProgressBar, Modal } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import {
    getPool,
    filterPoolMembers,
    getMemberGoals,
    sendInvitation,
    getPendingJoinRequests,
    updatePoolJoiningRequest,
    poolDeleteRequest,
    submitReport
} from "../../slices/pool";
import QRCode from "react-qr-code";
import { CopyToClipboard } from "react-copy-to-clipboard";

import PoolContribution from "../../components/poolContribution/poolContribution";



const PoolDetails = () => {

    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlParams = new URLSearchParams(window.location.search);
    let navigate = useNavigate();
    const PoolID = urlParams.get("id");
    const { user: currentUser, isLoggedIn } = useSelector((state) => state.auth);
    const { poolSelected, defaultSettings, filteredPoolMembers, topContributors, poolJoiningRequests } = useSelector((state) => state.pool);
    const [poolLoading, setPoolLoading] = useState(false);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [isReportSubmitting, setIsReportSubmitting] = useState(false);


    useEffect(() => {
        setPoolLoading(true);
        if (isLoggedIn) {
            Promise.all([
                dispatch(getPool({ poolID: PoolID })),
                dispatch(filterPoolMembers({ poolID: PoolID, term: memberSearchTerm, filter: {} })),
                dispatch(getMemberGoals({ PoolID: PoolID }))
            ]).finally(() => {
                setPoolLoading(false);
            });
        }
    }, [PoolID, memberSearchTerm, dispatch]);


    const CustomProgressBar = ({ progressPercentage }) => {
        return (
            <div className="progress-container">
                <ProgressBar
                    now={progressPercentage}
                    className="custom-progress-bar"
                />
            </div>
        );
    };

    // INVITE START

    const handleInvite = useCallback((formValue) => {
        const { email, mode } = formValue;

        dispatch(sendInvitation({
            PoolID: PoolID,
            mode: mode,
            recipients: [email],
            returnUrl: `${window.location.origin}/pool-join?id=${PoolID}&referral=${currentUser.user.referral_code}`
        })).then((response) => {
            setShowInviteModal(false);
        }).catch((error) => {
            console.error('Invitation error:', error);
        });
    }, [PoolID, dispatch]);

    // INVITE END

    // JOIN REQUEST APPROVAL START

    const handleJoinRequestAction = useCallback((memberID, requestId, action) => {

        dispatch(updatePoolJoiningRequest({ poolID: PoolID, memberID, requestId, action })).then((response) => {
            dispatch(getPendingJoinRequests({ poolID: PoolID }));
        }
        ).catch((error) => {
            console.error('Join request action error:', error);
        }
        );
    }, [PoolID, dispatch]);


    //  JOIN REQUEST APPROVAL END


    // DELETE POOL START

    const handleDeletePool = useCallback(() => {
        // Implement pool deletion logic here
        dispatch(poolDeleteRequest({ poolID: PoolID })).then((response) => {
            setShowDeleteModal(false);
            navigate('/pools');
        }).catch((error) => {
            console.error('Pool deletion error:', error);
        });

    }, []);
    // DELETE POOL END

    const handleLaunchJoinRequestModal = useCallback(() => {

        dispatch(getPendingJoinRequests({ poolID: PoolID }));

        setShowJoinRequestModal(true);

    }, []);

    const handleEmailShare = useCallback(() => {
        const subject = `Join me in ${poolSelected.name} pool`;
        const body = `Hi! I'd like to invite you to join my pool "${poolSelected.name}" on Collectly. You can join using this link: ${window.location.origin +
            "/pool-join?id=" +
            (poolSelected ? poolSelected.id : '') + "&referral=" + (currentUser ? currentUser.user.referral_code : '')}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, []);

    const handleWhatsAppShare = useCallback(() => {
        const text = `Join me in ${poolSelected.name} pool on Collectly: ${window.location.origin +
            "/pool-join?id=" +
            (poolSelected ? poolSelected.id : '') + "&referral=" + (currentUser ? currentUser.user.referral_code : '')}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }, []);

    const handlePayouts = useCallback(() => {
        navigate(`/pool-payouts?id=${PoolID}`);
    }, []);

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (

        <button className="btn btn-outline-secondary rounded-xl" type="button" aria-expanded="false" ref={ref} onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}>
            {children}
        </button>
    ));

    const CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
            const [value, setValue] = useState('');

            return (
                <div
                    ref={ref}
                    style={style}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    <ul className="list-unstyled">
                        {React.Children.toArray(children).filter(
                            (child) =>
                                !value || child.props.children.toLowerCase().startsWith(value),
                        )}
                    </ul>
                </div>
            );
        },
    );

    const reportCategories = [
        { id: 'spam', label: 'Spam or misleading', description: 'This pool appears to be spam or contains false information' },
        { id: 'scam', label: 'Potential scam', description: 'I believe this pool might be fraudulent or a scam' },
        { id: 'harassment', label: 'Harassment or hate speech', description: 'Contains offensive, abusive, or hateful content' },
        { id: 'inappropriate', label: 'Inappropriate content', description: 'Contains explicit, violent, or otherwise inappropriate material' },
        { id: 'privacy', label: 'Privacy violation', description: 'Shares personal information without consent' },
        { id: 'illegal', label: 'Illegal activity', description: 'Promotes or facilitates illegal activities' },
        { id: 'other', label: 'Other', description: 'Another reason not listed here' }
    ];


    const resetReportForm = () => {
        setSelectedCategories([]);
        setReportReason('');
        setAdditionalDetails('');
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSubmitReport = async () => {
        if (selectedCategories.length === 0) {
            alert('Please select at least one reason for reporting');
            return;
        }

        setIsReportSubmitting(true);

        try {

            dispatch(submitReport({
                poolID: PoolID,
                categories: selectedCategories,
                reason: reportReason,
                additionalDetails,
                reporterId: currentUser?.user?.id
            }));

            alert('Thank you for your report. We will review it shortly.');
            setShowReportModal(false);
            resetReportForm();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('There was an error submitting your report. Please try again.');
        } finally {
            setIsReportSubmitting(false);
        }
    };



    if (!currentUser) {
        const formatReturnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        return <Navigate to={`/login?returnUrl=${formatReturnUrl}`} />;
    }

    if (!PoolID) {
        return <Navigate to={`*`} />;
    }

    return (
        <>
            {poolLoading ? (
                <div className="d-flex justify-content-center my-5">
                    <Hourglass
                        visible={true}
                        height="80"
                        width="80"
                        colors={['#FFD59B', '#FFC371']}
                    />
                </div>
            ) : (
                <>
                    <main className="container-xl my-4 my-md-5">
                        <div className="row g-4">

                            <div className="col-lg-8">
                                <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                    <div className="d-flex flex-wrap flex-md-nowrap align-items-start justify-content-between gap-4">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                {
                                                    (poolSelected.status === 1) && (
                                                        <span className="badge bg-emerald-100 text-emerald-700 text-xs px-3 py-1 fw-semibold d-flex align-items-center gap-1">
                                                            <i className="bi bi-lightning-charge-fill"></i> Open
                                                        </span>
                                                    )
                                                }
                                                {
                                                    (poolSelected.status === 0) && (
                                                        <span className="badge bg-slate-100 text-slate-600 text-xs px-3 py-1 fw-semibold">
                                                            <i className="bi bi-people-fill me-1"></i> Close
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <h1 className="mb-2 mt-1 fs-2 fw-extrabold tracking-tight" id="poolTitle">{poolSelected.name || ""}</h1>
                                            <p id="poolDesc" className="mb-0 text-slate-600">{poolSelected.description || ""}</p>
                                        </div>
                                        <img src={poolSelected.photo || ""} alt="Banner" className="d-none d-sm-block rounded-xl ms-md-4" style={{ width: "10rem", height: "7rem", objectFit: "cover" }} loading="lazy" />
                                    </div>
                                    <div className="row g-3 mt-4">
                                        <div className="col-md-4">
                                            <div className="p-3 rounded-xl bg-white-90 border-soft h-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="text-sm text-slate-500">Raised</div>
                                                    <i className="bi bi-graph-up text-success"></i>
                                                </div>
                                                <div className="fs-2 fw-bold mt-1" id="poolRaised">${poolSelected.total_contributed}</div>
                                                <CustomProgressBar progressPercentage={poolSelected.goal_percentage} />
                                                <div className="text-xs text-slate-500 mt-1" id="progressLabel">{poolSelected.goal_percentage}% of goal</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 rounded-xl bg-white-90 border-soft h-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="text-sm text-slate-500">Goal</div>
                                                    <i className="bi bi-flag text-primary"></i>
                                                </div>
                                                <div className="fs-2 fw-bold mt-1" id="poolGoal">${poolSelected.goal_amount}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 rounded-xl bg-white-90 border-soft h-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="text-sm text-slate-500">Contributors</div>
                                                    <i className="bi bi-heart-fill text-danger"></i>
                                                </div>
                                                <div className="fs-2 fw-bold mt-1" id="poolContribCount">{poolSelected.members}</div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="mt-4 d-flex flex-wrap gap-2">
                                        <button className="btn btn-outline-secondary rounded-xl" onClick={() => setShowInviteModal(true)}>
                                            <i className="bi bi-person-plus me-1"></i> Invite
                                        </button>
                                        <button className="btn btn-outline-secondary rounded-xl" onClick={handlePayouts}>
                                            <i className="bi bi-arrow-bar-left me-1"></i> Payouts
                                        </button>
                                        {
                                            (poolSelected) && (poolSelected.poolOwner) && (poolSelected.poolOwner.id === currentUser.user.id) && (
                                                <button className="btn btn-outline-secondary rounded-xl" onClick={handleLaunchJoinRequestModal}>
                                                    <i className="bi bi-people me-1"></i> Joining Requests {poolJoiningRequests && poolJoiningRequests.length > 0 ? `(${poolJoiningRequests.length})` : ''}
                                                </button>
                                            )
                                        }
                                        {
                                            (poolSelected) && (poolSelected.poolOwner) && (poolSelected.poolOwner.id === currentUser.user.id) && (
                                                <Dropdown>
                                                    <Dropdown.Toggle as={CustomToggle} >
                                                        <i className="bi bi-three-dots"></i>
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu as={CustomMenu}>
                                                        <Dropdown.Item eventKey="1" onClick={() => navigate(`/pool-edit?id=${PoolID}`)}>Edit</Dropdown.Item>
                                                        <Dropdown.Item eventKey="2" onClick={() => setShowDeleteModal(true)}>Delete</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            )
                                        }
                                    </div>
                                </div>


                                <div className="glass rounded-2xl border-soft shadow-soft p-0 overflow-hidden">
                                    <div className="px-4 pt-4">
                                        <div className="d-flex gap-2 mb-2" role="tablist">
                                            <a className="tab-btn nav-link active" id="tab-overview-btn" data-bs-toggle="tab" href="#tab-overview">
                                                <i className="bi bi-info-circle me-1"></i> Overview
                                            </a>
                                            <a className="tab-btn nav-link" id="tab-members-btn" data-bs-toggle="tab" href="#tab-members">
                                                <i className="bi bi-people me-1"></i> Members
                                            </a>
                                        </div>
                                    </div>

                                    <div className="tab-content">
                                        <div className="p-4 tab-pane container active" id="tab-overview">
                                            <div className="row g-4">
                                                <div className="col-md-6">
                                                    <div className="rounded-xl p-4 bg-white-90 border-soft h-100">
                                                        <div className="mt-3">
                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                <i className="bi bi-calendar text-slate-500"></i>
                                                                <div>
                                                                    <div className="text-xs text-slate-500">Created</div>
                                                                    <div className="fw-medium" id="poolCreatedAt">{moment(poolSelected.createdAt).format("dddd, Do MMMM YYYY, h:mm:ss A")}</div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                <i className="bi bi-person text-slate-500"></i>
                                                                <div>
                                                                    <div className="text-xs text-slate-500">Default buy in amount</div>
                                                                    <div className="fw-medium" id="poolOwner">${poolSelected.defaultBuy_in_amount || 0}</div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                <i className="bi bi-currency-dollar text-slate-500"></i>
                                                                <div>
                                                                    <div className="text-xs text-slate-500">Minimum buy in amount</div>
                                                                    <div className="fw-medium" id="poolMinContrib">${defaultSettings?.pool?.minimum_buy_amount}</div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className="bi bi-eye text-slate-500"></i>
                                                                <div>
                                                                    <div className="text-xs text-slate-500">Archived</div>
                                                                    <div className="fw-medium" id="poolVisibility">{poolSelected.isArchive || "--"}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="rounded-xl p-4 bg-white-90 border-soft h-100">
                                                        <h5 className="fw-semibold d-flex align-items-center gap-2">
                                                            <i className="bi bi-trophy text-warning"></i> Top Contributors
                                                        </h5>
                                                        <ul className="list-unstyled mt-3">
                                                            {
                                                                (topContributors && topContributors.length > 0) &&
                                                                topContributors.map((contributor, index) => (
                                                                    <li className="d-flex align-items-center justify-content-between gap-2 mb-3" key={index}>
                                                                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                                                                            <span className="contrib-avatar" onClick={() => navigate(`/pool-member?memberId=${contributor.memberID}&poolId=${PoolID}`)}>
                                                                                <img src={contributor.photo || "https://via.placeholder.com/40"} alt="Avatar" className="rounded-circle" style={{ width: "40px", height: "40px" }} />
                                                                            </span>
                                                                            <div className="flex-grow-1">
                                                                                <div className="fw-medium">
                                                                                    {contributor.username || "Anonymous"}
                                                                                </div>
                                                                                <div className="text-xs text-slate-500">
                                                                                    ${contributor.totalContributed} contributed
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="contribution-meter" style={{ width: "60px" }}>
                                                                            <div className="contribution-meter-fill" style={{ width: `${contributor.contributionPercentage}%` }}></div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 tab-pane container" id="tab-members">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="fw-semibold mb-0">All Members</h5>
                                                <div className="input-group input-group-sm" style={{ maxWidth: "250px" }}>
                                                    <span className="input-group-text bg-transparent"><i className="bi bi-search"></i></span>
                                                    <input type="text" className="form-control form-control-sm" placeholder="Search members..." />
                                                </div>
                                            </div>
                                            <div className="row g-3" id="memberList">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Member</th>
                                                            <th scope="col">Contributed</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredPoolMembers.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    <div onClick={() => navigate(`/pool-member?memberId=${item.memberID}&poolId=${PoolID}`)} className="d-flex align-items-center cursor-pointer">
                                                                        <img src={item.photo || "https://via.placeholder.com/40"} alt="Profile" className="rounded-circle me-2" style={{ width: "40px", height: "40px" }} />
                                                                        <span className="fw-semibold">{item.username}</span>
                                                                    </div>
                                                                    <div className="contribution-meter" style={{ width: "60px" }}>
                                                                        <div className="contribution-meter-fill" style={{ width: `${item.contributionPercentage}%` }}></div>
                                                                    </div>
                                                                </td>
                                                                <td>${item.total_contributed || 0}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="col-lg-4">

                                <PoolContribution PoolID={PoolID} />

                                <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                    <h5 className="fw-semibold d-flex align-items-center gap-2">
                                        <i className="bi bi-share text-primary"></i> Share This Pool
                                    </h5>
                                    <div className="input-group mt-3">
                                        <input id="shareUrl" type="text" className="form-control" value={window.location.origin +
                                            "/pool-join?id=" +
                                            (poolSelected ? poolSelected.id : '') + "&referral=" + (currentUser ? currentUser.user.referral_code : '')} readOnly />

                                        <CopyToClipboard
                                            text={
                                                window.location.origin +
                                                "/pool-join?id=" +
                                                (poolSelected ? poolSelected.id : '') + "&referral=" + (currentUser ? currentUser.user.referral_code : '')
                                            }
                                            onCopy={() => alert("Copied to clipboard !")}
                                        >
                                            <button className="btn btn-dark" id="copyShareBtn2">
                                                <i className="bi bi-clipboard"></i>
                                            </button>
                                        </CopyToClipboard>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">Send this link to invite others to join in.</p>
                                    <div className="d-flex gap-2 mt-3">
                                        <button className="btn btn-outline-secondary rounded-xl flex-grow-1" onClick={handleEmailShare}>
                                            <i className="bi bi-envelope me-1"></i> Email
                                        </button>
                                        <button className="btn btn-outline-secondary rounded-xl flex-grow-1" onClick={handleWhatsAppShare}>
                                            <i className="bi bi-whatsapp me-1"></i> WhatsApp
                                        </button>
                                    </div>
                                </div>

                                <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                    <h5 className="fw-semibold d-flex align-items-center gap-2">
                                        <i className="bi bi-shield-lock text-warning"></i> Pool Safety
                                    </h5>
                                    <div className="alert alert-warning bg-warning bg-opacity-10 border-0 mt-3 text-sm">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        Only contribute to pools from people you know and trust.
                                    </div>
                                    <button
                                        className="btn btn-outline-secondary btn-sm rounded-xl w-100 mt-2"
                                        onClick={() => setShowReportModal(true)}
                                    >
                                        <i className="bi bi-flag me-1"></i> Report This Pool
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>

                    <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title><i class="bi bi-send me-2"></i>Invite People</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Formik
                                initialValues={{
                                    email: "",
                                    mode: "email",
                                }}
                                validationSchema={Yup.object().shape({
                                    email: Yup.string().required("This field is required!")
                                })}
                                onSubmit={handleInvite}
                            >
                                {({ errors, touched }) => (
                                    <Form>
                                        <div class="row mb-4 pb-3 border-bottom">
                                            <div class="col-md-8">
                                                <label class="form-label fw-bold fs-5 text-dark">Email</label>
                                                <div class="input-group">
                                                    <span class="input-group-text" style={{ backgroundColor: "#FFC371" }}><i class="bi bi-envelope"></i></span>
                                                    <Field
                                                        name="email"
                                                        type="text"
                                                        placeholder="Enter the email address to send invitation"
                                                        className={`form-control`}
                                                    />
                                                    <ErrorMessage
                                                        name="email"
                                                        component="div"
                                                        className={"text-danger mt-1"}
                                                    />
                                                </div>
                                            </div>
                                            <div class="col-md-4 d-flex align-items-end mt-2">
                                                <button type="submit" class="btn w-100 py-2" style={{ backgroundColor: "#FFC371" }}>
                                                    <i class="bi bi-send me-1"></i> Invite
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>

                            <Formik
                                initialValues={{
                                    sms: "",
                                    mode: "sms",
                                }}
                                validationSchema={Yup.object().shape({
                                    sms: Yup.string().required("This field is required!")
                                })}
                                onSubmit={handleInvite}
                            >
                                {({ errors, touched }) => (
                                    <Form>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <label className="form-label fw-bold fs-5 text-dark">SMS</label>
                                                <div className="input-group">
                                                    <span className="input-group-text" style={{ backgroundColor: "#FFC371" }}><i className="bi bi-chat-text"></i></span>
                                                    <Field
                                                        name="sms"
                                                        type="tel"
                                                        className={`form-control`}
                                                        placeholder="Enter the phone number to send SMS invitation"
                                                    />
                                                    <ErrorMessage
                                                        name="sms"
                                                        component="div"
                                                        className={"text-danger mt-1"}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4 d-flex align-items-end mt-2">
                                                <button type="submit" class="btn w-100 py-2" style={{ backgroundColor: "#FFC371" }} onClick={() => handleInvite('sms')}>
                                                    <i class="bi bi-send me-1"></i> Invite
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                            <div className="row mt-4 pt-3 border-top">
                                <div className="col-12" style={{ margin: "0 auto" }}>
                                    <h5 className="fw-bold mb-3 text-center">Invite connections below or via email</h5>
                                    <div className="col-4" style={{ margin: "0 auto", maxWidth: "256px" }}>
                                        <QRCode
                                            size={256}
                                            style={{
                                                height: "auto",
                                                maxWidth: "100%",
                                                width: "100%",
                                            }}
                                            value={
                                                window.location.origin +
                                                "/pool-join?id=" +
                                                (poolSelected ? poolSelected.id : '') + "&referral=" + (currentUser ? currentUser.user.referral_code : '')
                                            }
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-4 pt-3 border-top">
                                <CopyToClipboard
                                    text={
                                        window.location.origin +
                                        "/pool-join?id=" +
                                        (poolSelected ? poolSelected.id : '') + "&referral=" + (currentUser ? currentUser.user.referral_code : '')
                                    }
                                    onCopy={() => alert("Copied to clipboard !")}
                                >
                                    <a href="#" className="col-3 btn btn-outline-secondary d-flex align-items-center justify-content-center mx-auto rounded-xl">
                                        <svg
                                            width="17"
                                            height="16"
                                            viewBox="0 0 17 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M9.73039 11.5101L7.55599 13.6845C6.22949 14.9755 4.10758 14.9468 2.81655 13.6203C1.55041 12.3194 1.55013 10.247 2.81589 8.94575L4.99029 6.76935C5.25057 6.50888 5.25042 6.08674 4.98995 5.82646C4.72948 5.56618 4.30734 5.56633 4.04706 5.8268L1.87331 8.0032C0.0441827 9.83327 0.0449326 12.7996 1.87497 14.6288C3.705 16.4579 6.67137 16.4571 8.50054 14.6271L10.6749 12.4527C10.9307 12.1879 10.9233 11.7659 10.6586 11.5102C10.4003 11.2607 9.9907 11.2607 9.73239 11.5102H9.73039V11.5101Z"
                                                fill="#C5914B"
                                            />
                                            <path
                                                d="M15.1292 1.37386C14.253 0.491678 13.0602 -0.00307683 11.8169 1.65573e-05C10.5743 -0.00329555 9.38186 0.490428 8.50528 1.3712L6.32753 3.54626C6.06706 3.80654 6.06691 4.22868 6.32719 4.48915C6.58747 4.74962 7.00961 4.74977 7.27008 4.48949L9.44648 2.31509C10.0733 1.68448 10.9264 1.33092 11.8155 1.3332C13.6666 1.33383 15.1667 2.83487 15.166 4.6859C15.1657 5.5743 14.8127 6.42626 14.1846 7.05453L12.0102 9.22894C11.7497 9.4894 11.7497 9.9117 12.0102 10.1722C12.2706 10.4326 12.6929 10.4326 12.9534 10.1722L15.1278 7.99908C16.9544 6.16854 16.955 3.20508 15.1292 1.37386Z"
                                                fill="#C5914B"
                                            />
                                            <path
                                                d="M10.029 5.52792L6.02943 9.52745C5.76461 9.78321 5.7573 10.2052 6.01305 10.47C6.2688 10.7348 6.69082 10.7421 6.9556 10.4864C6.96116 10.481 6.9666 10.4756 6.97197 10.47L10.9715 6.47047C11.2273 6.20566 11.2199 5.78367 10.9551 5.52792C10.6968 5.27845 10.2873 5.27845 10.029 5.52792Z"
                                                fill="#C5914B"
                                            />
                                        </svg>
                                        Copy Link
                                    </a>
                                </CopyToClipboard>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-primary" onClick={() => setShowInviteModal(false)}>
                                Close
                            </button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showJoinRequestModal} onHide={() => setShowJoinRequestModal(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title><i class="bi bi-people me-2"></i>Joining Requests</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {poolJoiningRequests && poolJoiningRequests.length > 0 ? (
                                <div className="row">
                                    {poolJoiningRequests.map((request, index) => (
                                        <div className="col-md-6 col-lg-4 mb-4" key={index}>
                                            <div className="card h-100 shadow-sm">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <img
                                                            src={request?.User?.photo || "https://via.placeholder.com/50"}
                                                            alt="Profile"
                                                            className="rounded-circle me-3"
                                                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                        />
                                                        <div>
                                                            <h6 className="card-title mb-0 fw-semibold">{request?.User?.username}</h6>
                                                            <small className="text-muted">Request to join pool</small>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center text-muted mb-3">
                                                        <i className="bi bi-clock-history me-2"></i>
                                                        <small>{moment(request?.createdAt).format("MMM Do YYYY, h:mm A")}</small>
                                                    </div>

                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-success btn-sm flex-fill" onClick={() => handleJoinRequestAction(request.id, request.User.id, 'approve')}>
                                                            <i className="bi bi-check-lg me-1"></i> Approve
                                                        </button>
                                                        <button className="btn btn-outline-danger btn-sm flex-fill" onClick={() => handleJoinRequestAction(request.id, request.User.id, 'reject')}>
                                                            <i className="bi bi-x-lg me-1"></i> Deny
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-inbox display-4 text-muted"></i>
                                    <p className="text-muted mt-3">No pending requests found.</p>
                                    <small className="text-muted">When someone requests to join your pool, it will appear here.</small>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-primary" onClick={() => setShowJoinRequestModal(false)}>
                                Close
                            </button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <i className="bi bi-people me-2"></i>Delete Pool
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-shield-lock text-warning"></i> Danger Zone
                                </h5>
                                <div className="alert alert-warning bg-warning bg-opacity-10 border-0 mb-3 text-sm">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    These actions are irreversible. Please be cautious.
                                </div>
                                <div className="d-grid gap-2">
                                    <button className="btn btn-outline-danger rounded-xl" onClick={handleDeletePool}>
                                        <i className="bi bi-trash me-1"></i> Delete Pool
                                    </button>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-primary" onClick={() => setShowDeleteModal(false)}>
                                Close
                            </button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <i className="bi bi-flag-fill text-danger me-2"></i>
                                Report Pool
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <div className="alert alert-info bg-info bg-opacity-10 border-0 mb-4">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    Your report is anonymous. The pool owner won't know who reported them.
                                </div>

                                <h6 className="fw-semibold mb-3">Why are you reporting this pool?</h6>
                                <p className="text-muted text-sm mb-4">
                                    Please select all categories that apply to help us understand the issue.
                                </p>

                                <div className="report-categories mb-4">
                                    {reportCategories.map((category) => (
                                        <div
                                            key={category.id}
                                            className={`category-card p-3 mb-2 rounded-xl border cursor-pointer ${selectedCategories.includes(category.id)
                                                ? 'border-primary bg-primary bg-opacity-10'
                                                : 'border-soft'
                                                }`}
                                            onClick={() => handleCategoryToggle(category.id)}
                                        >
                                            <div className="form-check mb-0">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category.id)}
                                                    onChange={() => handleCategoryToggle(category.id)}
                                                    id={`category-${category.id}`}
                                                />
                                                <label
                                                    className="form-check-label fw-medium cursor-pointer"
                                                    htmlFor={`category-${category.id}`}
                                                >
                                                    {category.label}
                                                </label>
                                                <div className="text-sm text-muted mt-1">
                                                    {category.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="reportReason" className="form-label fw-semibold">
                                        Primary concern
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control rounded-xl"
                                        id="reportReason"
                                        placeholder="Briefly describe the main issue..."
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="additionalDetails" className="form-label fw-semibold">
                                        Additional details (optional)
                                    </label>
                                    <textarea
                                        className="form-control rounded-xl"
                                        id="additionalDetails"
                                        rows="4"
                                        placeholder="Please provide any additional information that might help us understand the situation..."
                                        value={additionalDetails}
                                        onChange={(e) => setAdditionalDetails(e.target.value)}
                                    />
                                    <div className="form-text">
                                        Include specific examples, links, or timestamps if relevant.
                                    </div>
                                </div>

                                <div className="alert alert-warning bg-warning bg-opacity-10 border-0">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <strong>Important:</strong> Only report pools that violate our community guidelines.
                                    False reports may result in account restrictions.
                                </div>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <button
                                className="btn btn-outline-secondary rounded-xl"
                                onClick={() => {
                                    setShowReportModal(false);
                                    resetReportForm();
                                }}
                                disabled={isReportSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger rounded-xl"
                                onClick={handleSubmitReport}
                                disabled={isReportSubmitting || selectedCategories.length === 0}
                            >
                                {isReportSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-flag-fill me-1"></i>
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </>
    );
};

export default PoolDetails;