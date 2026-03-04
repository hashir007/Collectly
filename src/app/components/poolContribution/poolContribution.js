import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { loadScript } from "@paypal/paypal-js";
import {
  getFinalContributionAmount,
  createPaypalOrder,
  capturePaypalOrder
} from "../../slices/finance";

// Constants
const APPLE_PAY_VERSION = 4;
const PAYMENT_TYPES = {
  POOL: 'POOL'
};

const PAYMENT_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Custom Hooks
const usePayPalSDK = (defaultSettings) => {
  const [paypal, setPaypal] = useState(null);
  const [applepay, setApplepay] = useState(null);
  const [applepayConfig, setApplePayConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPayPalSDK = async () => {
      try {
        if (!defaultSettings?.paypal) {
          setIsLoading(false);
          return;
        }

        const paypalInstance = await loadScript({
          "client-id": defaultSettings.paypal.client_id,
          currency: "USD",
          "merchant-id": defaultSettings.paypal.merchant_id,
          components: "buttons,applepay",
          intent: "capture",
        });

        if (!mounted) return;

        setPaypal(paypalInstance);

        // Initialize Apple Pay if available
        if (paypalInstance?.Applepay) {
          const applePayInstance = paypalInstance.Applepay();
          const config = await applePayInstance.config();

          if (mounted) {
            setApplepay(applePayInstance);
            setApplePayConfig(config);
            console.log("Apple Pay config loaded:", config);
          }
        }
      } catch (err) {
        console.error("Failed to load PayPal SDK:", err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPayPalSDK();

    return () => {
      mounted = false;
    };
  }, [defaultSettings]);

  return { paypal, applepay, applepayConfig, isLoading, error };
};

const useContributionAmount = (poolSelected, currentUser, dispatch) => {
  const [contributionAmount, setContributionAmount] = useState(0);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (poolSelected?.defaultBuy_in_amount) {
      const defaultAmount = poolSelected.defaultBuy_in_amount;
      setContributionAmount(defaultAmount);

      if (currentUser?.user?.id) {
        dispatch(getFinalContributionAmount({
          userId: currentUser.user.id,
          amount: defaultAmount
        }));
      }
    }
  }, [poolSelected, currentUser, dispatch]);

  return { contributionAmount, setContributionAmount, validationError, setValidationError };
};

// Utility Functions
const validateAmount = (amount, minimumAmount) => {
  const parsedAmount = parseFloat(amount);

  if (amount === "" || isNaN(parsedAmount)) {
    return { isValid: false, error: "amount cannot be empty or invalid.", value: 0 };
  }

  if (parsedAmount <= 0) {
    return { isValid: false, error: "amount must be greater than zero.", value: parsedAmount };
  }

  if (parsedAmount < minimumAmount) {
    return {
      isValid: false,
      error: `in amount ($${parsedAmount}) must be at least $${minimumAmount}.`,
      value: parsedAmount
    };
  }

  return { isValid: true, error: "", value: parsedAmount };
};

