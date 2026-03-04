import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Spinner } from 'react-bootstrap';
import { verifyEmail } from "../../slices/auth";

import "./emailVerification.module.css";
import Footer from "../../components/footer/footer";

const EmailVerification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please request a new verification email.');
        return;
      }

      try {
        const result = await dispatch(verifyEmail({ token })).unwrap();

        if (result.alreadyVerified) {
          setVerificationStatus('already_verified');
          setMessage('Your email was already verified. You can proceed to login.');
        } else {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified! Redirecting you to login...');

          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login', { state: { emailVerified: true } });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        
        if (error.includes('already verified')) {
          setMessage('This email address is already verified. You can proceed to login.');
          setVerificationStatus('already_verified');
        } else if (error.includes('expired') || error.includes('invalid')) {
          setMessage('The verification link has expired or is invalid.');
        } else {
          setMessage('Email verification failed. Please try again.');
        }
      }
    };

    verifyToken();
  }, [dispatch, navigate, searchParams]);

  const handleManualRedirect = () => {
    navigate('/login', { state: { emailVerified: true } });
  };

  const getStatusConfig = () => {
    const configs = {
      verifying: {
        icon: '⏳',
        title: 'Verifying Email',
        description: 'Please wait while we verify your email address',
        alertClass: 'bg-slate-100 border-slate-200 text-slate-900'
      },
      success: {
        icon: '✅',
        title: 'Email Verified Successfully!',
        description: `Redirecting to login in ${countdown} seconds...`,
        alertClass: 'bg-emerald-100 border-emerald-200 text-emerald-700'
      },
      error: {
        icon: '❌',
        title: 'Verification Failed',
        description: 'We couldn\'t verify your email address',
        alertClass: 'bg-red-100 border-red-200 text-red-700'
      },
      already_verified: {
        icon: 'ℹ️',
        title: 'Already Verified',
        description: 'Your email was already verified',
        alertClass: 'bg-slate-100 border-slate-200 text-slate-900'
      }
    };
    return configs[verificationStatus] || configs.verifying;
  };

  const statusConfig = getStatusConfig();

  return (
    <main className="main">
      <section className="loginArea">
        <div className="container">
          <div className="loginCard glass rounded-2xl shadow-hard mt-5">
            <div className="header text-center mb-8">
              <div className="contrib-avatar mx-auto mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {statusConfig.icon}
              </div>
              <h2 className="title text-3xl font-bold text-slate-900 mb-2">
                {statusConfig.title}
              </h2>
              <p className="subtitle text-slate-500 text-base">
                {statusConfig.description}
              </p>
            </div>

            {message && (
              <div className={`alert border-soft rounded-xl p-4 mb-6 text-center font-medium ${statusConfig.alertClass}`}>
                {message}
              </div>
            )}

            <div className="formContent">
              <div className="buttonWrapper mt-4">
                {verificationStatus === 'verifying' && (
                  <button
                    className="btn btn-primary w-100 font-semibold text-base py-3"
                    disabled
                  >
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Verifying your email...
                  </button>
                )}

                {(verificationStatus === 'success' || verificationStatus === 'already_verified') && (
                  <button
                    onClick={handleManualRedirect}
                    className="btn btn-primary w-100 font-semibold text-base py-3"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Continue to Login
                  </button>
                )}

                {verificationStatus === 'error' && (
                  <button
                    onClick={handleManualRedirect}
                    className="btn btn-primary w-100 font-semibold text-base py-3"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
                  </button>
                )}
              </div>

              <div className="footerLink text-center pt-4 mt-3">
                <Link to="/contact-support" className="link text-sm font-medium text-primary">
                  <i className="bi bi-question-circle me-1"></i>
                  Need help? Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default EmailVerification;