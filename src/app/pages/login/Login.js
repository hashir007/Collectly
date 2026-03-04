import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from 'react-bootstrap';
import { login } from "../..//slices/auth";

import styles from "./Login.module.css";
import Footer from '../..//components/footer/footer';

const Login = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  let navigate = useNavigate();

  const [alert, setAlert] = useState({
    type: '',
    message: ''
  });

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


  const handleLogin = (values, { setSubmitting, resetForm }) => {
    const { username, password } = values;

    dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        const returnUrl = new URLSearchParams(location.search).get("returnUrl");
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else {
          navigate("/dashboard");
        }
        resetForm();
      })
      .catch((error) => {
        setAlert({
          type: 'error',
          message: error || "Login failed! Please try again."
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };



  return (
    <main className={styles.main}>
      <section className={styles.loginArea}>
        <div className={styles.container}>
          <div className={styles.loginCard}>
            <div className={styles.header}>
              <h2 className={styles.title}>Welcome Back!</h2>
              <p className={styles.subtitle}>Login to your account and continue your financial collaboration journey</p>
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
                password: "",
              }}
              validationSchema={Yup.object().shape({
                username: Yup.string().required("This field is required!"),
                password: Yup.string().required("This field is required!"),
              })}
              onSubmit={handleLogin}>
              {({ errors, touched, isSubmitting, handleSubmit }) => (
                <Form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formContent}>

                    <div className={styles.formGroup}>
                      <label htmlFor="username" className={styles.label}>Username</label>
                      <Field
                        name="username"
                        type="text"
                        autoComplete="username"
                        className={`${styles.input} ${errors.username && touched.username ? styles.inputError : ''}`}
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className={styles.errorMessage}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="password" className={styles.label}>Password</label>
                      <Field
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className={styles.errorMessage}
                      />
                    </div>

                    <div className={styles.buttonWrapper}>
                      <button
                        type="submit"
                        className={styles.button}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Logging in...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In
                          </>
                        )}
                      </button>
                    </div>

                    <div className={styles.footerLink}>
                      <Link to={"/forgot-password"} className={styles.link}>
                        Lost password?
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

export default Login;