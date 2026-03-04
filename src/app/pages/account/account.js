import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Card, Tab, Tabs, Nav, Form, Spinner, Alert, Table, Modal, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Formik, Field, ErrorMessage, FieldArray } from "formik";
import Switch from "react-switch";
import Pagination from 'react-bootstrap/Pagination';
import * as Yup from "yup";
import moment from 'moment';
import QRCode from "react-qr-code";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
    getAccount,
    updateProfile,
    getPayoutDetails,
    updatePayoutDetails,
    getAllContributionByUserId,
    getSubscription,
    getSubscriptionsPayments,
    getSubscriptionHistory,
    getSubscriptionPlans,
    getSocialMediaByUserId,
    addOrUpdateSocialMediaLinks,
    getUserSettings,
    updateUserSettings,
    getMyApps,
    createApp,
    getUserReferrals,
    getIdentityVerificationStatus,
    uploadProfileImage
} from '../../slices/user';
import {
    logout,
    changeAccountPassword,
    haveAccountMarkedForDeletion,
    downloadPersonalData,
    createEmailVerificationRequest
} from '../../slices/auth';
import {
    setMessage
} from '../../slices/message';
import styles from './account.module.css';
import EventBus from "../../common/eventBus";
import SubscriptionModal from "../../components/subscriptionModal/subscriptionModal";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'


