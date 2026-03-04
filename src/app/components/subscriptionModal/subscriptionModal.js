import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Modal, Row, Col, Card, Button } from "react-bootstrap";
import {
  createPaypalSubscription,
  capturePaypalSubscription
} from "../../slices/subscription";
import styles from './subscriptionModal.module.css';

const SubscriptionModal = ({ showSubscribeModal, setShowSubscribeModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { subscriptionPlans, defaultSettings } = useSelector((state) => state.user);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionAmount, setSubscriptionAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [paymentMessage, setPaymentMessage] = useState({});
  const [amountValidation, setAmountValidation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalOptions, setPaypalOptions] = useState(null);
  const [applePayEligible, setApplePayEligible] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const applePayContainerRef = useRef(null);

  // Configure PayPal SDK
  useEffect(() => {
    if (defaultSettings && defaultSettings.paypal) {
      const options = {
        "client-id": defaultSettings.paypal.client_id,
        currency: "USD",
        "merchant-id": defaultSettings.paypal.merchant_id,
        components: "buttons,applepay",
        intent: "subscription",
        vault: true
      };
      setPaypalOptions(options);
    }
  }, [defaultSettings]);

  // Reset state when modal closes
  useEffect(() => {
    if (!showSubscribeModal) {
      setSelectedPlan(null);
      setShowPaymentSection(false);
      setPaymentMessage({});
      setAmountValidation("");
      setSubscriptionAmount(0);
      setDiscount(0);
      setFinalAmount(0);
    }
  }, [showSubscribeModal]);

  // Calculate final amount and discount based on selected plan
  useEffect(() => {
    if (selectedPlan) {
      const amount = parseFloat(selectedPlan.price) || 0;
      setSubscriptionAmount(amount);

      // Calculate discount if yearly plan (example: 15% discount for yearly)
      let calculatedDiscount = 0;
      if (selectedPlan.type === 'YEAR') {
        calculatedDiscount = amount * 0.15; // 15% discount for yearly
      }

      setDiscount(calculatedDiscount);
      setFinalAmount(amount - calculatedDiscount);
    }
  }, [selectedPlan]);

  // Handle plan selection
  const handlePlanSelect = useCallback((plan) => {
    if (plan.type === 'FREE') {
      // Handle free plan selection
      if (currentUser?.user?.planId === plan.id) {
        setPaymentMessage({
          successStatus: true,
          message: "You are already on the free plan."
        });
        return;
      }
      // Implement free plan activation logic here
      setPaymentMessage({
        successStatus: true,
        message: "Free plan activated successfully!"
      });
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentSection(true);
    setPaymentMessage({});
  }, [currentUser]);

  // Validate subscription amount
  const validateSubscriptionAmount = useCallback((amount) => {
    const parsedAmount = parseFloat(amount);

    if (amount === "" || isNaN(parsedAmount)) {
      setSubscriptionAmount(0);
      setAmountValidation("Subscription amount cannot be empty or invalid.");
      return;
    }

    setSubscriptionAmount(parsedAmount);

    if (parsedAmount <= 0) {
      setAmountValidation("Subscription amount must be greater than zero.");
    } else {
      // Recalculate discount and final amount based on new amount
      let calculatedDiscount = 0;
      if (selectedPlan?.type === 'YEAR') {
        calculatedDiscount = parsedAmount * 0.15; // 15% discount for yearly
      }

      setDiscount(calculatedDiscount);
      setFinalAmount(parsedAmount - calculatedDiscount);
      setAmountValidation("");
    }
  }, [selectedPlan]);

  // Create subscription for PayPal & Apple Pay
  const createSubscription = useCallback(async () => {
    try {
      if (!selectedPlan || !currentUser?.user?.id) {
        throw new Error("Please select a plan and ensure you are logged in.");
      }

      const response = await dispatch(createPaypalSubscription({
        planId: selectedPlan.id,
        subscriptionAmount: subscriptionAmount,
        finalAmount: finalAmount,
        discount: discount,
        userId: currentUser.user.id,
        type: 'SUBSCRIPTION'
      })).unwrap();

      // For PayPal Buttons, return the subscription ID
      return response.subscriptionId;

    } catch (error) {
      console.error('Error creating subscription:', error);
      setPaymentMessage({
        successStatus: false,
        message: error.message || "Failed to create subscription. Please try again."
      });
      throw error;
    }
  }, [subscriptionAmount, finalAmount, selectedPlan, discount, currentUser, dispatch]);

  // Capture subscription approval
  const onApprove = useCallback(async (data) => {
    try {
      setIsProcessing(true);

      await dispatch(capturePaypalSubscription({
        subscriptionId: data.subscriptionID,
        planId: selectedPlan.id,
        userId: currentUser?.user?.id,
        type: 'SUBSCRIPTION'
      })).unwrap();

      setPaymentMessage({
        successStatus: true,
        message: "🎉 Subscription Activated Successfully! Welcome to our premium community."
      });

      // Close modal after successful subscription
      setTimeout(() => {
        setShowSubscribeModal(false);
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Subscription capture error:', error);
      setPaymentMessage({
        successStatus: false,
        message: error.message || "Subscription activation failed. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan, currentUser, dispatch, navigate, setShowSubscribeModal]);

  // Check Apple Pay eligibility via PayPal SDK
  useEffect(() => {
    const checkApplePayEligibility = async () => {
      if (!window.paypal?.Applepay) return;

      try {
        const applepay = window.paypal.Applepay();
        const config = await applepay.config();
        setApplePayEligible(config.isEligible);
      } catch (err) {
        console.error("Apple Pay config error:", err);
        setApplePayEligible(false);
      }
    };

    if (paypalOptions) {
      checkApplePayEligibility();
    }
  }, [paypalOptions]);

  if (isProcessing) {
    return (
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showSubscribeModal}
        onHide={() => setShowSubscribeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Activating Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Processing your subscription...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showSubscribeModal}
      onHide={() => setShowSubscribeModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {showPaymentSection ? `Subscribe to ${selectedPlan?.name}` : 'Choose Your Plan'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!showPaymentSection ? (
          // Plan Selection View
          <Row className="g-4">
            {subscriptionPlans?.map((plan) => (
              <Col md={6} lg={4} key={plan.id}>
                <Card
                  className={`h-100 ${styles.planCard} ${plan.type === 'FREE' ? styles.freePlan :
                      plan.type === 'MONTH' ? styles.monthlyPlan :
                        styles.yearlyPlan
                    } ${currentUser?.user?.planId === plan.id ? styles.currentPlan : ''}`}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="text-center mb-3">
                      <h5 className="card-title fw-bold">{plan.name}</h5>
                      <div className="mb-2">
                        <span className="h3 fw-bold text-primary">
                          ${plan.price}
                        </span>
                        {plan.type !== 'FREE' && (
                          <span className="text-muted">
                            /{plan.type === 'MONTH' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                      {plan.type === 'YEAR' && (
                        <div className="text-success small fw-bold">
                          Save ${(parseFloat(plan.price) * 0.15).toFixed(2)} with yearly billing
                        </div>
                      )}
                      {currentUser?.user?.planId === plan.id && (
                        <div className="text-primary small fw-bold">
                          ✅ Current Plan
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex-grow-1 ${styles.planDescription}`}
                      dangerouslySetInnerHTML={{ __html: plan.description }}
                    />

                    <div className="mt-3">
                      <Button
                        variant={
                          plan.type === 'FREE' ? 'outline-primary' :
                            plan.type === 'MONTH' ? 'primary' : 'success'
                        }
                        className="w-100"
                        onClick={() => handlePlanSelect(plan)}
                        disabled={currentUser?.user?.planId === plan.id}
                      >
                        {currentUser?.user?.planId === plan.id ? (
                          'Current Plan'
                        ) : plan.type === 'FREE' ? (
                          'Select Free'
                        ) : (
                          `Subscribe${plan.type === 'YEAR' ? ' Yearly' : ''}`
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          // Payment View
          <div className="payment-section">
            {paymentMessage.message && (
              <div className={`alert ${paymentMessage.successStatus ? 'alert-success' : 'alert-danger'}`} role="alert">
                {paymentMessage.message}
              </div>
            )}

            {selectedPlan && (
              <div className="alert alert-info bg-info bg-opacity-10 border-0 text-sm mb-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                You are subscribing to: <strong>{selectedPlan.name}</strong>
                {selectedPlan.type === 'YEAR' && (
                  <span className="text-success ms-2">
                    (15% yearly discount applied)
                  </span>
                )}
              </div>
            )}

            {selectedPlan?.type !== 'FREE' && (
              <>
                <div className="mb-4">
                  <label className="form-label text-sm fw-medium">
                    {selectedPlan?.type === 'MONTH' ? 'Monthly Amount' : 'Yearly Amount'}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="amount"
                      className="form-control"
                      placeholder={selectedPlan?.type === 'MONTH' ? "9.99" : "99.99"}
                      value={subscriptionAmount}
                      onChange={(event) => validateSubscriptionAmount(event.target.value)}
                      disabled={!selectedPlan}
                    />
                  </div>
                </div>

                {amountValidation && (
                  <div className="alert alert-danger" role="alert">
                    {amountValidation}
                  </div>
                )}

                <div className="bg-light rounded p-3 mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-sm text-muted">
                      {selectedPlan?.type === 'MONTH' ? 'Monthly fee' : 'Yearly fee'}
                    </span>
                    <span className="text-sm fw-medium">${subscriptionAmount?.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-sm text-muted">Discount</span>
                      <span className="text-sm fw-medium text-success">
                        -${discount?.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span className="text-sm fw-medium">
                      You'll pay {selectedPlan?.type === 'MONTH' ? 'monthly' : 'yearly'}
                    </span>
                    <span className="text-sm fw-bold">${finalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                {paypalOptions && selectedPlan && (
                  <PayPalScriptProvider options={paypalOptions}>
                    <div className="mb-3">
                      <PayPalButtons
                        createSubscription={createSubscription}
                        onApprove={onApprove}
                        onError={(err) => {
                          console.error('PayPal subscription error:', err);
                          setPaymentMessage({
                            successStatus: false,
                            message: "Subscription setup failed. Please try again."
                          });
                        }}
                        style={{
                          layout: "vertical",
                          color: "blue",
                          shape: "rect",
                          label: "subscribe"
                        }}
                        disabled={!subscriptionAmount || amountValidation || finalAmount <= 0 || !selectedPlan}
                        forceReRender={[subscriptionAmount, finalAmount, amountValidation, selectedPlan]}
                      />
                    </div>

                    {applePayEligible && (
                      <div className="mb-3" ref={applePayContainerRef}>
                        <Button
                          variant="dark"
                          className="w-100"
                          style={{ height: "44px" }}
                          onClick={async () => {
                            try {
                              const subscriptionId = await createSubscription();
                              console.log("Apple Pay subscription created:", subscriptionId);
                            } catch (error) {
                              console.error("Apple Pay error:", error);
                            }
                          }}
                        >
                          Pay with Apple Pay
                        </Button>
                      </div>
                    )}
                  </PayPalScriptProvider>
                )}

                {!paypalOptions && (
                  <div className="alert alert-warning">
                    Payment system is not configured. Please contact support.
                  </div>
                )}

                <div className="text-center mt-3">
                  <p className="text-sm text-muted">
                    You can cancel your subscription anytime from your account settings.
                  </p>
                </div>
              </>
            )}

            <div className="text-center mt-2">
              <Button
                variant="outline-secondary"
                onClick={() => setShowPaymentSection(false)}
              >
                ← Back to Plans
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!showPaymentSection && (
          <small className="text-muted me-auto">
            * All plans include basic pool creation and joining features
          </small>
        )}
        <Button variant="outline-secondary" onClick={() => setShowSubscribeModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubscriptionModal;