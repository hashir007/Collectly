import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from 'react-bootstrap';
import { createForgotPassword } from "../../slices/auth";

import styles from "./forgotPassword.module.css";
import Footer from "../../components/footer/footer";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    let navigate = useNavigate();

    const [alert, setAlert] = useState({
        type: '',
        message: ''
    });

    const [isSuccess, setIsSuccess] = useState(false);

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

    const handleForgotPassword = (values, { setSubmitting, resetForm }) => {
        const { email } = values;
        const callbackUrl = `${window.location.origin}/reset-password`;
        dispatch(createForgotPassword({ email: email, callbackUrl: callbackUrl }))
            .unwrap()
            .then((response) => {
                setAlert({
                    type: 'success',
                    message: 'If the email exists, a password reset link has been sent. Please check your inbox.'
                });
                setIsSuccess(true);
                resetForm();
            })
            .catch((error) => {
                setAlert({
                    type: 'error',
                    message: error || "Failed to send reset email. Please try again."
                });
                setIsSuccess(false);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    // Clear alert when component unmounts or when user starts typing again
    useEffect(() => {
        if (alert.message) {
            const timer = setTimeout(() => {
                setAlert({ type: '', message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert.message]);

    return (
        <main className={styles.main}>
            <section className={styles.loginArea}>
                <div className={styles.container}>
                    <div className={styles.loginCard}>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Forgot Password</h2>
                            <p className={styles.subtitle}>
                                {isSuccess
                                    ? "Check your email for reset instructions"
                                    : "Don't worry, we can help you reset it"
                                }
                            </p>
                        </div>

                        {alert.message && (
                            <Alert
                                type={alert.type}
                                message={alert.message}
                                onClose={() => setAlert({ type: '', message: '' })}
                            />
                        )}

                        {!isSuccess ? (
                            <Formik
                                initialValues={{
                                    email: ""
                                }}
                                validationSchema={Yup.object().shape({
                                    email: Yup.string()
                                        .email("Please enter a valid email address")
                                        .required("Email is required")
                                })}
                                onSubmit={handleForgotPassword}
                            >
                                {({ errors, touched, isSubmitting, handleSubmit, isValid, dirty }) => (
                                    <Form onSubmit={handleSubmit} className={styles.form}>
                                        <div className={styles.formContent}>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="email" className={styles.label}>Email</label>
                                                <Field
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    placeholder="Enter your email address"
                                                    className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
                                                />
                                                <ErrorMessage
                                                    name="email"
                                                    component="div"
                                                    className={styles.errorMessage}
                                                />
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
                                                            Sending Reset Link...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-envelope me-2"></i>
                                                            Send Reset Link
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className={styles.footerLink}>
                                                <Link to={"/login"} className={styles.link}>
                                                    <i className="bi bi-arrow-left me-2"></i>
                                                    Back to Login
                                                </Link>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        ) : (
                            <div className={styles.successState}>
                                <div className={styles.successIcon}>
                                    <i className="bi bi-envelope-check"></i>
                                </div>
                                <p className={styles.successMessage}>
                                    If an account exists with this email, you will receive password reset instructions shortly.
                                </p>
                                <div className={styles.successActions}>
                                    <Link to={"/login"} className={styles.button}>
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back to Login
                                    </Link>
                                    <button
                                        className={styles.buttonSecondary}
                                        onClick={() => setIsSuccess(false)}
                                    >
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Try Another Email
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}

export default ForgotPassword;