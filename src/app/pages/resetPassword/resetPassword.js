import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from 'react-bootstrap';
import { resetPassword } from "../../slices/auth";

import styles from "./resetPassword.module.css";
import Footer from "../../components/footer/footer";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [alert, setAlert] = useState({
        type: '',
        message: ''
    });
    const [token, setToken] = useState("");
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const Alert = ({ type, message, onClose }) => {
        let alertClass = '';
        let icon = '';

        switch (type) {
            case 'success':
                alertClass = 'alert-success';
                icon = 'fa-check-circle';
                break;
            case 'error':
                alertClass = 'alert-danger';
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                alertClass = 'alert-warning';
                icon = 'fa-exclamation-triangle';
                break;
            case 'info':
                alertClass = 'alert-info';
                icon = 'fa-info-circle';
                break;
            default:
                alertClass = 'alert-info';
                icon = 'fa-info-circle';
        }

        return (
            <div className={`alert ${alertClass}`}>
                <i className={`fas ${icon} alert-icon`}></i>
                <div className="alert-content">
                    <div className="alert-title">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    <div className="alert-message">{message}</div>
                </div>
                {onClose && (
                    <button className="alert-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>
        );
    };

    // Check token on component mount
    useEffect(() => {
        const resetToken = searchParams.get("token");

        if (!resetToken) {
            setAlert({
                type: 'error',
                message: 'Invalid or missing reset token. Please request a new password reset.'
            });
            setIsTokenValid(false);
            setIsLoading(false);
            return;
        }

        setToken(resetToken);
        validateToken(resetToken);
    }, [searchParams]);

    const validateToken = async (resetToken) => {
        try {
            // You might want to add an API call to validate the token
            // For now, we'll assume it's valid if it exists
            setIsTokenValid(true);
            setIsLoading(false);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
            setIsTokenValid(false);
            setIsLoading(false);
        }
    };

    const handleResetPassword = (values, { setSubmitting, resetForm }) => {
        const { password, confirmPassword } = values;

        dispatch(resetPassword({
            token: token,
            password: password
        }))
            .unwrap()
            .then(() => {
                setAlert({
                    type: 'success',
                    message: 'Your password has been reset successfully! You can now login with your new password.'
                });
                resetForm();

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            })
            .catch((error) => {
                setAlert({
                    type: 'error',
                    message: error || "Failed to reset password. Please try again."
                });
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const passwordValidationSchema = Yup.object().shape({
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .matches(/[a-z]/, "Password must contain at least one lowercase letter")
            .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
            .matches(/[0-9]/, "Password must contain at least one number")
            .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], "Passwords must match")
            .required("Please confirm your password")
    });

    if (isLoading) {
        return (
            <main className={styles.main}>
                <section className={styles.loginArea}>
                    <div className={styles.container}>
                        <div className={styles.loginCard}>
                            <div className={styles.loadingState}>
                                <Spinner animation="border" variant="primary" />
                                <p>Validating reset token...</p>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
        );
    }

    if (!isTokenValid) {
        return (
            <main className={styles.main}>
                <section className={styles.loginArea}>
                    <div className={styles.container}>
                        <div className={styles.loginCard}>
                            <div className={styles.header}>
                                <h2 className={styles.title}>Invalid Reset Link</h2>
                                <p className={styles.subtitle}>This password reset link is invalid or has expired</p>
                            </div>

                            {alert.message && (
                                <Alert
                                    type={alert.type}
                                    message={alert.message}
                                    onClose={() => setAlert({})}
                                />
                            )}

                            <div className={styles.invalidTokenActions}>
                                <Link to="/forgot-password" className={styles.button}>
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Request New Reset Link
                                </Link>
                                <Link to="/login" className={styles.buttonSecondary}>
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <section className={styles.loginArea}>
                <div className={styles.container}>
                    <div className={styles.loginCard}>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Reset Your Password</h2>
                            <p className={styles.subtitle}>Create a new password for your account</p>
                        </div>

                        {alert.message && (
                            <Alert
                                type={alert.type}
                                message={alert.message}
                                onClose={() => setAlert({})}
                            />
                        )}

                        <Formik
                            initialValues={{
                                password: "",
                                confirmPassword: ""
                            }}
                            validationSchema={passwordValidationSchema}
                            onSubmit={handleResetPassword}
                        >
                            {({ errors, touched, isSubmitting, handleSubmit, isValid, dirty }) => (
                                <Form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formContent}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="password" className={styles.label}>New Password</label>
                                            <Field
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Enter your new password"
                                                className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                                            />
                                            <ErrorMessage
                                                name="password"
                                                component="div"
                                                className={styles.errorMessage}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                                            <Field
                                                name="confirmPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Confirm your new password"
                                                className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`}
                                            />
                                            <ErrorMessage
                                                name="confirmPassword"
                                                component="div"
                                                className={styles.errorMessage}
                                            />
                                        </div>

                                        <div className={styles.passwordRequirements}>
                                            <h4>Password Requirements:</h4>
                                            <ul>
                                                <li>At least 8 characters long</li>
                                                <li>One uppercase letter</li>
                                                <li>One lowercase letter</li>
                                                <li>One number</li>
                                                <li>One special character</li>
                                            </ul>
                                        </div>

                                        <div className={styles.buttonWrapper}>
                                            <button
                                                type="submit"
                                                className={styles.button}
                                                disabled={isSubmitting || !isValid || !dirty}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Resetting Password...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-shield-lock me-2"></i>
                                                        Reset Password
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className={styles.footerLink}>
                                            <Link to="/login" className={styles.link}>
                                                <i className="bi bi-arrow-left me-2"></i>
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}

export default ResetPassword;