// Sub-components
const PaymentMessage = ({ message, isSuccess }) => {
  if (!message) return null;

  return (
    <div
      className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mb-3`}
      role="alert"
    >
      <i className={`bi ${isSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
      {message}
    </div>
  );
};

const ContributionSummary = ({ joiningAmount, contributionAmount, discount }) => (
  <div className="bg-slate-100 rounded-xl p-3 mb-3">
    <div className="d-flex justify-content-between mb-2">
      <span className="text-sm text-slate-600">Your contribution</span>
      <span className="text-sm fw-medium">${contributionAmount.toFixed(2)}</span>
    </div>
    <div className="d-flex justify-content-between mb-2">
      <span className="text-sm text-slate-600">Credit Discount</span>
      <span className="text-sm fw-medium text-success">-${discount.toFixed(2)}</span>
    </div>
    <hr className="my-2" />
    <div className="d-flex justify-content-between">
      <span className="fw-medium">Total to Pay</span>
      <span className="fw-bold text-primary">${joiningAmount.toFixed(2)}</span>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="glass rounded-2xl border-soft p-5 shadow-soft mb-4 text-center">
    <div className="spinner-border text-primary mb-3" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted mb-0">Processing your payment...</p>
  </div>
);

// Apple Pay Button Component
const ApplePayButton = ({
  applepay,
  applepayConfig,
  poolSelected,
  joiningAmount,
  validationError,
  onPaymentStart,
  onPaymentComplete,
  onPaymentError
}) => {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const handleApplePayment = useCallback(async () => {
    console.log("Apple Pay button clicked");
    console.log("Config:", applepayConfig);
    console.log("Amount:", joiningAmount);

    if (!applepayConfig?.isEligible) {
      onPaymentError("Apple Pay is not available on this device.");
      return;
    }

    if (validationError || joiningAmount <= 0) {
      onPaymentError("Please enter a valid contribution amount.");
      return;
    }

    const paymentRequest = {
      countryCode: applepayConfig.countryCode,
      merchantCapabilities: applepayConfig.merchantCapabilities,
      supportedNetworks: applepayConfig.supportedNetworks,
      currencyCode: applepayConfig.currencyCode,
      requiredBillingContactFields: ["postalAddress", "name", "email"],
      total: {
        label: poolSelected?.name || "Pool Contribution",
        type: "final",
        amount: joiningAmount.toFixed(2),
      },
    };

    console.log("Payment request:", paymentRequest);

    let session;
    try {
      session = new window.ApplePaySession(APPLE_PAY_VERSION, paymentRequest);
      console.log("Apple Pay session created successfully");
    } catch (error) {
      console.error("Failed to create Apple Pay session:", error);
      onPaymentError(`Failed to initialize Apple Pay: ${error.message}`);
      return;
    }

    session.onvalidatemerchant = async (event) => {
      try {
        console.log("Validating merchant with URL:", event.validationURL);
        const validateResult = await applepay.validateMerchant({
          validationUrl: event.validationURL,
          displayName: poolSelected?.name || "Pool Contribution",
        });
        console.log("Merchant validated successfully");
        session.completeMerchantValidation(validateResult.merchantSession);
      } catch (error) {
        console.error("Merchant validation failed:", error);
        session.abort();
        onPaymentError(`Merchant validation failed: ${error.message || 'Unknown error'}`);
      }
    };

    session.onpaymentmethodselected = (event) => {
      console.log("Payment method selected:", event);
      session.completePaymentMethodSelection({
        newTotal: paymentRequest.total,
      });
    };

    session.onpaymentauthorized = async (event) => {
      console.log("Payment authorized, processing...");
      try {
        const { orderId, success } = await onPaymentStart();

        if (!success || !orderId) {
          console.error("Failed to create order");
          throw new Error("Failed to create order");
        }

        console.log("Confirming order with PayPal:", orderId);
        await applepay.confirmOrder({
          orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact,
        });

        console.log("Order confirmed, capturing payment...");
        await onPaymentComplete(orderId);

        console.log("Payment completed successfully");
        session.completePayment({
          status: window.ApplePaySession.STATUS_SUCCESS,
        });
      } catch (error) {
        console.error("Payment authorization failed:", error);
        session.completePayment({
          status: window.ApplePaySession.STATUS_FAILURE,
        });
        onPaymentError(`Payment failed: ${error.message || 'Unknown error'}`);
      }
    };

    session.oncancel = (event) => {
      console.log("Apple Pay cancelled by user");
      onPaymentError("Apple Pay payment was cancelled.");
    };

    try {
      console.log("Beginning Apple Pay session...");
      session.begin();
    } catch (error) {
      console.error("Failed to begin Apple Pay session:", error);
      onPaymentError(`Failed to start Apple Pay: ${error.message || 'Unknown error'}`);
    }
  }, [
    applepay,
    applepayConfig,
    poolSelected,
    joiningAmount,
    validationError,
    onPaymentStart,
    onPaymentComplete,
    onPaymentError
  ]);

  useEffect(() => {
    if (!applepayConfig?.isEligible || !containerRef.current) {
      console.log("Apple Pay not eligible or container not ready");
      return;
    }

    if (!window.ApplePaySession?.canMakePayments()) {
      console.log("Device cannot make Apple Pay payments");
      return;
    }

    console.log("Rendering Apple Pay button");

    // Clear existing content
    containerRef.current.innerHTML = '';
    
    const applePayButton = document.createElement('apple-pay-button');
    applePayButton.setAttribute('buttonstyle', 'black');
    applePayButton.setAttribute('type', 'plain');
    applePayButton.setAttribute('locale', 'en');
    applePayButton.style.width = '100%';
    applePayButton.style.height = '48px';
    
    containerRef.current.appendChild(applePayButton);
    
    buttonRef.current = applePayButton;
    applePayButton.addEventListener("click", handleApplePayment);

    return () => {
      if (buttonRef.current) {
        buttonRef.current.removeEventListener("click", handleApplePayment);
      }
    };
  }, [applepayConfig, handleApplePayment]);

  if (!applepayConfig?.isEligible) {
    return null;
  }

  return (
    <div className="mb-3">
      <div ref={containerRef}></div>
    </div>
  );
};

// PayPal Buttons Component
const PayPalButtonsWrapper = ({
  paypal,
  onCreateOrder,
  onApprove,
  disabled
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!paypal?.Buttons || !containerRef.current || disabled) {
      return;
    }

    let buttonsInstance = null;

    const renderButtons = async () => {
      try {
        buttonsInstance = paypal.Buttons({
          createOrder: onCreateOrder,
          onApprove: onApprove,
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48
          }
        });

        await buttonsInstance.render(containerRef.current);
      } catch (error) {
        console.error("Failed to render PayPal buttons:", error);
      }
    };

    renderButtons();

    return () => {
      if (buttonsInstance) {
        buttonsInstance.close().catch(console.error);
      }
    };
  }, [paypal, onCreateOrder, onApprove, disabled]);

  return <div ref={containerRef} className="mb-3"></div>;
};

