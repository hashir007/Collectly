import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from 'react-bootstrap';
import { register } from "../../slices/auth";
import { clearMessage } from "../../slices/message";
import styles from "./Register.module.css";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import Footer from '../../components/footer/footer';


const Register = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useSelector((state) => state.auth);



  const [alert, setAlert] = useState({
    type: '',
    message: ''
  });

  const referral = searchParams.get('referral');

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);


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
        )
        }
      </div >
    );
  };

  const handleRegister = (values, { setSubmitting, resetForm, setErrors }) => {
    const { username, email, password, firstname, lastname, date_of_birth, phone, terms_conditions, sms_consent } = values;

    // Additional client-side validation
    if (!terms_conditions) {
      setErrors({ terms_conditions: "You must accept the terms and conditions" });
      setSubmitting(false);
      return;
    }

    dispatch(register({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      firstName: firstname.trim(),
      lastName: lastname.trim(),
      date_of_birth: date_of_birth,
      phone: phone,
      sms_consent: sms_consent,
      referral: referral ? referral.trim() : null
    }))
      .unwrap()
      .then((response) => {
        // Show success message
        setAlert({
          type: 'success',
          message: 'Registration successful! Please check your email to verify your account.'
        });

        // Clear referral from URL if present
        if (referral) {
          searchParams.delete('referral');
          setSearchParams(searchParams);
        }

        // Reset form
        resetForm();

        // Optional: Redirect to login or welcome page
        // navigate('/login', { replace: true });

      })
      .catch((error) => {
        console.error('Registration error:', error);

        // Extract error message from various possible response structures
        let message = "Registration failed. Please try again.";

        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        }

        // Handle specific error types and set field errors
        if (error.response?.data?.errors) {
          // Backend returns field-specific errors
          const fieldErrors = {};
          Object.keys(error.response.data.errors).forEach(field => {
            fieldErrors[field] = error.response.data.errors[field][0];
          });
          setErrors(fieldErrors);
        } else if (error.response?.status === 400) {
          // Bad request - likely validation errors
          if (error.response.data?.email) {
            setErrors({ email: "Email is already taken" });
          } else if (error.response.data?.username) {
            setErrors({ username: "Username is already taken" });
          } else if (error.response.data?.phone) {
            setErrors({ phone: "Phone number is already registered" });
          }
        } else if (error.response?.status === 409) {
          // Conflict - duplicate entry
          if (message.toLowerCase().includes('email')) {
            setErrors({ email: "This email is already registered" });
          } else if (message.toLowerCase().includes('username')) {
            setErrors({ username: "This username is already taken" });
          } else if (message.toLowerCase().includes('phone')) {
            setErrors({ phone: "This phone number is already registered" });
          }
        }

        // Show alert with error message
        setAlert({
          type: 'error',
          message: message,
          duration: 5000 // Optional: auto-dismiss after 5 seconds
        });

      })
      .finally(() => {
        setSubmitting(false);
      });
  };


  if (isLoggedIn) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <main className={styles.main}>
      <section className={styles.registerArea}>
        <div className={styles.container}>
          <div className={styles.registerCard}>
            <div className={styles.header}>
              <h2 className={styles.title}>Create An Account</h2>
              <p className={styles.subtitle}>Sign up for Collectly and Simplify Group Contributions with Ease</p>
            </div>

            {
              alert.message && (
                <Alert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert({})}
                />
              )
            }

            <Formik
              initialValues={{
                username: "",
                email: "",
                password: "",
                firstname: "",
                lastname: "",
                date_of_birth: "",
                phone: "",
                terms_conditions: false,
                sms_consent: false
              }}
              validationSchema={Yup.object().shape({
                firstname: Yup.string()
                  .min(3, "First name must be at least 3 characters")
                  .max(20, "First name must be less than 20 characters")
                  .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces")
                  .required("First name is required"),
                lastname: Yup.string()
                  .min(3, "Last name must be at least 3 characters")
                  .max(20, "Last name must be less than 20 characters")
                  .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces")
                  .required("Last name is required"),
                username: Yup.string()
                  .min(3, "Username must be at least 3 characters")
                  .max(20, "Username must be less than 20 characters")
                  .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
                  .required("Username is required"),
                email: Yup.string()
                  .email("Please enter a valid email address")
                  .required("Email is required"),
                password: Yup.string()
                  .min(8, "Password must be at least 8 characters")
                  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
                  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
                  .matches(/[0-9]/, "Password must contain at least one number")
                  .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
                  .required("Password is required"),
                date_of_birth: Yup.date()
                  .max(new Date(Date.now() - (18 * 365 * 24 * 60 * 60 * 1000)), "You must be at least 18 years old")
                  .min(new Date('1900-01-01'), "Please enter a valid date")
                  .required("Date of birth is required")
                  .typeError("Please enter a valid date"),
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
                terms_conditions: Yup.boolean()
                  .oneOf([true], "You must accept the terms and conditions")
                  .required("You must accept the terms and conditions")
              })}
              onSubmit={handleRegister}
            >
              {({ errors, touched, isSubmitting, handleSubmit, isValid, dirty, setFieldValue, values }) => (
                <Form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formContent}>
                    {/* Two-column layout wrapper */}
                    <div className={styles.twoColumnLayout}>
                      {/* Left column */}
                      <div className={styles.column}>
                        <div className={styles.formGroup}>
                          <label htmlFor="firstname" className={styles.label}>
                            First name *
                          </label>
                          <Field
                            name="firstname"
                            type="text"
                            placeholder="Enter your first name"
                            className={`${styles.input} ${errors.firstname && touched.firstname ? styles.inputError : ''}`}
                          />
                          <ErrorMessage
                            name="firstname"
                            component="div"
                            className={styles.errorMessage}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="lastname" className={styles.label}>
                            Last name *
                          </label>
                          <Field
                            name="lastname"
                            type="text"
                            placeholder="Enter your last name"
                            className={`${styles.input} ${errors.lastname && touched.lastname ? styles.inputError : ''}`}
                          />
                          <ErrorMessage
                            name="lastname"
                            component="div"
                            className={styles.errorMessage}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="username" className={styles.label}>
                            Username *
                          </label>
                          <Field
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            className={`${styles.input} ${errors.username && touched.username ? styles.inputError : ''}`}
                          />
                          <ErrorMessage
                            name="username"
                            component="div"
                            className={styles.errorMessage}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="date_of_birth" className={styles.label}>
                            Date of Birth *
                          </label>
                          <Field
                            name="date_of_birth"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className={`${styles.input} ${errors.date_of_birth && touched.date_of_birth ? styles.inputError : ''}`}
                          />
                          <ErrorMessage
                            name="date_of_birth"
                            component="div"
                            className={styles.errorMessage}
                          />
                        </div>
                      </div>

                      {/* Right column */}
                      <div className={styles.column}>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone" className={styles.label}>
                            Phone Number *
                          </label>
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
                            className={styles.errorMessage}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="email" className={styles.label}>
                            Email *
                          </label>
                          <Field
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className={styles.errorMessage}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="password" className={styles.label}>
                            Password *
                          </label>
                          <Field
                            name="password"
                            type="password"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                          />
                          <ErrorMessage
                            name="password"
                            component="div"
                            className={styles.errorMessage}
                          />
                          <div className={styles.passwordRequirements}>
                            <p className={styles.requirementsTitle}>Password must contain:</p>
                            <ul className={styles.requirementsList}>
                              <li className={values.password.length >= 8 ? styles.requirementMet : styles.requirementNotMet}>
                                At least 8 characters
                              </li>
                              <li className={/[a-z]/.test(values.password) ? styles.requirementMet : styles.requirementNotMet}>
                                One lowercase letter
                              </li>
                              <li className={/[A-Z]/.test(values.password) ? styles.requirementMet : styles.requirementNotMet}>
                                One uppercase letter
                              </li>
                              <li className={/[0-9]/.test(values.password) ? styles.requirementMet : styles.requirementNotMet}>
                                One number
                              </li>
                              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(values.password) ? styles.requirementMet : styles.requirementNotMet}>
                                One special character
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Full-width checkboxes */}
                    <div className={styles.fullWidthSection}>
                      <div className={styles.checkboxGroup}>
                        <label className={`${styles.checkboxLabel} ${errors.terms_conditions && touched.terms_conditions ? styles.checkboxError : ''}`}>
                          <Field
                            name="terms_conditions"
                            type="checkbox"
                            className={styles.checkbox}
                          />
                          <span>
                            I agree to the <a href="/terms" target="_blank" className={styles.link}>terms and conditions</a> *
                          </span>
                        </label>
                        <ErrorMessage
                          name="terms_conditions"
                          component="div"
                          className={styles.errorMessage}
                        />
                      </div>

                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                          <Field
                            name="sms_consent"
                            type="checkbox"
                            className={styles.checkbox}
                          />
                          <span>I agree to receive SMS notifications</span>
                        </label>
                        <p className={styles.smsNote}>
                          By agreeing, you are giving consent to receive SMS messages at
                          the provided phone number. You can turn off SMS notifications
                          from profile settings.
                        </p>
                      </div>
                    </div>

                    <div className={styles.buttonWrapper}>
                      <button
                        type="submit"
                        className={`${styles.button} ${(isSubmitting || !isValid) ? styles.buttonDisabled : ''}`}
                        disabled={isSubmitting || !isValid}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className={styles.spinner} />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <i className={`bi bi-person-plus ${styles.icon}`}></i>
                            Create Account
                          </>
                        )}
                      </button>
                    </div>

                    <div className={styles.requiredNote}>
                      <span className={styles.requiredStar}>*</span> Indicates required fields
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

export default Register;