const Account = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { me: profile, payout, contributions, subscription, subscriptionHistory, subscriptionsPayments, subscriptionPlans, socialMedia, settings, apps, referrals, identityVerificationStatus } = useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState('profile');
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [socialMediaInitialValues, setSocialMediaInitialValues] = useState({
        paramLists: [
            {
                link: '',
                social_media: 'Twitter'
            },
            {
                link: '',
                social_media: 'Facebook'
            },
            {
                link: '',
                social_media: 'Youtube'
            },
            {
                link: '',
                social_media: 'Vimeo'
            },
            {
                link: '',
                social_media: 'Instagram'
            },
            {
                link: '',
                social_media: 'LinkedIn'
            },
            {
                link: '',
                social_media: 'Pinterest'
            }
        ]
    });
    const [showAppModal, setShowAppModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);


    const [isDownloadingData, setIsDownloadingData] = useState(false);
    const [downloadHistory, setDownloadHistory] = useState([]);
    const [lastDownloadUrl, setLastDownloadUrl] = useState(null);


    useEffect(() => {
        if (currentUser?.user?.id) {
            Promise.all([
                dispatch(getAccount({ userId: currentUser.user.id })),
                dispatch(getPayoutDetails({ userId: currentUser.user.id })),
                dispatch(getAllContributionByUserId({ userId: currentUser.user.id, page: 1, pageSize: 20 })),
                dispatch(getSubscriptionPlans({ userId: currentUser.user.id })),
                dispatch(getSubscription({ userId: currentUser.user.id })),
                dispatch(getSubscriptionsPayments({ userId: currentUser.user.id, page: 1, pageSize: 20 })),
                dispatch(getSubscriptionHistory({ userId: currentUser.user.id, page: 1, pageSize: 20 })),
                dispatch(getSocialMediaByUserId({ userId: currentUser.user.id })),
                dispatch(getUserSettings({ userId: currentUser.user.id })),
                dispatch(getMyApps({ userId: currentUser.user.id })),
                dispatch(getUserReferrals({ userId: currentUser.user.id })),
                dispatch(getIdentityVerificationStatus({ userId: currentUser.user.id }))                
            ]);
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (socialMedia && socialMedia.length > 0) {
            // Use functional update to avoid stale closure issues
            setSocialMediaInitialValues(prev => {
                const updatedParamLists = (prev?.paramLists || []).map(param => {
                    let existing = socialMedia.find(sm => sm.social_media === param.social_media);
                    return existing ? { ...param, link: existing.link } : param;
                });
                return { paramLists: updatedParamLists };
            });
        }
    }, [socialMedia]);

    const logOut = useCallback(() => {

        dispatch(logout())
            .unwrap().finally(() => {
                navigate("/login")
                window.location.reload();
            });

    }, [dispatch]);

    const handleProfileSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await dispatch(updateProfile({
                userId: currentUser.user.id,
                firstName: values.firstName,
                lastName: values.lastName,
                dateOfBirth: values.dateOfBirth,
                phone: values.phone
            })).unwrap();

            const { Account } = await dispatch(getAccount({ userId: currentUser.user.id })).unwrap();

            resetForm({
                values: {
                    firstName: Account.firstName || '',
                    lastName: Account.lastName || '',
                    dateOfBirth: Account.date_of_birth
                        ? moment(Account.date_of_birth).format('YYYY-MM-DD')
                        : "",
                    phone: Account.phone || ''
                }
            });

        } finally {
            setSubmitting(false);
        }
    };

    const handlePayoutSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await dispatch(updatePayoutDetails({
                userId: currentUser.user.id,
                payoutEmailAddress: values.payoutEmailAddress,
                payoutPayerID: values.payoutPayerID
            }));

            const { Payout } = await dispatch(getPayoutDetails({ userId: currentUser.user.id })).unwrap();

            resetForm({
                values: {
                    payoutEmailAddress: Payout.payout_email_address || '',
                    payoutPayerID: Payout.payout_payer_id || '',
                }
            });

        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            dispatch(changeAccountPassword({
                userId: currentUser.user.id,
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            })).unwrap().
                then(() => {
                    setTimeout(() => {
                        EventBus.on("logout", () => {
                            logOut();
                        });
                        dispatch(setMessage({ message: 'Please login again with your new password.', type: 'success' }));
                    }, 5000);
                });
            resetForm();
        } finally {
            setSubmitting(false);
        }
    };

    const handlePageChangeContributionByUserId = (pageNumber) => {
        dispatch(getAllContributionByUserId({ userId: currentUser.user.id, page: pageNumber, pageSize: 20 }))
    };

    const handleSocialMediaLinkUpdate = (values, { setSubmitting, resetForm }) => {
        try {
            dispatch(addOrUpdateSocialMediaLinks({
                userId: currentUser.user.id,
                social: JSON.stringify(values.paramLists)
            }));
            resetForm();
        } finally {
            setSubmitting(false);
        }
    }

    const handleUpdateUserSettings = (values, { setSubmitting, resetForm }) => {
        try {
            dispatch(updateUserSettings({
                userId: currentUser.user.id,
                settings: {
                    notification_email: values.notification_email,
                    notification_sms: values.notification_sms
                }
            }));
            resetForm();
        } finally {
            setSubmitting(false);
        }
    }

    const handleCreateAppSubmit = (values, { setSubmitting, resetForm }) => {
        try {
            // We intentionally allow redirectUri to be optional but include it now
            dispatch(createApp({
                userId: currentUser.user.id,
                name: values.name,
                redirectUri: values.redirectUri || ''
            }));
            resetForm();
            setShowAppModal(false);
        } finally {
            setSubmitting(false);
        }
    }

    const handleDeleteAccount = (values) => {
        dispatch(haveAccountMarkedForDeletion({
            userId: currentUser.user.id,
            password: values.password,
            reason: values.reason
        }))
            .unwrap()
            .then(() => {
                dispatch(setMessage({
                    message: 'Account deletion request submitted successfully. You will be logged out shortly.',
                    type: 'success'
                }));
                setTimeout(() => {
                    logOut();
                }, 3000);
            })
            .catch((error) => {
                dispatch(setMessage({
                    message: error.message || 'Failed to submit deletion request',
                    type: 'error'
                }));
            });
    };

    const handlePhotoClick = () => {
        setShowPhotoModal(true);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                dispatch(setMessage({
                    message: 'Please select a valid image file (JPEG, PNG, GIF)',
                    type: 'error'
                }));
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                dispatch(setMessage({
                    message: 'Image size must be less than 5MB',
                    type: 'error'
                }));
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!selectedFile) {
            dispatch(setMessage({
                message: 'Please select a photo to upload',
                type: 'error'
            }));
            return;
        }

        setIsUploading(true);

        try {

            await dispatch(uploadProfileImage({
                userId: currentUser.user.id,
                removePhoto: false,
                file: selectedFile
            })).unwrap();

            dispatch(setMessage({
                message: 'Profile photo updated successfully!',
                type: 'success'
            }));

            setShowPhotoModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);


            dispatch(getAccount({ userId: currentUser.user.id }));

        } catch (error) {
            dispatch(setMessage({
                message: error.message || 'Failed to upload photo',
                type: 'error'
            }));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        try {

            await dispatch(uploadProfileImage({
                userId: currentUser.user.id,
                removePhoto: true,
                file: null
            })).unwrap();

            dispatch(setMessage({
                message: 'Profile photo removed successfully!',
                type: 'success'
            }));

            setShowPhotoModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);

            // Refresh profile data
            dispatch(getAccount({ userId: currentUser.user.id }));

        } catch (error) {
            dispatch(setMessage({
                message: error.message || 'Failed to remove photo',
                type: 'error'
            }));
        }
    };

    const handleClosePhotoModal = () => {
        setShowPhotoModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const getApiBaseUrl = () => {

        return process.env.REACT_APP_API_URL ||
            `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api/v1`;
    };

    const triggerFileDownload = async (downloadUrl) => {
        try {

            const apiBaseUrl = getApiBaseUrl();
            const fullUrl = `${apiBaseUrl}${downloadUrl}`;

            console.log('Downloading from:', fullUrl);

            // Make authenticated request
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${currentUser?.token}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Download failed:', response.status, errorText);
                throw new Error(`Download failed with status: ${response.status}`);
            }

            // Get the blob
            const blob = await response.blob();

            console.log('Downloaded blob:', {
                size: blob.size,
                type: blob.type
            });

            // Verify it's not empty
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            // Create download
            const url = window.URL.createObjectURL(blob);

            // Get filename from header or generate one
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `personal-data-export-${currentUser.user.id}-${Date.now()}.zip`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            console.log('Download completed successfully');
            return true;

        } catch (error) {
            console.error('File download error:', error);
            throw error;
        }
    };

    const handleDownloadPersonalData = async () => {
        if (!currentUser?.user?.id) return;

        setIsDownloadingData(true);

        try {
            // Generate the download token/link
            const response = await dispatch(downloadPersonalData({
                userId: currentUser.user.id
            })).unwrap();

            if (response.downloadUrl) {
                // Add to download history
                const newDownloadRecord = {
                    timestamp: new Date(),
                    status: 'pending',
                    url: response.downloadUrl
                };

                setDownloadHistory(prev => [newDownloadRecord, ...prev]);
                setLastDownloadUrl(response.downloadUrl);

                dispatch(setMessage({
                    message: 'Your data export is ready! The download will start automatically.',
                    type: 'success'
                }));

                // Trigger the download
                await triggerFileDownload(response.downloadUrl);

                // Update status to success
                setDownloadHistory(prev =>
                    prev.map(item =>
                        item.url === response.downloadUrl
                            ? { ...item, status: 'success' }
                            : item
                    )
                );

            } else {
                throw new Error('No download URL received');
            }

        } catch (error) {
            console.error('Download error:', error);

            // Update download history with error
            if (lastDownloadUrl) {
                setDownloadHistory(prev =>
                    prev.map(item =>
                        item.url === lastDownloadUrl
                            ? { ...item, status: 'error' }
                            : item
                    )
                );
            }

            dispatch(setMessage({
                message: error.message || 'Failed to download data. Please try again.',
                type: 'error'
            }));
        } finally {
            setIsDownloadingData(false);
        }
    };


    const handleSendEmailVerification = async () => {

        await dispatch(createEmailVerificationRequest({
            userId: currentUser.user.id,
            callbackUrl: `${window.location.origin}/email-verification`
        })).unwrap().then(() => {
            dispatch(setMessage({
                message: 'Verification email sent! Please check your inbox.',
                type: 'success'
            }));
        }).catch((error) => {
            dispatch(setMessage({
                message: error.message || 'Failed to send verification email.',
                type: 'error'
            }));
        });
    }


    if (!currentUser) {
        let formatReturnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
        let returnUrl = `?returnUrl=${formatReturnUrl}`;
        return <Navigate to={`/login${returnUrl}`} />;
    }


    const tabs = [
        { key: 'profile', icon: 'bi-person', label: 'Profile' },
        { key: 'paypal', icon: 'bi-paypal', label: 'Get Paid' },
        { key: 'password', icon: 'bi-lock', label: 'Change Password' },
        { key: 'contributions', icon: 'bi-cash-stack', label: 'Contributions' },
        // { key: 'subscriptions', icon: 'bi-bell', label: 'Subscriptions' },
        { key: 'social', icon: 'bi-share', label: 'Socials' },
        { key: 'settings', icon: 'bi-gear', label: 'Settings' },
        { key: 'api', icon: 'bi-key', label: 'API' },
        { key: 'referrals', icon: 'bi-people', label: 'Referrals' },
        { key: 'identity', icon: 'bi-person-badge', label: 'Identity' },
        { key: 'close', icon: 'bi-x-circle', label: 'Close Account' }
    ];



    return (
        <Container className={`py-4 ${styles.accountContainer}`}>

            <Card className={`${styles.glassCard} rounded-3 shadow-lg border-0 overflow-hidden`}>
                {/* Header Section */}
                <div className={styles.accountHeader}>
                    <Card.Body className="py-5" style={{
                        background: "linear-gradient(90deg, #FFC371 0%, #FF796E 100%)",
                        color: "#fff"
                    }}>
                        <Row className="align-items-center">
                            <Col xs="auto" className="position-relative">
                                <div
                                    className={styles.profileImageContainer}
                                    tabIndex={0}
                                    aria-label="Change profile picture"
                                    onClick={handlePhotoClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        width={120}
                                        height={120}
                                        src={profile?.photoUrl || 'https://app.collectly.com/public/img/user.png'}
                                        className={`${styles.profileImg} rounded-circle shadow-lg`}
                                        alt="Profile"
                                        onError={(e) => { e.target.src = 'https://app.collectly.com/public/img/user.png'; }}
                                    />
                                    <div className={styles.profileOverlay}>
                                        <i className="bi bi-camera text-white"></i>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <h1
                                    className="display-6 fw-bold mb-2"
                                    style={{
                                        maxWidth: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        color: "#fff"
                                    }}
                                    title={`${profile?.firstName} ${profile?.lastName}`}
                                >
                                    <i className="bi bi-person me-2"></i>
                                    {`${profile?.firstName} ${profile?.lastName}`}
                                </h1>
                                <p
                                    className="mb-1 fs-5 opacity-90"
                                    style={{
                                        maxWidth: 300,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        color: "#fada5e"
                                    }}
                                    title={profile?.email}
                                >
                                    <i className="bi bi-envelope me-2"></i>
                                    {profile?.email}
                                </p>
                                {profile?.credits_earned !== undefined && (
                                    <div className="mt-2">
                                        <span className="badge bg-light text-dark fs-6">
                                            <i className="bi bi-star me-1"></i>
                                            {profile.credits_earned} Credits
                                        </span>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </div>
                <Card.Body className={styles.tabBody}>
                    <Row>

                        <Col lg={3} md={4} className={styles.verticalTabsCol}>
                            <Nav variant="pills" activeKey={activeTab} className={styles.verticalTabs} onSelect={setActiveTab}>
                                {tabs.map(tab => (
                                    <Nav.Item key={tab.key}>
                                        <Nav.Link eventKey={tab.key} className={styles.verticalTabLink}>
                                            <i className={`bi ${tab.icon} me-2`}></i>
                                            <span>{tab.label}</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Col>

                        <Col lg={9} md={8}>
                            <Tab.Content>

                                {activeTab === 'profile' && (

                                    <div className={styles.tabContentInner}>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h4 className={styles.tabTitle}>
                                                <i className="bi bi-pencil-square me-2"></i>
                                                Edit Profile
                                            </h4>
                                        </div>
                                        <Formik
                                            enableReinitialize
                                            initialValues={{
                                                firstName: profile?.firstName || '',
                                                lastName: profile?.lastName || '',
                                                dateOfBirth: profile?.date_of_birth
                                                    ? moment(profile.date_of_birth).format('YYYY-MM-DD')
                                                    : "",
                                                phone: profile?.phone || ''
                                            }}
                                            validationSchema={Yup.object().shape({
                                                firstName: Yup.string().required("First name is required"),
                                                lastName: Yup.string().required("Last name is required"),
                                                phone: Yup.string()
                                                    .test('is-valid-phone', 'Please enter a valid US phone number', (value) => {
                                                        if (!value) return false;

                                                        // Remove all non-digit characters except leading +
                                                        const cleaned = value.replace(/[^\d+]/g, '');

                                                        // Allow various US phone formats
                                                        const phoneRegex = /^(\+1|1)?\d{10}$/;

                                                        // Test if it's a valid US number (10 digits, optional +1 or 1 prefix)
                                                        return phoneRegex.test(cleaned);
                                                    })
                                                    .required("Phone number is required"),
                                                dateOfBirth: Yup.date()
                                                    .max(new Date(), 'Date of birth cannot be in the future')
                                                    .nullable()
                                            })}
                                            onSubmit={handleProfileSubmit}
                                        >
                                            {({ errors, values, setFieldValue, touched, isSubmitting, handleSubmit }) => (
                                                <Form onSubmit={handleSubmit}>
                                                    <Row>
                                                        <Col md={6} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    First Name
                                                                </Form.Label>
                                                                <Field
                                                                    name="firstName"
                                                                    type="text"
                                                                    className={`form-control form-control-lg ${errors.firstName && touched.firstName ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="firstName"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Last Name
                                                                </Form.Label>
                                                                <Field
                                                                    name="lastName"
                                                                    type="text"
                                                                    className={`form-control form-control-lg ${errors.lastName && touched.lastName ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="lastName"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={6} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Date of Birth
                                                                </Form.Label>
                                                                <Field
                                                                    name="dateOfBirth"
                                                                    type="date"
                                                                    className={`form-control form-control-lg ${errors.dateOfBirth && touched.dateOfBirth ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="dateOfBirth"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Phone Number
                                                                </Form.Label>
                                                                <PhoneInput
                                                                    inputProps={{
                                                                        name: 'phone',
                                                                        required: true,
                                                                        autoComplete: 'tel'
                                                                    }}
                                                                    country={'us'}
                                                                    onlyCountries={['us']}
                                                                    autoFormat={true}
                                                                    placeholder="Enter your phone number"
                                                                    value={values.phone}
                                                                    onChange={(phone) => setFieldValue("phone", phone)}
                                                                    inputClass={`${styles.phoneInput} ${errors.phone && touched.phone ? styles.inputError : ''}`}
                                                                    containerClass={styles.phoneContainer}
                                                                    buttonClass={styles.phoneButton}
                                                                />
                                                                <ErrorMessage
                                                                    name="phone"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <div className="d-flex gap-3">
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            size="lg"
                                                            disabled={isSubmitting}
                                                            className="px-4"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                'Update Profile'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline-secondary"
                                                            size="lg"
                                                            onClick={() => navigate('/')}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>

                                    </div>

                                )}

                                {activeTab === 'paypal' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-paypal me-2"></i>
                                            PayPal Settings
                                        </h4>
                                        <Formik
                                            enableReinitialize
                                            initialValues={{
                                                payoutEmailAddress: payout?.payout_email_address || '',
                                                payoutPayerID: payout?.payout_payer_id || '',
                                            }}
                                            validationSchema={Yup.object().shape({
                                                payoutEmailAddress: Yup.string().required("Payout email address is required"),
                                                payoutPayerID: Yup.string().required("Payout ID is required")
                                            })}
                                            onSubmit={handlePayoutSubmit}
                                        >
                                            {({ errors, touched, isSubmitting, handleSubmit }) => (
                                                <Form onSubmit={handleSubmit}>
                                                    <Row>
                                                        <Col md={6} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Paypal Email Address
                                                                </Form.Label>
                                                                <Field
                                                                    name="payoutEmailAddress"
                                                                    type="email"
                                                                    className={`form-control form-control-lg ${errors.payoutEmailAddress && touched.payoutEmailAddress ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="payoutEmailAddress"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Paypal PayerID
                                                                </Form.Label>
                                                                <Field
                                                                    name="payoutPayerID"
                                                                    type="text"
                                                                    className={`form-control form-control-lg ${errors.payoutPayerID && touched.payoutPayerID ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="payoutPayerID"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <div className="d-flex gap-3">
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            size="lg"
                                                            disabled={isSubmitting}
                                                            className="px-4"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                'Update Payout'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline-secondary"
                                                            size="lg"
                                                            onClick={() => navigate('/')}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                )}

                                {activeTab === 'password' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-lock me-2"></i>
                                            Change Password
                                        </h4>
                                        <Formik
                                            initialValues={{
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            }}
                                            validationSchema={Yup.object().shape({
                                                currentPassword: Yup.string().required("Current password is required"),
                                                newPassword: Yup.string()
                                                    .min(8, "Password must be at least 8 characters")
                                                    .required("New password is required"),
                                                confirmPassword: Yup.string()
                                                    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                                                    .required("Please confirm your password")
                                            })}
                                            onSubmit={handlePasswordSubmit}
                                        >
                                            {({ errors, touched, isSubmitting, handleSubmit }) => (
                                                <Form onSubmit={handleSubmit} className={styles.maxW500}>
                                                    <Row>
                                                        <Col md={8} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Current Password
                                                                </Form.Label>
                                                                <Field
                                                                    name="currentPassword"
                                                                    type="password"
                                                                    className={`form-control form-control-lg ${errors.currentPassword && touched.currentPassword ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="currentPassword"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={8} className="mb-3">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    New Password
                                                                </Form.Label>
                                                                <Field
                                                                    name="newPassword"
                                                                    type="password"
                                                                    className={`form-control form-control-lg ${errors.newPassword && touched.newPassword ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="newPassword"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={8} className="mb-4">
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold">
                                                                    Confirm New Password
                                                                </Form.Label>
                                                                <Field
                                                                    name="confirmPassword"
                                                                    type="password"
                                                                    className={`form-control form-control-lg ${errors.confirmPassword && touched.confirmPassword ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="confirmPassword"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        size="lg"
                                                        disabled={isSubmitting}
                                                        className="px-4"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Changing...
                                                            </>
                                                        ) : (
                                                            'Change Password'
                                                        )}
                                                    </Button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                )}

                                {activeTab === 'contributions' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-lock me-2"></i>
                                            Contributions
                                        </h4>
                                        <div>
                                            <Table responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Pool</th>
                                                        <th>Amount</th>
                                                        <th>Transaction ID</th>
                                                        <th>Status</th>
                                                        <th>Created Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contributions?.pagination?.totalItems > 0 ? (
                                                        contributions.transactions.map((item, index) => (
                                                            <tr key={item.id || index}>
                                                                <td>{item?.Pool?.name || 'N/A'}</td>
                                                                <td>${item?.amount || 0}</td>
                                                                <td>{item?.transaction_id || 'N/A'}</td>
                                                                <td>{item?.status || 'N/A'}</td>
                                                                <td>{item?.createdAt ? moment(item.createdAt).format("dddd, Do MMMM YYYY, h:mm:ss A") : 'N/A'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            {/* Fixed colSpan to match number of columns */}
                                                            <td colSpan="5" className="text-center text-muted">
                                                                {contributions ? 'No contributions found' : 'Loading...'}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>

                                            {contributions?.pagination?.totalPages > 1 && (
                                                <div className="d-flex justify-content-center mt-3">
                                                    <Pagination>
                                                        <Pagination.Prev
                                                            onClick={() => handlePageChangeContributionByUserId(contributions.pagination.currentPage - 1)}
                                                            disabled={contributions.pagination.currentPage === 1}
                                                        />

                                                        {Array.from({ length: contributions.pagination.totalPages }, (_, i) => i + 1).map((number) => (
                                                            <Pagination.Item
                                                                key={number}
                                                                active={number === contributions.pagination.currentPage}
                                                                onClick={() => handlePageChangeContributionByUserId(number)}
                                                            >
                                                                {number}
                                                            </Pagination.Item>
                                                        ))}

                                                        <Pagination.Next
                                                            onClick={() => handlePageChangeContributionByUserId(contributions.pagination.currentPage + 1)}
                                                            disabled={contributions.pagination.currentPage === contributions.pagination.totalPages}
                                                        />
                                                    </Pagination>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'subscriptions' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-bell me-2"></i>
                                            Subscriptions
                                        </h4>
                                        <div>
                                            <Button onClick={() => setShowSubscribeModal(true)} style={{ float: 'right' }}>Plans</Button>
                                            <br></br>
                                            <Tabs
                                                defaultActiveKey="subscription"
                                                className="mb-3"
                                            >
                                                <Tab eventKey="subscription" title="Current Subscription">
                                                    {subscription ? (
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <h5 className="card-title">{subscription.PoolsPlan?.name || 'Premium Membership'}</h5>
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <p><strong>Status:</strong>
                                                                            <span className={`badge ${subscription.status === 'ACTIVE' ? 'bg-success' : subscription.status === 'CANCELLED' ? 'bg-danger' : 'bg-warning'} ms-2`}>
                                                                                {subscription.status}
                                                                            </span>
                                                                        </p>
                                                                        <p><strong>Plan Price:</strong> ${subscription.subscription_renewal_amount || subscription.PoolsPlan?.price}</p>
                                                                        <p><strong>Subscription ID:</strong> {subscription.subscriptionId}</p>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <p><strong>Start Date:</strong> {moment(subscription.startDate).format("MMMM Do, YYYY")}</p>
                                                                        <p><strong>End Date:</strong> {moment(subscription.endDate).format("MMMM Do, YYYY")}</p>
                                                                        <p><strong>Billing Cycle:</strong> {subscription.PoolsPlan?.type || 'Monthly'}</p>
                                                                    </div>
                                                                </div>
                                                                {subscription.PoolsPlan?.description && (
                                                                    <div className="mt-3">
                                                                        <h6>Plan Features:</h6>
                                                                        <div
                                                                            dangerouslySetInnerHTML={{ __html: subscription.PoolsPlan.description }}
                                                                            className="small"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-muted py-4">
                                                            <p>No active subscription found</p>
                                                        </div>
                                                    )}
                                                </Tab>

                                                <Tab eventKey="subscriptionPayment" title="Payment History">
                                                    {subscriptionsPayments?.transactions?.length > 0 ? (
                                                        <div>
                                                            <Table responsive>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Date</th>
                                                                        <th>Amount</th>
                                                                        <th>Type</th>
                                                                        <th>Status</th>
                                                                        <th>Summary</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {subscriptionsPayments.transactions.map((payment, index) => (
                                                                        <tr key={payment.id || index}>
                                                                            <td>{moment(payment.createdAt).format("MMM Do, YYYY")}</td>
                                                                            <td>${payment.total_amount}</td>
                                                                            <td>{payment.event_type}</td>
                                                                            <td>
                                                                                <span className={`badge ${payment.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                                                                    {payment.status}
                                                                                </span>
                                                                            </td>
                                                                            <td>{payment.summary}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>

                                                            {subscriptionsPayments?.pagination?.totalPages > 1 && (
                                                                <div className="d-flex justify-content-center mt-3">
                                                                    <Pagination>
                                                                        <Pagination.Prev
                                                                            onClick={() => dispatch(getSubscriptionsPayments({
                                                                                userId: currentUser.user.id,
                                                                                page: subscriptionsPayments.pagination.currentPage - 1,
                                                                                pageSize: 20
                                                                            }))}
                                                                            disabled={subscriptionsPayments.pagination.currentPage === 1}
                                                                        />
                                                                        {Array.from({ length: subscriptionsPayments.pagination.totalPages }, (_, i) => i + 1).map((number) => (
                                                                            <Pagination.Item
                                                                                key={number}
                                                                                active={number === subscriptionsPayments.pagination.currentPage}
                                                                                onClick={() => dispatch(getSubscriptionsPayments({
                                                                                    userId: currentUser.user.id,
                                                                                    page: number,
                                                                                    pageSize: 20
                                                                                }))}
                                                                            >
                                                                                {number}
                                                                            </Pagination.Item>
                                                                        ))}
                                                                        <Pagination.Next
                                                                            onClick={() => dispatch(getSubscriptionsPayments({
                                                                                userId: currentUser.user.id,
                                                                                page: subscriptionsPayments.pagination.currentPage + 1,
                                                                                pageSize: 20
                                                                            }))}
                                                                            disabled={subscriptionsPayments.pagination.currentPage === subscriptionsPayments.pagination.totalPages}
                                                                        />
                                                                    </Pagination>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-muted py-4">
                                                            <p>No payment history found</p>
                                                        </div>
                                                    )}
                                                </Tab>

                                                <Tab eventKey="subscriptionHistory" title="Subscription History">
                                                    {subscriptionHistory?.transactions?.length > 0 ? (
                                                        <div>
                                                            <Table responsive>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Date</th>
                                                                        <th>Event Type</th>
                                                                        <th>Amount</th>
                                                                        <th>Status</th>
                                                                        <th>Summary</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {subscriptionHistory.transactions.map((history, index) => (
                                                                        <tr key={history.id || index}>
                                                                            <td>{moment(history.createdAt).format("MMM Do, YYYY")}</td>
                                                                            <td>{history.event_type}</td>
                                                                            <td>${history.total_amount}</td>
                                                                            <td>
                                                                                <span className={`badge ${history.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                                                                    {history.status}
                                                                                </span>
                                                                            </td>
                                                                            <td>{history.summary}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>

                                                            {subscriptionHistory?.pagination?.totalPages > 1 && (
                                                                <div className="d-flex justify-content-center mt-3">
                                                                    <Pagination>
                                                                        <Pagination.Prev
                                                                            onClick={() => dispatch(getSubscriptionHistory({
                                                                                userId: currentUser.user.id,
                                                                                page: subscriptionHistory.pagination.currentPage - 1,
                                                                                pageSize: 20
                                                                            }))}
                                                                            disabled={subscriptionHistory.pagination.currentPage === 1}
                                                                        />
                                                                        {Array.from({ length: subscriptionHistory.pagination.totalPages }, (_, i) => i + 1).map((number) => (
                                                                            <Pagination.Item
                                                                                key={number}
                                                                                active={number === subscriptionHistory.pagination.currentPage}
                                                                                onClick={() => dispatch(getSubscriptionHistory({
                                                                                    userId: currentUser.user.id,
                                                                                    page: number,
                                                                                    pageSize: 20
                                                                                }))}
                                                                            >
                                                                                {number}
                                                                            </Pagination.Item>
                                                                        ))}
                                                                        <Pagination.Next
                                                                            onClick={() => dispatch(getSubscriptionHistory({
                                                                                userId: currentUser.user.id,
                                                                                page: subscriptionHistory.pagination.currentPage + 1,
                                                                                pageSize: 20
                                                                            }))}
                                                                            disabled={subscriptionHistory.pagination.currentPage === subscriptionHistory.pagination.totalPages}
                                                                        />
                                                                    </Pagination>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-muted py-4">
                                                            <p>No subscription history found</p>
                                                        </div>
                                                    )}
                                                </Tab>
                                            </Tabs>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'social' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-share me-2"></i>
                                            Social Media Links
                                        </h4>
                                        <p className="text-muted mb-4">
                                            Connect your social media accounts to share content and grow your audience
                                        </p>

                                        <Formik
                                            initialValues={socialMediaInitialValues}
                                            onSubmit={handleSocialMediaLinkUpdate}
                                            enableReinitialize={true}
                                        >
                                            {({ errors, values, touched, isSubmitting, handleSubmit, isValid, dirty }) => (
                                                <Form onSubmit={handleSubmit}>
                                                    <FieldArray name="paramLists">
                                                        {() => (
                                                            <Row className="g-3">
                                                                {values.paramLists.map((social, index) => {
                                                                    const socialConfig = {
                                                                        Twitter: { icon: 'bi-twitter', color: '#1DA1F2', placeholder: 'https://twitter.com/username' },
                                                                        Facebook: { icon: 'bi-facebook', color: '#1877F2', placeholder: 'https://facebook.com/username' },
                                                                        Youtube: { icon: 'bi-youtube', color: '#FF0000', placeholder: 'https://youtube.com/c/username' },
                                                                        Vimeo: { icon: 'bi-vimeo', color: '#1AB7EA', placeholder: 'https://vimeo.com/username' },
                                                                        Instagram: { icon: 'bi-instagram', color: '#E4405F', placeholder: 'https://instagram.com/username' },
                                                                        LinkedIn: { icon: 'bi-linkedin', color: '#0A66C2', placeholder: 'https://linkedin.com/in/username' },
                                                                        Pinterest: { icon: 'bi-pinterest', color: '#BD081C', placeholder: 'https://pinterest.com/username' }
                                                                    };

                                                                    const config = socialConfig[social.social_media] || {};

                                                                    return (
                                                                        <Col md={6} key={index}>
                                                                            <Card className={`h-100 ${styles.socialCard} ${values.paramLists[index].link ? styles.hasLink : ''}`}>
                                                                                <Card.Body className="p-3">
                                                                                    <div className="d-flex align-items-center mb-3">
                                                                                        <div
                                                                                            className={styles.socialIcon}
                                                                                            style={{ backgroundColor: config.color }}
                                                                                        >
                                                                                            <i className={`bi ${config.icon} text-white`}></i>
                                                                                        </div>
                                                                                        <div className="ms-3">
                                                                                            <h6 className="mb-0 fw-bold">{social.social_media}</h6>
                                                                                            <small className="text-muted">
                                                                                                {values.paramLists[index].link ? 'Connected' : 'Not connected'}
                                                                                            </small>
                                                                                        </div>
                                                                                    </div>

                                                                                    <Form.Group>
                                                                                        <Form.Label className="small fw-semibold mb-2">
                                                                                            Profile URL
                                                                                        </Form.Label>
                                                                                        <div className="input-group">
                                                                                            <span className="input-group-text bg-light">
                                                                                                <i className={`bi ${config.icon} me-1`}></i>
                                                                                            </span>
                                                                                            <Field
                                                                                                name={`paramLists.${index}.link`}
                                                                                                type="url"
                                                                                                className={`form-control ${errors.paramLists?.[index]?.link && touched.paramLists?.[index]?.link ? "is-invalid" : ""}`}
                                                                                                placeholder={config.placeholder}
                                                                                            />
                                                                                        </div>
                                                                                        <ErrorMessage
                                                                                            name={`paramLists.${index}.link`}
                                                                                            component="div"
                                                                                            className="invalid-feedback"
                                                                                        />
                                                                                    </Form.Group>

                                                                                    {values.paramLists[index].link && (
                                                                                        <div className="mt-2">
                                                                                            <a
                                                                                                href={values.paramLists[index].link}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="btn btn-outline-primary btn-sm w-100"
                                                                                            >
                                                                                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                                                                                Visit Profile
                                                                                            </a>
                                                                                        </div>
                                                                                    )}
                                                                                </Card.Body>
                                                                            </Card>
                                                                        </Col>
                                                                    );
                                                                })}
                                                            </Row>
                                                        )}
                                                    </FieldArray>

                                                    <div className="d-flex gap-3 mt-4 pt-3 border-top">
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            size="lg"
                                                            disabled={isSubmitting}
                                                            className="px-4 btn btn-primary"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-check-circle me-2"></i>
                                                                    Update Social Links
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline-secondary"
                                                            size="lg"
                                                            onClick={() => navigate('/')}
                                                        >
                                                            <i className="bi bi-arrow-left me-2"></i>
                                                            Back to Home
                                                        </Button>
                                                    </div>

                                                    {/* Preview Section */}
                                                    {dirty && (
                                                        <Card className="mt-4 border-warning">
                                                            <Card.Body>
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <i className="bi bi-eye text-warning me-2"></i>
                                                                    <h6 className="mb-0 fw-semibold">Preview</h6>
                                                                </div>
                                                                <p className="text-muted small mb-3">
                                                                    This is how your social links will appear to others
                                                                </p>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    {values.paramLists
                                                                        .filter(social => social.link)
                                                                        .map((social, index) => {
                                                                            const socialConfig = {
                                                                                Twitter: { icon: 'bi-twitter', color: '#1DA1F2' },
                                                                                Facebook: { icon: 'bi-facebook', color: '#1877F2' },
                                                                                Youtube: { icon: 'bi-youtube', color: '#FF0000' },
                                                                                Vimeo: { icon: 'bi-vimeo', color: '#1AB7EA' },
                                                                                Instagram: { icon: 'bi-instagram', color: '#E4405F' },
                                                                                LinkedIn: { icon: 'bi-linkedin', color: '#0A66C2' },
                                                                                Pinterest: { icon: 'bi-pinterest', color: '#BD081C' }
                                                                            };
                                                                            const config = socialConfig[social.social_media] || {};

                                                                            return (
                                                                                <a
                                                                                    key={index}
                                                                                    href={social.link}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className={`btn btn-sm ${styles.socialPreviewBtn}`}
                                                                                    style={{ borderColor: config.color, color: config.color }}
                                                                                    title={`Visit ${social.social_media}`}
                                                                                >
                                                                                    <i className={`bi ${config.icon} me-1`}></i>
                                                                                    {social.social_media}
                                                                                </a>
                                                                            );
                                                                        })
                                                                    }
                                                                    {values.paramLists.filter(social => social.link).length === 0 && (
                                                                        <span className="text-muted small">No social links added yet</span>
                                                                    )}
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    )}
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-share me-2"></i>
                                            Settings
                                        </h4>

                                        <br></br>
                                        <br></br>
                                        <Formik
                                            initialValues={{
                                                notification_email: settings?.notification_email || false,
                                                notification_sms: settings?.notification_sms || false,
                                            }}
                                            onSubmit={handleUpdateUserSettings}
                                            enableReinitialize={true}
                                        >
                                            {({ errors, values, touched, isSubmitting, handleSubmit, setFieldValue }) => (
                                                <Form onSubmit={handleSubmit}>
                                                    {/* Notification SMS Field */}
                                                    <div className="account-info-field-item">
                                                        <label htmlFor="notification_sms" className="text-title-3">
                                                            Notification SMS
                                                        </label>
                                                        <div>
                                                            <label className="d-flex align-items-center gap-2 cursor-pointer">
                                                                <span>Off</span>
                                                                <Switch
                                                                    id="notification_sms"
                                                                    checked={values.notification_sms}
                                                                    onChange={(checked) => setFieldValue('notification_sms', checked)}
                                                                    aria-label="Toggle SMS notifications"
                                                                />
                                                                <span>On</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="my-4" />

                                                    {/* Notification Email Field */}
                                                    <div className="account-info-field-item">
                                                        <label htmlFor="notification_email" className="text-title-3">
                                                            Notification Email
                                                        </label>
                                                        <div>
                                                            <label className="d-flex align-items-center gap-2 cursor-pointer">
                                                                <span>Off</span>
                                                                <Switch
                                                                    id="notification_email"
                                                                    checked={values.notification_email}
                                                                    onChange={(checked) => setFieldValue('notification_email', checked)}
                                                                    aria-label="Toggle email notifications"
                                                                />
                                                                <span>On</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="my-4" />

                                                    {/* Action Buttons */}
                                                    <div className="d-flex gap-3">
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            size="lg"
                                                            disabled={isSubmitting}
                                                            className="px-4"
                                                            aria-label="Update notification settings"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                'Update Settings'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline-secondary"
                                                            size="lg"
                                                            onClick={() => navigate('/')}
                                                            aria-label="Cancel and go back"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                )}

                                {activeTab === 'api' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-share me-2"></i>
                                            My Projects
                                        </h4>

                                        <p className="text-muted mb-4">
                                            Manage your API projects and credentials. Keep your client secret secure and never share it publicly.
                                        </p>

                                        {/* Create New Project Button */}
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0">API Projects</h5>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => { setShowAppModal(true) }}
                                            >
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Create New Project
                                            </Button>
                                        </div>

                                        {apps?.length > 0 ? (
                                            <Row className="g-3">
                                                {apps.map((project) => (
                                                    <Col md={6} lg={4} key={project?.id}>
                                                        <Card className={`h-100 ${styles.apiProjectCard}`}>
                                                            <Card.Body>
                                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                                    <h6 className="fw-bold mb-0">{project?.name}</h6>
                                                                </div>

                                                                <div className={styles.apiCredentials}>
                                                                    {/* Client ID */}
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label className="small fw-semibold mb-1">
                                                                            <i className="bi bi-key me-1"></i>
                                                                            Client ID
                                                                        </Form.Label>
                                                                        <div className="input-group input-group-sm">
                                                                            <Form.Control
                                                                                type="text"
                                                                                value={project?.client_id}
                                                                                readOnly
                                                                                className="form-control-sm"
                                                                            />
                                                                            <Button
                                                                                variant="outline-secondary"
                                                                                size="sm"
                                                                                onClick={() => navigator.clipboard.writeText(project?.client_id)}
                                                                            >
                                                                                <i className="bi bi-clipboard"></i>
                                                                            </Button>
                                                                        </div>
                                                                    </Form.Group>

                                                                    {/* Client Secret */}
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label className="small fw-semibold mb-1">
                                                                            <i className="bi bi-shield-lock me-1"></i>
                                                                            Client Secret
                                                                        </Form.Label>
                                                                        <div className="input-group input-group-sm">
                                                                            <Form.Control
                                                                                type="password"
                                                                                value={project?.client_secret}
                                                                                readOnly
                                                                                className="form-control-sm"
                                                                            />
                                                                            <Button
                                                                                variant="outline-warning"
                                                                                size="sm"
                                                                                onClick={() => navigator.clipboard.writeText(project?.client_secret)}
                                                                            >
                                                                                <i className="bi bi-clipboard"></i>
                                                                            </Button>
                                                                        </div>
                                                                        <Form.Text className="text-warning">
                                                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                                                            Keep this secret secure
                                                                        </Form.Text>
                                                                    </Form.Group>
                                                                </div>

                                                                <div className={styles.projectMeta}>
                                                                    <small className="text-muted">
                                                                        <i className="bi bi-calendar me-1"></i>
                                                                        Created: {moment(project?.createdAt).format("MMM Do, YYYY")}
                                                                    </small>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        ) : (
                                            <Card className="text-center py-5">
                                                <Card.Body>
                                                    <i className="bi bi-key fa-3x text-muted mb-3"></i>
                                                    <h5 className="text-muted">No API Projects</h5>
                                                    <p className="text-muted mb-3">
                                                        You haven't created any API projects yet. Create your first project to get started.
                                                    </p>
                                                    <Button variant="primary" onClick={() => { setShowAppModal(true) }}>
                                                        <i className="bi bi-plus-circle me-2"></i>
                                                        Create Your First Project
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        )}

                                        {/* API Documentation Link */}
                                        <Card className="mt-4 border-info">
                                            <Card.Body className="py-3">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-info-circle text-info me-3 fa-lg"></i>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 fw-semibold">Need help with API integration?</h6>
                                                        <p className="mb-0 small text-muted">
                                                            Check out our API documentation for detailed guides and examples.
                                                        </p>
                                                    </div>
                                                    <Button variant="outline-info" size="sm">
                                                        <i className="bi bi-book me-2"></i>
                                                        View Documentation
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'referrals' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-people me-2"></i>
                                            Referral Program
                                        </h4>

                                        <div className="row">
                                            {/* Header Section */}
                                            <div className="col-12 mb-4">
                                                <Card className={`${styles.referralHeaderCard} border-0 text-white`}>
                                                    <Card.Body className="text-center py-4">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-8 text-md-start text-center">
                                                                <h2 className="fw-bold mb-2">Share & Earn $5</h2>
                                                                <p className="mb-0 opacity-90">
                                                                    Invite friends and earn $5 in credits for each successful referral
                                                                </p>
                                                            </div>
                                                            <div className="col-md-4 text-md-end text-center">
                                                                <div className={styles.creditsDisplay}>
                                                                    <span className={styles.creditsLabel}>Total Earned</span>
                                                                    <h1 className={`${styles.creditsAmount} fw-bold`}>
                                                                        ${profile?.credits_earned ? profile.credits_earned : 0}
                                                                    </h1>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* QR Code and Sharing Section */}
                                            <div className="col-lg-8 mb-4">
                                                <Card className={`${styles.referralCard} h-100`}>
                                                    <Card.Body className="p-4">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-6 text-center mb-4 mb-md-0">
                                                                <div className={styles.qrCodeContainer}>
                                                                    <QRCode
                                                                        size={200}
                                                                        style={{
                                                                            height: "auto",
                                                                            maxWidth: "100%",
                                                                            width: "100%",
                                                                        }}
                                                                        value={
                                                                            window.location.origin +
                                                                            "/register?referral=" +
                                                                            currentUser.user.referral_code
                                                                        }
                                                                        viewBox={`0 0 256 256`}
                                                                    />
                                                                </div>
                                                                <p className="text-muted small mt-3">
                                                                    Scan to share your referral code
                                                                </p>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <h5 className="fw-bold mb-3">Share Your Link</h5>

                                                                {/* Referral Link */}
                                                                <div className="mb-4">
                                                                    <Form.Label className="fw-semibold small text-muted mb-2">
                                                                        Your Personal Referral Link
                                                                    </Form.Label>
                                                                    <div className="input-group">
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={
                                                                                window.location.origin +
                                                                                "/register?referral=" +
                                                                                currentUser.user.referral_code
                                                                            }
                                                                            readOnly
                                                                            className={styles.referralInput}
                                                                        />
                                                                        <CopyToClipboard
                                                                            text={
                                                                                window.location.origin +
                                                                                "/register?referral=" +
                                                                                currentUser.user.referral_code
                                                                            }
                                                                            onCopy={() => {
                                                                                dispatch(setMessage({
                                                                                    message: 'Referral link copied to clipboard!',
                                                                                    type: 'success'
                                                                                }));
                                                                            }}
                                                                        >
                                                                            <Button variant="primary" className={styles.copyButton}>
                                                                                <i className="bi bi-clipboard me-2"></i>
                                                                                Copy
                                                                            </Button>
                                                                        </CopyToClipboard>
                                                                    </div>
                                                                </div>

                                                                {/* Referral Code */}
                                                                <div className="mb-4">
                                                                    <Form.Label className="fw-semibold small text-muted mb-2">
                                                                        Your Referral Code
                                                                    </Form.Label>
                                                                    <div className="input-group">
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={currentUser.user.referral_code}
                                                                            readOnly
                                                                            className={styles.referralInput}
                                                                        />
                                                                        <CopyToClipboard
                                                                            text={currentUser.user.referral_code}
                                                                            onCopy={() => {
                                                                                dispatch(setMessage({
                                                                                    message: 'Referral code copied to clipboard!',
                                                                                    type: 'success'
                                                                                }));
                                                                            }}
                                                                        >
                                                                            <Button variant="outline-primary" className={styles.copyButton}>
                                                                                <i className="bi bi-clipboard me-2"></i>
                                                                                Copy
                                                                            </Button>
                                                                        </CopyToClipboard>
                                                                    </div>
                                                                </div>

                                                                {/* Social Sharing Buttons */}
                                                                <div>
                                                                    <Form.Label className="fw-semibold small text-muted mb-2">
                                                                        Share via
                                                                    </Form.Label>
                                                                    <div className="d-flex gap-2 flex-wrap">
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const text = `Join me on Collectly! Use my referral code: ${currentUser.user.referral_code}`;
                                                                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-twitter me-1"></i>
                                                                            Twitter
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const text = `Join me on Collectly! Use my referral code: ${currentUser.user.referral_code}`;
                                                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/register')}&quote=${encodeURIComponent(text)}`, '_blank');
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-facebook me-1"></i>
                                                                            Facebook
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const text = `Join me on Collectly! Use my referral code ${currentUser.user.referral_code} to get started: ${window.location.origin}/register?referral=${currentUser.user.referral_code}`;
                                                                                navigator.clipboard.writeText(text);
                                                                                dispatch(setMessage({
                                                                                    message: 'Share message copied to clipboard!',
                                                                                    type: 'success'
                                                                                }));
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-link-45deg me-1"></i>
                                                                            Copy Text
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* Stats Section */}
                                            <div className="col-lg-4 mb-4">
                                                <Card className={`${styles.statsCard} h-100`}>
                                                    <Card.Body className="p-4">
                                                        <h5 className="fw-bold mb-4">Referral Stats</h5>

                                                        <div className={styles.statItem}>
                                                            <div className={styles.statIcon}>
                                                                <i className="bi bi-people"></i>
                                                            </div>
                                                            <div className={styles.statContent}>
                                                                <div className={styles.statNumber}>
                                                                    {referrals?.length || 0}
                                                                </div>
                                                                <div className={styles.statLabel}>
                                                                    Total Referrals
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={styles.statItem}>
                                                            <div className={styles.statIcon}>
                                                                <i className="bi bi-cash-coin"></i>
                                                            </div>
                                                            <div className={styles.statContent}>
                                                                <div className={styles.statNumber}>
                                                                    ${profile?.credits_earned || 0}
                                                                </div>
                                                                <div className={styles.statLabel}>
                                                                    Total Earnings
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={styles.statItem}>
                                                            <div className={styles.statIcon}>
                                                                <i className="bi bi-gift"></i>
                                                            </div>
                                                            <div className={styles.statContent}>
                                                                <div className={styles.statNumber}>
                                                                    $5
                                                                </div>
                                                                <div className={styles.statLabel}>
                                                                    Per Referral
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <hr className="my-4" />

                                                        <div className={styles.referralTips}>
                                                            <h6 className="fw-semibold mb-3">💡 Tips for Success</h6>
                                                            <ul className="list-unstyled small">
                                                                <li className="mb-2">
                                                                    <i className="bi bi-check-circle text-success me-2"></i>
                                                                    Share on social media
                                                                </li>
                                                                <li className="mb-2">
                                                                    <i className="bi bi-check-circle text-success me-2"></i>
                                                                    Send to friends & family
                                                                </li>
                                                                <li className="mb-2">
                                                                    <i className="bi bi-check-circle text-success me-2"></i>
                                                                    Post in relevant communities
                                                                </li>
                                                                <li>
                                                                    <i className="bi bi-check-circle text-success me-2"></i>
                                                                    Include in your email signature
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* Referrals Table */}
                                            <div className="col-12">
                                                <Card className={styles.referralsTableCard}>
                                                    <Card.Body className="p-0">
                                                        <div className="p-4 border-bottom">
                                                            <h5 className="fw-bold mb-0">
                                                                <i className="bi bi-list-check me-2"></i>
                                                                Referral History
                                                            </h5>
                                                        </div>

                                                        <div className="table-responsive">
                                                            <table className={`table table-hover mb-0 ${styles.referralsTable}`}>
                                                                <thead className={styles.tableHeader}>
                                                                    <tr>
                                                                        <th scope="col" className="ps-4">User</th>
                                                                        <th scope="col">Status</th>
                                                                        <th scope="col">Credits Earned</th>
                                                                        <th scope="col">Referral Date</th>
                                                                        <th scope="col" className="pe-4">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {referrals && referrals.length > 0 ? (
                                                                        referrals.map((referral, index) => (
                                                                            <tr key={referral.id} className={styles.referralRow}>
                                                                                <td className="ps-4">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className={styles.userAvatar}>
                                                                                            {referral.User?.firstName?.charAt(0)}{referral.User?.lastName?.charAt(0)}
                                                                                        </div>
                                                                                        <div className="ms-3">
                                                                                            <div className="fw-semibold">
                                                                                                {referral.User?.firstName} {referral.User?.lastName}
                                                                                            </div>
                                                                                            <small className="text-muted">
                                                                                                {referral.User?.email}
                                                                                            </small>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <Badge
                                                                                        bg={referral.credits > 0 ? "success" : "warning"}
                                                                                        className={styles.statusBadge}
                                                                                    >
                                                                                        {referral.credits > 0 ? "Active" : "Pending"}
                                                                                    </Badge>
                                                                                </td>
                                                                                <td>
                                                                                    <span className={`fw-bold ${styles.creditsText}`}>
                                                                                        ${referral.credits || 0}
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    <div className="text-muted">
                                                                                        {moment(new Date(referral.createdAt)).format('MMM Do, YYYY')}
                                                                                    </div>
                                                                                    <small className="text-muted">
                                                                                        {moment(new Date(referral.createdAt)).format('h:mm A')}
                                                                                    </small>
                                                                                </td>
                                                                                <td className="pe-4">
                                                                                    <Button
                                                                                        variant="outline-primary"
                                                                                        size="sm"
                                                                                        onClick={() => {
                                                                                            // Add action for viewing user profile
                                                                                            dispatch(setMessage({
                                                                                                message: 'View user profile feature coming soon!',
                                                                                                type: 'info'
                                                                                            }));
                                                                                        }}
                                                                                    >
                                                                                        <i className="bi bi-eye me-1"></i>
                                                                                        View
                                                                                    </Button>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="5" className="text-center py-5">
                                                                                <div className={styles.emptyState}>
                                                                                    <i className="bi bi-people display-4 text-muted mb-3"></i>
                                                                                    <h5 className="text-muted">No referrals yet</h5>
                                                                                    <p className="text-muted mb-3">
                                                                                        Start sharing your referral link to earn credits!
                                                                                    </p>
                                                                                    <Button
                                                                                        variant="primary"
                                                                                        onClick={() => {
                                                                                            const link = window.location.origin + "/register?referral=" + currentUser.user.referral_code;
                                                                                            navigator.clipboard.writeText(link);
                                                                                            dispatch(setMessage({
                                                                                                message: 'Referral link copied! Start sharing!',
                                                                                                type: 'success'
                                                                                            }));
                                                                                        }}
                                                                                    >
                                                                                        <i className="bi bi-share me-2"></i>
                                                                                        Copy Referral Link
                                                                                    </Button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'identity' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-person-badge me-2"></i>
                                            Identity Verification
                                        </h4>

                                        <div className="row">
                                            {/* Status Overview */}
                                            <div className="col-lg-8 mb-4">
                                                <Card className={`${styles.verificationCard} h-100`}>
                                                    <Card.Body className="p-4">
                                                        <h5 className="fw-bold mb-4">Verification Status</h5>

                                                        {/* Email Verification Status */}
                                                        <div className={`${styles.verificationItem} ${identityVerificationStatus?.email ? styles.verified : styles.pending}`}>
                                                            <div className={styles.verificationIcon}>
                                                                <i className={`bi ${identityVerificationStatus?.email ? 'bi-check-circle-fill' : 'bi-envelope'} ${identityVerificationStatus?.email ? styles.verifiedIcon : styles.pendingIcon}`}></i>
                                                            </div>
                                                            <div className={styles.verificationContent}>
                                                                <div className={styles.verificationTitle}>
                                                                    Email Verification
                                                                </div>
                                                                <div className={styles.verificationDescription}>
                                                                    {identityVerificationStatus?.email
                                                                        ? 'Your email address has been successfully verified'
                                                                        : 'Please verify your email address to secure your account'
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className={styles.verificationStatus}>
                                                                <Badge
                                                                    bg={identityVerificationStatus?.email ? "success" : "warning"}
                                                                    className={styles.statusBadge}
                                                                >
                                                                    {identityVerificationStatus?.email ? "Verified" : "Pending"}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {/* Additional verification methods can be added here */}
                                                        <div className={`${styles.verificationItem} ${styles.comingSoon}`}>
                                                            <div className={styles.verificationIcon}>
                                                                <i className="bi bi-phone text-muted"></i>
                                                            </div>
                                                            <div className={styles.verificationContent}>
                                                                <div className={styles.verificationTitle}>
                                                                    Phone Verification
                                                                </div>
                                                                <div className={styles.verificationDescription}>
                                                                    Verify your phone number for additional security
                                                                </div>
                                                            </div>
                                                            <div className={styles.verificationStatus}>
                                                                <Badge bg="secondary" className={styles.statusBadge}>
                                                                    Coming Soon
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.verificationItem} ${styles.comingSoon}`}>
                                                            <div className={styles.verificationIcon}>
                                                                <i className="bi bi-id-card text-muted"></i>
                                                            </div>
                                                            <div className={styles.verificationContent}>
                                                                <div className={styles.verificationTitle}>
                                                                    ID Document Verification
                                                                </div>
                                                                <div className={styles.verificationDescription}>
                                                                    Upload government-issued ID for enhanced account features
                                                                </div>
                                                            </div>
                                                            <div className={styles.verificationStatus}>
                                                                <Badge bg="secondary" className={styles.statusBadge}>
                                                                    Coming Soon
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* Benefits & Actions */}
                                            <div className="col-lg-4 mb-4">
                                                <Card className={`${styles.verificationBenefits} h-100`}>
                                                    <Card.Body className="p-4">
                                                        <h5 className="fw-bold mb-3">Verification Benefits</h5>

                                                        <div className={styles.benefitItem}>
                                                            <i className="bi bi-shield-check text-success me-2"></i>
                                                            <span>Enhanced account security</span>
                                                        </div>
                                                        <div className={styles.benefitItem}>
                                                            <i className="bi bi-arrow-up-circle text-success me-2"></i>
                                                            <span>Higher contribution limits</span>
                                                        </div>
                                                        <div className={styles.benefitItem}>
                                                            <i className="bi bi-lightning-charge text-success me-2"></i>
                                                            <span>Faster payout processing</span>
                                                        </div>
                                                        <div className={styles.benefitItem}>
                                                            <i className="bi bi-star text-success me-2"></i>
                                                            <span>Access to premium features</span>
                                                        </div>

                                                        <hr className="my-4" />

                                                        {/* Action Buttons */}
                                                        <div className="d-grid gap-2">
                                                            {!identityVerificationStatus?.email && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="lg"
                                                                    onClick={handleSendEmailVerification}
                                                                >
                                                                    <i className="bi bi-envelope me-2"></i>
                                                                    Verify Email Address
                                                                </Button>
                                                            )}

                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    dispatch(setMessage({
                                                                        message: 'Additional verification methods coming soon!',
                                                                        type: 'info'
                                                                    }));
                                                                }}
                                                            >
                                                                Learn More About Verification
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* Verification Progress */}
                                            <div className="col-12">
                                                <Card className={styles.verificationProgress}>
                                                    <Card.Body className="p-4">
                                                        <h5 className="fw-bold mb-3">Verification Progress</h5>

                                                        <div className={styles.progressContainer}>
                                                            <div className={styles.progressBar}>
                                                                <div
                                                                    className={styles.progressFill}
                                                                    style={{
                                                                        width: `${identityVerificationStatus?.email ? 25 : 0}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div className={styles.progressText}>
                                                                {identityVerificationStatus?.email ? '25% Complete' : '0% Complete'}
                                                            </div>
                                                        </div>

                                                        <div className="row text-center mt-4">
                                                            <div className="col-md-3">
                                                                <div className={styles.progressStep}>
                                                                    <div className={`${styles.stepIcon} ${identityVerificationStatus?.email ? styles.stepCompleted : ''}`}>
                                                                        <i className={`bi ${identityVerificationStatus?.email ? 'bi-check' : 'bi-1'}`}></i>
                                                                    </div>
                                                                    <div className={styles.stepLabel}>Email</div>
                                                                    <div className={styles.stepStatus}>
                                                                        {identityVerificationStatus?.email ? 'Verified' : 'Pending'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className={styles.progressStep}>
                                                                    <div className={styles.stepIcon}>
                                                                        <i className="bi bi-2 text-muted"></i>
                                                                    </div>
                                                                    <div className={styles.stepLabel}>Phone</div>
                                                                    <div className={styles.stepStatus}>Coming Soon</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className={styles.progressStep}>
                                                                    <div className={styles.stepIcon}>
                                                                        <i className="bi bi-3 text-muted"></i>
                                                                    </div>
                                                                    <div className={styles.stepLabel}>ID Document</div>
                                                                    <div className={styles.stepStatus}>Coming Soon</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className={styles.progressStep}>
                                                                    <div className={styles.stepIcon}>
                                                                        <i className="bi bi-4 text-muted"></i>
                                                                    </div>
                                                                    <div className={styles.stepLabel}>Complete</div>
                                                                    <div className={styles.stepStatus}>Locked</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'close' && (
                                    <div className={styles.tabContentInner}>
                                        <h4 className={styles.tabTitle}>
                                            <i className="bi bi-x-circle me-2"></i>
                                            Account Closure
                                        </h4>

                                        <div className="row">
                                            <div className="col-lg-8">
                                                <Card className={`${styles.closeAccountCard} border-0`}>
                                                    <Card.Body className="p-4">
                                                        {/* Account Deletion Status */}
                                                        {profile?.accountDeletionRequest && profile.accountDeletionRequest.length > 0 ? (
                                                            <div className={styles.deletionStatus}>
                                                                <div className="text-center mb-4">
                                                                    <div className={styles.statusIcon}>
                                                                        <i className="bi bi-hourglass-split text-warning"></i>
                                                                    </div>
                                                                    <h5 className="fw-bold text-warning mb-2">
                                                                        Account Deletion Pending
                                                                    </h5>
                                                                    <p className="text-muted">
                                                                        Your account deletion request is being processed.
                                                                        This usually takes 7-14 days to complete.
                                                                    </p>
                                                                </div>

                                                                {/* Deletion Request Details */}
                                                                <div className={styles.deletionDetails}>
                                                                    <h6 className="fw-semibold mb-3">Deletion Request Details</h6>
                                                                    <div className="row">
                                                                        <div className="col-md-6 mb-3">
                                                                            <div className={styles.detailItem}>
                                                                                <span className={styles.detailLabel}>Request Date:</span>
                                                                                <span className={styles.detailValue}>
                                                                                    {moment(profile.accountDeletionRequest[0].createdAt).format('MMMM Do, YYYY')}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <div className={styles.detailItem}>
                                                                                <span className={styles.detailLabel}>Status:</span>
                                                                                <span className={`badge bg-warning ${styles.statusBadge}`}>
                                                                                    Pending Processing
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 mb-3">
                                                                            <div className={styles.detailItem}>
                                                                                <span className={styles.detailLabel}>Request ID:</span>
                                                                                <span className={styles.detailValue}>
                                                                                    #{profile.accountDeletionRequest[0].id}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {profile.accountDeletionRequest[0].comment && (
                                                                            <div className="col-12">
                                                                                <div className={styles.detailItem}>
                                                                                    <span className={styles.detailLabel}>Comment:</span>
                                                                                    <span className={styles.detailValue}>
                                                                                        {profile.accountDeletionRequest[0].comment}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Important Information */}
                                                                <Alert variant="warning" className="mt-4">
                                                                    <Alert.Heading>
                                                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                                                        Important Information
                                                                    </Alert.Heading>
                                                                    <ul className="mb-0">
                                                                        <li>Your account will be permanently deleted after processing</li>
                                                                        <li>All your data, contributions, and history will be removed</li>
                                                                        <li>This action cannot be undone</li>
                                                                        <li>You will receive a confirmation email once processing is complete</li>
                                                                    </ul>
                                                                </Alert>
                                                            </div>
                                                        ) : (
                                                            /* No Deletion Request - Show Closure Options */
                                                            <div className={styles.closeAccountContent}>
                                                                <div className="text-center mb-4">
                                                                    <div className={styles.warningIcon}>
                                                                        <i className="bi bi-exclamation-triangle"></i>
                                                                    </div>
                                                                    <h5 className="fw-bold text-danger mb-3">
                                                                        Close Your Account
                                                                    </h5>
                                                                    <p className="text-muted mb-4">
                                                                        This action will permanently delete your account and all associated data.
                                                                        Please read the information below carefully before proceeding.
                                                                    </p>
                                                                </div>

                                                                {/* Consequences Section */}
                                                                <Card className="border-danger mb-4">
                                                                    <Card.Header className="bg-danger text-white">
                                                                        <h6 className="mb-0">
                                                                            <i className="bi bi-shield-exclamation me-2"></i>
                                                                            What happens when you close your account
                                                                        </h6>
                                                                    </Card.Header>
                                                                    <Card.Body>
                                                                        <ul className="list-unstyled mb-0">
                                                                            <li className="mb-2">
                                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                                All your personal information will be permanently deleted
                                                                            </li>
                                                                            <li className="mb-2">
                                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                                Your contribution history will be removed
                                                                            </li>
                                                                            <li className="mb-2">
                                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                                Any active subscriptions will be cancelled
                                                                            </li>
                                                                            <li className="mb-2">
                                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                                Your referral credits and earnings will be lost
                                                                            </li>
                                                                            <li className="mb-2">
                                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                                API projects and credentials will be revoked
                                                                            </li>
                                                                            <li>
                                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                                This action cannot be undone
                                                                            </li>
                                                                        </ul>
                                                                    </Card.Body>
                                                                </Card>

                                                                {/* Alternatives Section */}
                                                                <Card className="border-info mb-4">
                                                                    <Card.Header className="bg-info text-white">
                                                                        <h6 className="mb-0">
                                                                            <i className="bi bi-lightbulb me-2"></i>
                                                                            Consider these alternatives first
                                                                        </h6>
                                                                    </Card.Header>
                                                                    <Card.Body>
                                                                        <div className="row">
                                                                            <div className="col-md-6 mb-3">
                                                                                <div className="d-flex align-items-start">
                                                                                    <i className="bi bi-bell text-info me-3 mt-1"></i>
                                                                                    <div>
                                                                                        <h6 className="fw-semibold mb-1">Adjust Notifications</h6>
                                                                                        <p className="small text-muted mb-0">
                                                                                            Turn off email and SMS notifications in Settings
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                <div className="d-flex align-items-start">
                                                                                    <i className="bi bi-shield-lock text-info me-3 mt-1"></i>
                                                                                    <div>
                                                                                        <h6 className="fw-semibold mb-1">Update Privacy</h6>
                                                                                        <p className="small text-muted mb-0">
                                                                                            Adjust your privacy settings and social media links
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                <div className="d-flex align-items-start">
                                                                                    <i className="bi bi-pause-circle text-info me-3 mt-1"></i>
                                                                                    <div>
                                                                                        <h6 className="fw-semibold mb-1">Temporary Break</h6>
                                                                                        <p className="small text-muted mb-0">
                                                                                            Consider taking a break instead of permanent deletion
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                <div className="d-flex align-items-start">
                                                                                    <i className="bi bi-headset text-info me-3 mt-1"></i>
                                                                                    <div>
                                                                                        <h6 className="fw-semibold mb-1">Contact Support</h6>
                                                                                        <p className="small text-muted mb-0">
                                                                                            Reach out to our support team for assistance
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Card.Body>
                                                                </Card>

                                                                {/* Delete Account Form */}
                                                                <Card className="border-danger">
                                                                    <Card.Header className="bg-light">
                                                                        <h6 className="mb-0 text-danger">
                                                                            <i className="bi bi-trash me-2"></i>
                                                                            Request Account Deletion
                                                                        </h6>
                                                                    </Card.Header>
                                                                    <Card.Body>
                                                                        <Formik
                                                                            initialValues={{
                                                                                confirmText: '',
                                                                                reason: '',
                                                                                password: '',
                                                                                understandConsequences: false
                                                                            }}
                                                                            validationSchema={Yup.object().shape({
                                                                                confirmText: Yup.string()
                                                                                    .matches(/^DELETE MY ACCOUNT$/, 'Please type "DELETE MY ACCOUNT" to confirm')
                                                                                    .required('Confirmation text is required'),
                                                                                reason: Yup.string().required('Please provide a reason for deletion'),
                                                                                password: Yup.string().required('Your password is required to confirm deletion'),
                                                                                understandConsequences: Yup.boolean()
                                                                                    .oneOf([true], 'You must acknowledge the consequences')
                                                                            })}
                                                                            onSubmit={(values, { setSubmitting }) => {
                                                                                handleDeleteAccount(values);
                                                                                setSubmitting(false);
                                                                            }}
                                                                        >
                                                                            {({ errors, touched, isSubmitting, handleSubmit, values }) => (
                                                                                <Form onSubmit={handleSubmit}>
                                                                                    {/* Reason for Deletion */}
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label className="fw-semibold">
                                                                                            Reason for leaving
                                                                                        </Form.Label>
                                                                                        <Field
                                                                                            as="select"
                                                                                            name="reason"
                                                                                            className={`form-control ${errors.reason && touched.reason ? "is-invalid" : ""}`}
                                                                                        >
                                                                                            <option value="">Select a reason...</option>
                                                                                            <option value="privacy_concerns">Privacy concerns</option>
                                                                                            <option value="too_many_emails">Too many emails</option>
                                                                                            <option value="found_better_alternative">Found a better alternative</option>
                                                                                            <option value="technical_issues">Technical issues</option>
                                                                                            <option value="customer_service">Customer service issues</option>
                                                                                            <option value="other">Other</option>
                                                                                        </Field>
                                                                                        <ErrorMessage
                                                                                            name="reason"
                                                                                            component="div"
                                                                                            className="invalid-feedback"
                                                                                        />
                                                                                    </Form.Group>

                                                                                    {/* Password Confirmation */}
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label className="fw-semibold">
                                                                                            Confirm Your Password
                                                                                        </Form.Label>
                                                                                        <Field
                                                                                            name="password"
                                                                                            type="password"
                                                                                            className={`form-control ${errors.password && touched.password ? "is-invalid" : ""}`}
                                                                                            placeholder="Enter your current password"
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name="password"
                                                                                            component="div"
                                                                                            className="invalid-feedback"
                                                                                        />
                                                                                    </Form.Group>

                                                                                    {/* Confirmation Text */}
                                                                                    <Form.Group className="mb-3">
                                                                                        <Form.Label className="fw-semibold">
                                                                                            Type "DELETE MY ACCOUNT" to confirm
                                                                                        </Form.Label>
                                                                                        <Field
                                                                                            name="confirmText"
                                                                                            type="text"
                                                                                            className={`form-control ${errors.confirmText && touched.confirmText ? "is-invalid" : ""}`}
                                                                                            placeholder="DELETE MY ACCOUNT"
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name="confirmText"
                                                                                            component="div"
                                                                                            className="invalid-feedback"
                                                                                        />
                                                                                    </Form.Group>

                                                                                    {/* Acknowledge Consequences */}
                                                                                    <Form.Group className="mb-4">
                                                                                        <div className="form-check">
                                                                                            <Field
                                                                                                name="understandConsequences"
                                                                                                type="checkbox"
                                                                                                className={`form-check-input ${errors.understandConsequences && touched.understandConsequences ? "is-invalid" : ""}`}
                                                                                                id="understandConsequences"
                                                                                            />
                                                                                            <label className="form-check-label text-danger fw-semibold" htmlFor="understandConsequences">
                                                                                                I understand that this action cannot be undone and all my data will be permanently deleted
                                                                                            </label>
                                                                                            <ErrorMessage
                                                                                                name="understandConsequences"
                                                                                                component="div"
                                                                                                className="invalid-feedback"
                                                                                            />
                                                                                        </div>
                                                                                    </Form.Group>

                                                                                    {/* Submit Button */}
                                                                                    <div className="d-grid">
                                                                                        <Button
                                                                                            variant="danger"
                                                                                            size="lg"
                                                                                            type="submit"
                                                                                            disabled={isSubmitting || !values.understandConsequences}
                                                                                            className="fw-semibold"
                                                                                        >
                                                                                            {isSubmitting ? (
                                                                                                <>
                                                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                                                    Processing Deletion Request...
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <i className="bi bi-trash me-2"></i>
                                                                                                    Permanently Delete My Account
                                                                                                </>
                                                                                            )}
                                                                                        </Button>
                                                                                    </div>
                                                                                </Form>
                                                                            )}
                                                                        </Formik>
                                                                    </Card.Body>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* Sidebar with Support Information */}
                                            <div className="col-lg-4">
                                                <Card className="border-0">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-semibold mb-3">
                                                            <i className="bi bi-question-circle me-2"></i>
                                                            Need Help?
                                                        </h6>

                                                        <div className={styles.helpItem}>
                                                            <i className="bi bi-envelope text-primary me-2"></i>
                                                            <div>
                                                                <div className="fw-semibold">Email Support</div>
                                                                <small className="text-muted">support@collectly.com</small>
                                                            </div>
                                                        </div>

                                                        <div className={styles.helpItem}>
                                                            <i className="bi bi-chat-dots text-primary me-2"></i>
                                                            <div>
                                                                <div className="fw-semibold">Live Chat</div>
                                                                <small className="text-muted">Available 24/7</small>
                                                            </div>
                                                        </div>

                                                        <div className={styles.helpItem}>
                                                            <i className="bi bi-telephone text-primary me-2"></i>
                                                            <div>
                                                                <div className="fw-semibold">Phone Support</div>
                                                                <small className="text-muted">1-800-COLLECTLY</small>
                                                            </div>
                                                        </div>

                                                        <hr className="my-3" />

                                                        <div className="text-center">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    dispatch(setMessage({
                                                                        message: 'Redirecting to support center...',
                                                                        type: 'info'
                                                                    }));
                                                                    // Small delay for user to see the message
                                                                    setTimeout(() => navigate('/support'), 500);
                                                                }}
                                                            >
                                                                <i className="bi bi-headset me-2"></i>
                                                                Contact Support
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>

                                                {/* Enhanced Data Export Option */}
                                                {!profile?.accountDeletionRequest && (
                                                    <>
                                                        <Card className="border-primary mt-4">
                                                            <Card.Body className="p-4">
                                                                <div className="text-center mb-3">
                                                                    <i className="bi bi-database text-primary display-6"></i>
                                                                </div>
                                                                <h6 className="fw-semibold mb-3 text-center">
                                                                    Download Your Data
                                                                </h6>
                                                                <p className="small text-muted mb-3 text-center">
                                                                    Export all your personal data including profile information, contributions, and account activity.
                                                                </p>

                                                                <div className="d-grid gap-2">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="w-100"
                                                                        onClick={handleDownloadPersonalData}
                                                                        disabled={isDownloadingData}
                                                                    >
                                                                        {isDownloadingData ? (
                                                                            <>
                                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                                Preparing Download...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <i className="bi bi-download me-2"></i>
                                                                                Export My Data
                                                                            </>
                                                                        )}
                                                                    </Button>

                                                                    {/* Download History */}
                                                                    {downloadHistory.length > 0 && (
                                                                        <div className="mt-3">
                                                                            <h6 className="small fw-semibold mb-2">Recent Exports</h6>
                                                                            {downloadHistory.slice(0, 3).map((item, index) => (
                                                                                <div key={index} className="d-flex justify-content-between align-items-center small py-1">
                                                                                    <span className="text-muted">
                                                                                        {moment(item.timestamp).format('MMM D, HH:mm')}
                                                                                    </span>
                                                                                    <Badge bg={item.status === 'success' ? 'success' : item.status === 'error' ? 'danger' : 'warning'} className="ms-2">
                                                                                        {item.status === 'success' ? 'Downloaded' : item.status === 'error' ? 'Failed' : 'Pending'}
                                                                                    </Badge>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Card.Body>
                                                        </Card>

                                                        {/* Data Export Information Card */}
                                                        <Card className="border-info mt-3">
                                                            <Card.Body className="p-3">
                                                                <h6 className="fw-semibold mb-2">
                                                                    <i className="bi bi-info-circle me-2"></i>
                                                                    What's Included
                                                                </h6>
                                                                <ul className="small text-muted mb-0 ps-3">
                                                                    <li>Profile information</li>
                                                                    <li>Contribution history</li>
                                                                    <li>Payment records</li>
                                                                    <li>Social media links</li>
                                                                    <li>Account settings</li>
                                                                    <li>API project details</li>
                                                                </ul>
                                                            </Card.Body>
                                                        </Card>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </Tab.Content>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <SubscriptionModal
                showSubscribeModal={showSubscribeModal}
                setShowSubscribeModal={setShowSubscribeModal}
            />

            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={showAppModal}
                onHide={() => setShowAppModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Create New Project
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            name: '',
                            redirectUri: ''
                        }}
                        validationSchema={Yup.object().shape({
                            name: Yup.string().required("Project name is required"),
                            redirectUri: Yup.string().url("Redirect URI must be a valid URL").nullable()
                        })}
                        onSubmit={handleCreateAppSubmit}
                    >
                        {({ errors, touched, isSubmitting, handleSubmit }) => (
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">
                                                Name Your Project
                                            </Form.Label>
                                            <Field
                                                name="name"
                                                type="text"
                                                placeholder="Enter project name"
                                                className={`form-control ${errors.name && touched.name ? "is-invalid" : ""}`}
                                            />
                                            <ErrorMessage
                                                name="name"
                                                component="div"
                                                className="invalid-feedback"
                                            />
                                            <Form.Text className="text-muted">
                                                Choose a descriptive name for your API project
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">
                                                Redirect URI (optional)
                                            </Form.Label>
                                            <Field
                                                name="redirectUri"
                                                type="url"
                                                placeholder="https://example.com/callback"
                                                className={`form-control ${errors.redirectUri && touched.redirectUri ? "is-invalid" : ""}`}
                                            />
                                            <ErrorMessage
                                                name="redirectUri"
                                                component="div"
                                                className="invalid-feedback"
                                            />
                                            <Form.Text className="text-muted">
                                                Optional. Add an OAuth redirect/callback URL if applicable.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="d-flex gap-2 justify-content-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowAppModal(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                        className="px-4"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Project'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>

            <Modal
                show={showPhotoModal}
                onHide={handleClosePhotoModal}
                centered
                size="md"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-camera me-2"></i>
                        Update Profile Photo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        {/* Current Photo Preview */}
                        <div className="mb-4">
                            <div className={styles.photoPreviewContainer}>
                                <img
                                    src={previewUrl || profile?.photoUrl || 'https://app.collectly.com/public/img/user.png'}
                                    alt="Profile preview"
                                    className={styles.photoPreview}
                                    onError={(e) => { e.target.src = 'https://app.collectly.com/public/img/user.png'; }}
                                />
                            </div>
                            <small className="text-muted">
                                {previewUrl ? 'New photo preview' : 'Current profile photo'}
                            </small>
                        </div>

                        {/* File Upload */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                Choose a new photo
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/jpeg, image/jpg, image/png, image/gif"
                                onChange={handleFileSelect}
                                className="mb-2"
                            />
                            <Form.Text className="text-muted">
                                Supported formats: JPEG, PNG, GIF. Max size: 5MB
                            </Form.Text>
                        </Form.Group>

                        {/* Action Buttons */}
                        <div className="d-grid gap-2">
                            <Button
                                variant="primary"
                                onClick={handlePhotoUpload}
                                disabled={!selectedFile || isUploading}
                                size="lg"
                            >
                                {isUploading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-upload me-2"></i>
                                        Upload Photo
                                    </>
                                )}
                            </Button>

                            {profile?.photoUrl && !previewUrl && (
                                <Button
                                    variant="outline-danger"
                                    onClick={handleRemovePhoto}
                                    disabled={isUploading}
                                >
                                    <i className="bi bi-trash me-2"></i>
                                    Remove Current Photo
                                </Button>
                            )}

                            <Button
                                variant="outline-secondary"
                                onClick={handleClosePhotoModal}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Account;