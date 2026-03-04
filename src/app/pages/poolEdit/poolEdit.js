import classNames from "./poolEdit.module.css";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { Hourglass } from 'react-loader-spinner';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import {
    getPool,
    updatePool,
    uploadPoolImage
} from "../../slices/pool";

const PoolEdit = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const { user: currentUser } = useSelector((state) => state.auth);
    const { poolSelected } = useSelector((state) => state.pool);
    const [poolLoading, setPoolLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [file, setFile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoId, setPhotoId] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageUploadStatus, setImageUploadStatus] = useState(null);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [enableVoting, setEnableVoting] = useState(false);
    const PoolID = urlParams.get("id");

    useEffect(() => {
        if (PoolID) {
            setPoolLoading(true);
            dispatch(getPool({ poolID: PoolID }))
                .finally(() => {
                    setPoolLoading(false);
                });
        }
    }, [PoolID, dispatch]);

    // Initialize photoId, photoUrl, and voting settings when poolSelected is available
    useEffect(() => {
        if (poolSelected) {
            setPhotoId(poolSelected.photo_id || null);
            setPhotoUrl(poolSelected.photo || "");
            // Initialize voting settings
            if (poolSelected.voting_settings) {
                setEnableVoting(poolSelected.voting_settings.voting_enabled || false);
            }
        }
    }, [poolSelected]);

    const handleSubmit = useCallback((values, { setSubmitting }) => {
        setSaveStatus("saving");

        const {
            name,
            description,
            defaultBuy_in_amount,
            goal_amount,
            is_private,
            // Voting settings
            voting_enabled,
            voting_threshold,
            voting_duration,
            min_voters,
            voting_type,
            auto_approve,
            allow_abstain,
            require_quorum,
            quorum_percentage
        } = values;

        const updatedPool = {
            name,
            description,
            defaultBuy_in_amount: parseFloat(defaultBuy_in_amount),
            goal_amount: parseFloat(goal_amount),
            photo_id: photoId,
            modifiedBy: currentUser.user.id,
            is_private: is_private,
            // Voting settings
            voting_enabled: voting_enabled || false,
            voting_threshold: parseFloat(voting_threshold) || 51.00,
            voting_duration: parseInt(voting_duration, 10) || 72,
            min_voters: parseInt(min_voters, 10) || 1,
            voting_type: voting_type || 'one_member_one_vote',
            auto_approve: auto_approve || false,
            allow_abstain: allow_abstain !== undefined ? allow_abstain : true,
            require_quorum: require_quorum || false,
            quorum_percentage: parseFloat(quorum_percentage) || 50.00
        };

        dispatch(updatePool({ poolID: PoolID, poolData: updatedPool }))
            .unwrap()
            .then(() => {
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 3000);
            })
            .catch((error) => {
                setSaveStatus("error");
                console.error("Error updating pool:", error);
            })
            .finally(() => {
                setSubmitting(false);
            });
    }, [PoolID, dispatch, photoId, currentUser]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file type and size
            if (!selectedFile.type.startsWith('image/')) {
                setImageUploadStatus("error");
                alert("Please select an image file");
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setImageUploadStatus("error");
                alert("Image size must be less than 5MB");
                return;
            }

            setFile(selectedFile);

            // Create a preview URL
            const objectUrl = URL.createObjectURL(selectedFile);
            setPhotoUrl(objectUrl);

            // Upload the image immediately after selection
            handleImageUpload(selectedFile);
        }
    };

    const handleImageUpload = (fileToUpload) => {
        if (!fileToUpload || !PoolID) return;

        setImageUploading(true);
        setImageUploadStatus("uploading");

        dispatch(uploadPoolImage({ poolID: PoolID, file: fileToUpload }))
            .unwrap()
            .then((response) => {
                setImageUploadStatus("success");
                setPhotoId(response.File?.id);
                setPhotoUrl(response.File?.url);
                setTimeout(() => setImageUploadStatus(null), 3000);
            })
            .catch((error) => {
                setImageUploadStatus("error");
                console.error("Error uploading image:", error);
                setTimeout(() => setImageUploadStatus(null), 3000);
            })
            .finally(() => {
                setImageUploading(false);
            });
    };

    const triggerFileInput = () => {
        document.getElementById('pool-cover-image').click();
    };

    if (!currentUser) {
        const formatReturnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        return <Navigate to={`/login?returnUrl=${formatReturnUrl}`} />;
    }

    if (!PoolID) {
        return <Navigate to={`*`} />;
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(3, 'Pool name must be at least 3 characters')
            .max(50, 'Pool name must be less than 50 characters')
            .required('Pool name is required'),
        description: Yup.string()
            .max(500, 'Description must be less than 500 characters'),
        goal_amount: Yup.number()
            .min(10, 'Goal amount must be at least $10')
            .required('Goal amount is required'),
        defaultBuy_in_amount: Yup.number()
            .min(1, 'Default buy-in must be at least $1')
            .required('Default buy-in amount is required'),
        voting_threshold: Yup.number()
            .min(1, 'Voting threshold must be at least 1%')
            .max(100, 'Voting threshold cannot exceed 100%'),
        voting_duration: Yup.number()
            .min(1, 'Voting duration must be at least 1 hour')
            .max(720, 'Voting duration cannot exceed 720 hours (30 days)'),
        min_voters: Yup.number()
            .min(1, 'Minimum voters must be at least 1'),
        quorum_percentage: Yup.number()
            .min(1, 'Quorum percentage must be at least 1%')
            .max(100, 'Quorum percentage cannot exceed 100%'),
    });

    return (
        <>
            {poolLoading ? (
                <div className="d-flex justify-content-center align-items-center min-vh-50 my-5">
                    <Hourglass
                        visible={true}
                        height="80"
                        width="80"
                        colors={['#FFD59B', '#FFC371']}
                    />
                </div>
            ) : (
                <main className="container-xl my-4 my-md-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button
                            className="btn btn-outline-secondary rounded-xl"
                            onClick={() => window.history.back()}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Back
                        </button>
                    </div>

                    <div className="row">
                        <div className="col-lg-8">
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <h1 className="text-3xl fw-extrabold tracking-tight">Edit Pool</h1>
                                <br></br>
                                <Formik
                                    initialValues={{
                                        name: poolSelected?.name || "",
                                        description: poolSelected?.description || "",
                                        goal_amount: poolSelected?.goal_amount || 0,
                                        defaultBuy_in_amount: poolSelected?.defaultBuy_in_amount || 0,
                                        status: poolSelected?.status || 0,
                                        is_private: poolSelected?.is_private || false,
                                        // Voting settings
                                        voting_enabled: poolSelected?.voting_settings?.voting_enabled || false,
                                        voting_threshold: poolSelected?.voting_settings?.voting_threshold || 51.00,
                                        voting_duration: poolSelected?.voting_settings?.voting_duration || 72,
                                        min_voters: poolSelected?.voting_settings?.min_voters || 1,
                                        voting_type: poolSelected?.voting_settings?.voting_type || 'one_member_one_vote',
                                        auto_approve: poolSelected?.voting_settings?.auto_approve || false,
                                        allow_abstain: poolSelected?.voting_settings?.allow_abstain !== undefined ? poolSelected.voting_settings.allow_abstain : true,
                                        require_quorum: poolSelected?.voting_settings?.require_quorum || false,
                                        quorum_percentage: poolSelected?.voting_settings?.quorum_percentage || 50.00,
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize
                                >
                                    {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                                        <Form>
                                            <div className="mb-4">
                                                <label htmlFor="name" className="form-label fw-semibold">Pool Name</label>
                                                <Field
                                                    name="name"
                                                    type="text"
                                                    className={`form-control rounded-xl ${errors.name && touched.name ? 'is-invalid' : ''}`}
                                                    placeholder="Enter pool name"
                                                />
                                                <ErrorMessage
                                                    name="name"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="description" className="form-label fw-semibold">Description</label>
                                                <Field
                                                    name="description"
                                                    as="textarea"
                                                    rows="4"
                                                    className={`form-control rounded-xl ${errors.description && touched.description ? 'is-invalid' : ''}`}
                                                    placeholder="Describe your pool"
                                                />
                                                <ErrorMessage
                                                    name="description"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>

                                            <div className="row mb-4">
                                                <div className="col-md-6">
                                                    <label htmlFor="goal_amount" className="form-label fw-semibold">Goal Amount ($)</label>
                                                    <Field
                                                        name="goal_amount"
                                                        type="number"
                                                        step={0.01}
                                                        min="1"
                                                        className={`form-control rounded-xl ${errors.goal_amount && touched.goal_amount ? 'is-invalid' : ''}`}
                                                    />
                                                    <ErrorMessage
                                                        name="goal_amount"
                                                        component="div"
                                                        className="invalid-feedback"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="defaultBuy_in_amount" className="form-label fw-semibold">Default Buy-in Amount ($)</label>
                                                    <Field
                                                        name="defaultBuy_in_amount"
                                                        type="number"
                                                        step={0.01}
                                                        min="1"
                                                        className={`form-control rounded-xl ${errors.defaultBuy_in_amount && touched.defaultBuy_in_amount ? 'is-invalid' : ''}`}
                                                    />
                                                    <ErrorMessage
                                                        name="defaultBuy_in_amount"
                                                        component="div"
                                                        className="invalid-feedback"
                                                    />
                                                </div>
                                            </div>

                                            <hr />

                                            {/* Voting Settings Section */}
                                            <div className="mb-4">
                                                <div className="form-check form-switch mb-3">
                                                    <Field
                                                        name="voting_enabled"
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="voting_enabled"
                                                        onChange={(e) => {
                                                            setEnableVoting(e.target.checked);
                                                            setFieldValue('voting_enabled', e.target.checked);
                                                        }}
                                                    />
                                                    <label className="form-check-label fw-semibold" htmlFor="voting_enabled">
                                                        Enable Voting System
                                                    </label>
                                                </div>
                                                <small className="text-muted">
                                                    Allow members to vote on important pool decisions like payouts
                                                </small>
                                            </div>

                                            {enableVoting && (
                                                <div className="voting-settings border rounded-xl p-4 bg-light mb-4">
                                                    <h5 className="fw-semibold mb-3">Voting Settings</h5>

                                                    <div className="row mb-3">
                                                        <div className="col-md-6">
                                                            <label htmlFor="voting_threshold" className="form-label fw-semibold">
                                                                Approval Threshold (%)
                                                            </label>
                                                            <Field
                                                                name="voting_threshold"
                                                                type="number"
                                                                step={0.01}
                                                                min="1"
                                                                max="100"
                                                                className={`form-control rounded-xl ${errors.voting_threshold && touched.voting_threshold ? 'is-invalid' : ''}`}
                                                            />
                                                            <ErrorMessage
                                                                name="voting_threshold"
                                                                component="div"
                                                                className="invalid-feedback"
                                                            />
                                                            <small className="text-muted">Minimum percentage of votes required for approval</small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label htmlFor="voting_duration" className="form-label fw-semibold">
                                                                Voting Duration (hours)
                                                            </label>
                                                            <Field
                                                                name="voting_duration"
                                                                type="number"
                                                                min="1"
                                                                max="720"
                                                                className={`form-control rounded-xl ${errors.voting_duration && touched.voting_duration ? 'is-invalid' : ''}`}
                                                            />
                                                            <ErrorMessage
                                                                name="voting_duration"
                                                                component="div"
                                                                className="invalid-feedback"
                                                            />
                                                            <small className="text-muted">How long voting remains open</small>
                                                        </div>
                                                    </div>

                                                    <div className="row mb-3">
                                                        <div className="col-md-6">
                                                            <label htmlFor="min_voters" className="form-label fw-semibold">
                                                                Minimum Voters
                                                            </label>
                                                            <Field
                                                                name="min_voters"
                                                                type="number"
                                                                min="1"
                                                                className={`form-control rounded-xl ${errors.min_voters && touched.min_voters ? 'is-invalid' : ''}`}
                                                            />
                                                            <ErrorMessage
                                                                name="min_voters"
                                                                component="div"
                                                                className="invalid-feedback"
                                                            />
                                                            <small className="text-muted">Minimum number of voters required</small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label htmlFor="voting_type" className="form-label fw-semibold">
                                                                Voting Type
                                                            </label>
                                                            <Field
                                                                name="voting_type"
                                                                as="select"
                                                                className={`form-control rounded-xl ${errors.voting_type && touched.voting_type ? 'is-invalid' : ''}`}
                                                            >
                                                                <option value="one_member_one_vote">One Member, One Vote</option>
                                                                <option value="one_share_one_vote">One Share, One Vote</option>
                                                                <option value="weighted_by_contribution">Weighted by Contribution</option>
                                                            </Field>
                                                            <ErrorMessage
                                                                name="voting_type"
                                                                component="div"
                                                                className="invalid-feedback"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="row mb-3">
                                                        <div className="col-md-6">
                                                            <div className="form-check">
                                                                <Field
                                                                    name="auto_approve"
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id="auto_approve"
                                                                />
                                                                <label className="form-check-label fw-semibold" htmlFor="auto_approve">
                                                                    Auto-approve if threshold met
                                                                </label>
                                                            </div>
                                                            <small className="text-muted">Automatically approve when voting threshold is reached</small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-check">
                                                                <Field
                                                                    name="allow_abstain"
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id="allow_abstain"
                                                                />
                                                                <label className="form-check-label fw-semibold" htmlFor="allow_abstain">
                                                                    Allow Abstain Votes
                                                                </label>
                                                            </div>
                                                            <small className="text-muted">Members can choose to abstain from voting</small>
                                                        </div>
                                                    </div>

                                                    <div className="row mb-3">
                                                        <div className="col-md-6">
                                                            <div className="form-check">
                                                                <Field
                                                                    name="require_quorum"
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id="require_quorum"
                                                                />
                                                                <label className="form-check-label fw-semibold" htmlFor="require_quorum">
                                                                    Require Quorum
                                                                </label>
                                                            </div>
                                                            <small className="text-muted">Require minimum participation for vote to be valid</small>
                                                        </div>
                                                        {values.require_quorum && (
                                                            <div className="col-md-6">
                                                                <label htmlFor="quorum_percentage" className="form-label fw-semibold">
                                                                    Quorum Percentage (%)
                                                                </label>
                                                                <Field
                                                                    name="quorum_percentage"
                                                                    type="number"
                                                                    step={0.01}
                                                                    min="1"
                                                                    max="100"
                                                                    className={`form-control rounded-xl ${errors.quorum_percentage && touched.quorum_percentage ? 'is-invalid' : ''}`}
                                                                />
                                                                <ErrorMessage
                                                                    name="quorum_percentage"
                                                                    component="div"
                                                                    className="invalid-feedback"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}



                                            <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                                                <div>
                                                    {saveStatus === "success" && (
                                                        <div className="text-success fw-semibold">
                                                            <i className="bi bi-check-circle-fill me-1"></i> Changes saved successfully
                                                        </div>
                                                    )}
                                                    {saveStatus === "error" && (
                                                        <div className="text-danger fw-semibold">
                                                            <i className="bi bi-exclamation-circle-fill me-1"></i> Error saving changes
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary rounded-xl px-4"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-check-lg me-1"></i> Save Changes
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-image text-primary"></i> Pool Image
                                </h5>
                                <div className="text-center mb-3">
                                    <img
                                        src={photoUrl || "https://via.placeholder.com/300x150?text=Pool+Image"}
                                        alt="Pool"
                                        className="rounded-xl w-100"
                                        style={{ height: "150px", objectFit: "cover" }}
                                    />
                                    <input
                                        style={{ display: 'none' }}
                                        type="file"
                                        id="pool-cover-image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {imageUploadStatus === "success" && (
                                    <div className="alert alert-success py-2 mb-3" role="alert">
                                        <i className="bi bi-check-circle-fill me-1"></i> Image uploaded successfully
                                    </div>
                                )}
                                {imageUploadStatus === "error" && (
                                    <div className="alert alert-danger py-2 mb-3" role="alert">
                                        <i className="bi bi-exclamation-circle-fill me-1"></i> Error uploading image
                                    </div>
                                )}
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-secondary rounded-xl"
                                        onClick={triggerFileInput}
                                        disabled={imageUploading}
                                    >
                                        {imageUploading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-upload me-1"></i> Upload New Image
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="text-muted small mt-2">
                                    Recommended: Square image, 500x500px or larger. Max 5MB.
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </>
    );
};

export default PoolEdit;