// Main Component
const PoolContribution = ({ PoolID }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { user: currentUser } = useSelector((state) => state.auth);
  const { poolSelected, defaultSettings } = useSelector((state) => state.pool);
  const { contributionScheme } = useSelector((state) => state.finance);

  // Custom hooks
  const { paypal, applepay, applepayConfig, isLoading: isPayPalLoading } = usePayPalSDK(defaultSettings);
  const {
    contributionAmount,
    setContributionAmount,
    validationError,
    setValidationError
  } = useContributionAmount(poolSelected, currentUser, dispatch);

  // Local state
  const [discountedAmount, setDiscountedAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.IDLE);
  const [paymentMessage, setPaymentMessage] = useState({ text: "", isSuccess: false });

  // Computed values
  const minimumAmount = useMemo(() =>
    parseFloat(defaultSettings?.pool?.minimum_buy_amount) || 0,
    [defaultSettings]
  );

  const joiningAmount = useMemo(() => {
    return Math.max(0, discountedAmount);
  }, [discountedAmount]);

  const isPaymentDisabled = useMemo(() =>
    !!validationError || joiningAmount <= 0 || paymentStatus === PAYMENT_STATUS.PROCESSING,
    [validationError, joiningAmount, paymentStatus]
  );

  // Update discounted amount from contribution scheme
  useEffect(() => {
    if (Object.keys(contributionScheme).length > 0) {
      const finalAmount = parseFloat(contributionScheme.amount) || 0;
      const discountValue = parseFloat(contributionScheme.discount) || 0;
      
      setDiscountedAmount(finalAmount);
      setDiscount(discountValue);
    }
  }, [contributionScheme]);

  // Handle amount validation
  const handleAmountChange = useCallback((value) => {
    const validation = validateAmount(value, minimumAmount);

    setContributionAmount(validation.value);
    setValidationError(validation.error);

    if (validation.isValid && currentUser?.user?.id) {
      dispatch(getFinalContributionAmount({
        userId: currentUser.user.id,
        amount: validation.value
      }));
    }
  }, [minimumAmount, currentUser, dispatch, setContributionAmount, setValidationError]);

  // Create order handler
  const createOrder = useCallback(async () => {
    try {
      console.log("Creating order with amount:", joiningAmount);
      
      if (joiningAmount <= 0) {
        throw new Error("Invalid payment amount");
      }

      const response = await dispatch(createPaypalOrder({
        contributionAmount,
        discountedContributionAmount: joiningAmount,
        Id: PoolID,
        discount,
        type: PAYMENT_TYPES.POOL
      })).unwrap();

      console.log("Order created:", response);
      return { orderId: response.Order.id, success: true };
    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentMessage({
        text: error.message || "Failed to create payment order. Please try again.",
        isSuccess: false
      });
      return { orderId: null, success: false };
    }
  }, [contributionAmount, joiningAmount, PoolID, discount, dispatch]);

  // Capture payment handler
  const capturePayment = useCallback(async (orderId) => {
    try {
      console.log("Capturing payment for order:", orderId);
      setPaymentStatus(PAYMENT_STATUS.PROCESSING);

      await dispatch(capturePaypalOrder({
        orderId,
        Id: PoolID,
        userId: currentUser?.user?.id || null,
        type: PAYMENT_TYPES.POOL
      })).unwrap();

      console.log("Payment captured successfully");
      setPaymentStatus(PAYMENT_STATUS.SUCCESS);
      setPaymentMessage({
        text: "Payment Successful! Thank you for your contribution.",
        isSuccess: true
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Payment capture failed:", error);
      setPaymentStatus(PAYMENT_STATUS.ERROR);
      const errorMessage = error.response?.data?.response_message ||
        error.message ||
        "Payment failed. Please try again.";

      setPaymentMessage({
        text: errorMessage,
        isSuccess: false
      });
    }
  }, [PoolID, currentUser, dispatch]);

  // PayPal handlers
  const handlePayPalCreateOrder = useCallback(async () => {
    const result = await createOrder();
    if (!result.success) {
      throw new Error("Failed to create order");
    }
    return result.orderId;
  }, [createOrder]);

  const handlePayPalApprove = useCallback(async (data) => {
    await capturePayment(data.orderID);
  }, [capturePayment]);

  // Apple Pay handlers
  const handleApplePayStart = useCallback(async () => {
    return await createOrder();
  }, [createOrder]);

  const handleApplePayComplete = useCallback(async (orderId) => {
    await capturePayment(orderId);
  }, [capturePayment]);

  const handleApplePayError = useCallback((message) => {
    setPaymentMessage({ text: message, isSuccess: false });
    setPaymentStatus(PAYMENT_STATUS.ERROR);
  }, []);

  // Clear payment message when amount changes
  useEffect(() => {
    if (paymentMessage.text && contributionAmount > 0) {
      setPaymentMessage({ text: "", isSuccess: false });
    }
  }, [contributionAmount, paymentMessage.text]);

  // Loading state
  if (paymentStatus === PAYMENT_STATUS.PROCESSING) {
    return <LoadingSpinner />;
  }

  return (
    <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
      <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-heart-fill text-danger"></i>
        Make a Contribution
      </h5>

      <PaymentMessage
        message={paymentMessage.text}
        isSuccess={paymentMessage.isSuccess}
      />

      <div className="alert alert-info bg-info bg-opacity-10 border-0 text-sm mb-3">
        <i className="bi bi-info-circle-fill me-2"></i>
        Minimum contribution is <strong>${minimumAmount.toFixed(2)}</strong>
      </div>

      <div className="mb-4">
        <label className="form-label text-sm fw-medium">
          Contribution Amount
        </label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            min={minimumAmount}
            step="1"
            className="form-control"
            placeholder={minimumAmount.toString()}
            value={contributionAmount || ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={paymentStatus === PAYMENT_STATUS.PROCESSING}
          />
        </div>
        {validationError && (
          <div className="text-danger text-sm mt-2">
            <i className="bi bi-exclamation-circle me-1"></i>
            {validationError}
          </div>
        )}
      </div>

      {discount > 0 && (
        <div className="alert alert-success bg-success bg-opacity-10 border-0 text-sm mb-3">
          <i className="bi bi-piggy-bank-fill me-2"></i>
          You're saving <strong>${discount.toFixed(2)}</strong> with your credits!
        </div>
      )}

      <ContributionSummary
        joiningAmount={joiningAmount}
        contributionAmount={contributionAmount}
        discount={discount}
      />

      {!validationError && poolSelected?.status > 0 && joiningAmount > 0 && (
        <div className="payment-buttons">
          {isPayPalLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted text-sm mt-2">Loading payment options...</p>
            </div>
          ) : paypal ? (
            <>
              <PayPalButtonsWrapper
                paypal={paypal}
                onCreateOrder={handlePayPalCreateOrder}
                onApprove={handlePayPalApprove}
                disabled={isPaymentDisabled}
              />
              <ApplePayButton
                applepay={applepay}
                applepayConfig={applepayConfig}
                poolSelected={poolSelected}
                joiningAmount={joiningAmount}
                validationError={validationError}
                onPaymentStart={handleApplePayStart}
                onPaymentComplete={handleApplePayComplete}
                onPaymentError={handleApplePayError}
              />
            </>
          ) : (
            <div className="alert alert-warning mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Payment system unavailable. Please try again later.
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-3">
        <p className="text-sm text-muted mb-0">
          <i className="bi bi-shield-check me-1"></i>
          Secure payment processing powered by PayPal
        </p>
      </div>
    </div>
  );
};

export default PoolContribution;