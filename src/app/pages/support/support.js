import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { contactUs } from "../../slices/user";
import Footer from '../..//components/footer/footer';

const Support = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [pageStatus, setPageStatus] = useState("");
    const [activeTab, setActiveTab] = useState("email");
    const { user: currentUser } = useSelector((state) => state.auth);
    const [activeCategory, setActiveCategory] = useState("general");

    // Available tabs for validation
    const availableTabs = ['email', 'privacy', 'program', 'terms', 'faq'];

    useEffect(() => {
        // Get tab from query string only on initial load
        const tabFromQuery = searchParams.get('tab');

        if (tabFromQuery && availableTabs.includes(tabFromQuery)) {
            setActiveTab(tabFromQuery);
        }
        // Remove the else block to prevent resetting to 'email' unnecessarily
    }, []); // Empty dependency array - only run on mount

    useEffect(() => {
        // Update query string when tab changes
        const currentTab = searchParams.get('tab');

        // Only update if the tab actually changed
        if (currentTab !== activeTab) {
            const newSearchParams = new URLSearchParams(searchParams);

            if (activeTab === 'email') {
                // Remove tab parameter for default tab
                newSearchParams.delete('tab');
            } else {
                newSearchParams.set('tab', activeTab);
            }

            // Only update if there's an actual change
            if (newSearchParams.toString() !== searchParams.toString()) {
                setSearchParams(newSearchParams);
            }
        }
    }, [activeTab]); // Only depend on activeTab


    useEffect(() => {
        // Clear status when tab changes
        setPageStatus("");
    }, [activeTab]);

    const handleContactsUs = (formValue, { setSubmitting, resetForm }) => {
        const { firstname, lastname, email, message } = formValue;

        dispatch(contactUs({ firstName: firstname, lastName: lastname, email: email, message: message }))
            .unwrap()
            .then((response) => {
                handlePageStatus("success", "Your message has been sent successfully! We'll get back to you within 24 hours.");
                resetForm();
            })
            .catch((error) => {
                const errorMessage = error?.message || "Failed to send message. Please try again.";
                handlePageStatus("danger", errorMessage);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const handlePageStatus = (status, message) => {
        let alertClass = "";
        switch (status) {
            case "warning":
                alertClass = "alert-warning";
                break;
            case "danger":
                alertClass = "alert-danger";
                break;
            case "info":
                alertClass = "alert-info";
                break;
            case "success":
                alertClass = "alert-success";
                break;
            default:
                alertClass = "alert-info";
        }

        setPageStatus(`<div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`);
    };

    const validationSchema = Yup.object().shape({
        firstname: Yup.string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name must be less than 50 characters")
            .matches(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
            .required("First name is required"),
        lastname: Yup.string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name must be less than 50 characters")
            .matches(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
            .required("Last name is required"),
        email: Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required"),
        message: Yup.string()
            .min(10, "Message must be at least 10 characters")
            .max(2000, "Message must be less than 2000 characters")
            .required("Message is required"),
    });

    const initialValues = {
        firstname: currentUser?.firstName || "",
        lastname: currentUser?.lastName || "",
        email: currentUser?.email || "",
        message: ""
    };

    return (
        <>
            <div className="support-page">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-primary mb-3">How can we help you?</h1>
                        <p className="lead text-muted">Get answers to your questions or contact our support team</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-12">
                            <div className="card shadow-sm border-0 overflow-hidden">
                                <div className="card-header bg-white p-0">
                                    <ul className="nav nav-tabs nav-justified support-tabs" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('email')}
                                                type="button"
                                            >
                                                <i className="bi bi-envelope me-2"></i>Email Us
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('privacy')}
                                                type="button"
                                            >
                                                <i className="bi bi-shield me-2"></i>Privacy
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'program' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('program')}
                                                type="button"
                                            >
                                                <i className="bi bi-award me-2"></i>Secure Program
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'terms' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('terms')}
                                                type="button"
                                            >
                                                <i className="bi bi-file-text me-2"></i>Terms
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('faq')}
                                                type="button"
                                            >
                                                <i className="bi bi-question-circle me-2"></i>FAQs
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body p-4">
                                    {activeTab === 'email' && (
                                        <div className="tab-content">
                                            <div className="row">
                                                <div className="col-md-5 mb-4 mb-md-0">
                                                    <h3 className="fw-bold mb-4">Looking For Some Help?</h3>
                                                    <p className="text-muted mb-4">We've Got You Covered! Our support team is here to assist you with any questions or concerns.</p>

                                                    <div className="d-flex align-items-center mb-4">
                                                        <div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
                                                            <i className="bi bi-envelope-fill text-primary fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-1 fw-semibold">Email Us</h6>
                                                            <a href="mailto:support@collectly.com" className="text-muted mb-0 text-decoration-none">
                                                                support@collectly.com
                                                            </a>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center mb-4">
                                                        <div className="bg-success bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
                                                            <i className="bi bi-clock-fill text-success fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-1 fw-semibold">Response Time</h6>
                                                            <p className="text-muted mb-0">Within 24 hours</p>
                                                            <small className="text-muted">Typically 2-4 hours during business hours</small>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-info bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
                                                            <i className="bi bi-clock-history text-info fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-1 fw-semibold">Business Hours</h6>
                                                            <p className="text-muted mb-0">Mon - Fri: 9AM - 6PM EST</p>
                                                            <small className="text-muted">Weekend responses may be delayed</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-7">
                                                    <div className="border-start-md ps-md-4">
                                                        {pageStatus && (
                                                            <div
                                                                className="mb-4"
                                                                dangerouslySetInnerHTML={{ __html: pageStatus }}
                                                            />
                                                        )}

                                                        <Formik
                                                            initialValues={initialValues}
                                                            validationSchema={validationSchema}
                                                            onSubmit={handleContactsUs}
                                                            enableReinitialize
                                                        >
                                                            {({ errors, touched, isSubmitting, isValid, dirty }) => (
                                                                <Form>
                                                                    <div className="row">
                                                                        <div className="col-md-6 mb-3">
                                                                            <label htmlFor="firstname" className="form-label fw-semibold">
                                                                                First Name *
                                                                            </label>
                                                                            <Field
                                                                                name="firstname"
                                                                                type="text"
                                                                                className={`form-control ${errors.firstname && touched.firstname ? "is-invalid" : ""}`}
                                                                                placeholder="Enter your first name"
                                                                            />
                                                                            <ErrorMessage
                                                                                name="firstname"
                                                                                component="div"
                                                                                className="invalid-feedback"
                                                                            />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label htmlFor="lastname" className="form-label fw-semibold">
                                                                                Last Name *
                                                                            </label>
                                                                            <Field
                                                                                name="lastname"
                                                                                type="text"
                                                                                className={`form-control ${errors.lastname && touched.lastname ? "is-invalid" : ""}`}
                                                                                placeholder="Enter your last name"
                                                                            />
                                                                            <ErrorMessage
                                                                                name="lastname"
                                                                                component="div"
                                                                                className="invalid-feedback"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <label htmlFor="email" className="form-label fw-semibold">
                                                                            Email Address *
                                                                        </label>
                                                                        <Field
                                                                            name="email"
                                                                            type="email"
                                                                            className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`}
                                                                            placeholder="Enter your email address"
                                                                        />
                                                                        <ErrorMessage
                                                                            name="email"
                                                                            component="div"
                                                                            className="invalid-feedback"
                                                                        />
                                                                    </div>

                                                                    <div className="mb-4">
                                                                        <label htmlFor="message" className="form-label fw-semibold">
                                                                            Message *
                                                                        </label>
                                                                        <Field
                                                                            name="message"
                                                                            as="textarea"
                                                                            rows={6}
                                                                            className={`form-control ${errors.message && touched.message ? "is-invalid" : ""}`}
                                                                            placeholder="Please describe your issue or question in detail..."
                                                                        />
                                                                        <ErrorMessage
                                                                            name="message"
                                                                            component="div"
                                                                            className="invalid-feedback"
                                                                        />
                                                                        <div className="form-text">
                                                                            Please provide as much detail as possible so we can help you better.
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        type="submit"
                                                                        className="btn btn-primary w-100 py-3 fw-semibold"
                                                                        disabled={isSubmitting || !isValid || !dirty}
                                                                    >
                                                                        {isSubmitting ? (
                                                                            <>
                                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                                Sending Message...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <i className="bi bi-send me-2"></i>Send Message
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </Form>
                                                            )}
                                                        </Formik>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'privacy' && (
                                        <div className="tab-content">
                                            <h3 className="fw-bold mb-4">Privacy Policy</h3>
                                            <div className="privacy-content">

                                                <p>Welcome to the websites, mobile applications or widgets (as the case may be) operated by Collectly (including its subsidiaries, affiliates, agents, and service providers, collectively, “Collectly,” “we,” “us,” or “our”). Collectly provides a platform through its website at www.Collectly.com and attendant mobile applications (collectively, with any new features and applications, the “Platform”) and related services (collectively, with the Platform, the “Collectly Services”). The Platform provides information about Collectly, and explains how users can post a Pool, accept monetary Contributions, and details our related services (together with the Platform, the “Services”) to users and visitors (“you” or “your”).</p>
                                                <p>This Privacy Notice (the “Notice”) describes and governs how we collect, use, share, and protect information collected in the context of our Services. Before you use or submit any information through or in connection with the Services, please carefully review this Notice. By using any part of the Services, you acknowledge the collection, use, and disclosure of your information as outlined in this Notice. To the extent allowed by law, the English version of this Notice is binding and its translations in other languages are for convenience only; in case of discrepancies between the English version of this Notice and its translations, the English version shall prevail.</p>
                                                <p>If you are in the European Economic Area, the United Kingdom or Switzerland (collectively “Europe”):</p>
                                                <p>for the purposes of the EU General Data Protection Regulation 2016/679 (the “GDPR”), the data controller is Collectly and can be reached at the address set out at “Contacting Collectly” below; and you acknowledge you have read and understood this Notice. If you are a resident of California, the California Consumer Privacy Act of 2018 provides you with additional rights. Please view our “California Privacy Notice” to learn more.</p>
                                                <p>If you are a resident of Colorado, Connecticut, Utah or Virginia, the respective laws in your states provide you with additional rights. Please view our “Privacy Notice of certain other states in the United States” to learn more.</p>
                                                <p>INFORMATION WE COLLECT</p>
                                                <p>As further described below, when you use or otherwise access the Services, we collect information in multiple ways, including when you provide information directly to us, and when we passively collect information from your browser or device (e.g., by logging how you interact with our Services).</p>
                                                <p>A. Information That You Provide Directly to Us:</p>
                                                <p>I. Registration information: When you register for our Services or open an account, we collect your email address and login details, your zip code, your country, your phone number (for purposes of multi-factor authentication and to provide you with important messages) and any information you choose to provide us (such as a profile picture).</p>
                                                <p>If you are a Pool or nonprofit organization and are established as such under the applicable laws of incorporation (“Pool”), and you are located in the PayPal Giving Fund databases of the United States, United Kingdom, Ireland, Canada, or Australia, then we collect your name and email address. Thereafter, we will ask that you select your Pool and provide information to verify that you are a representative of said Pool. Alternatively, if you are outside of those five countries or if you have any questions about, or wish to review or correct, the information we maintain about you, then please visit this page.</p>
                                                <p>II. Creation of a Pool: When you create a Pool on the Platform, we collect the information you choose to provide us in relation to your Pool and we display it through our Platform. For example, you can provide a Pool title, choose a Pool category, upload images, and describe your Pool goal(s).</p>
                                                <p>You might, in creating a Pool, choose to provide us with information relating to other parties by organizing a Pool for a family member or friend, and in doing so, you disclose the name or circumstances of that family member or friend. By providing information in a Pool, you consent to our collection, storage and use of your data. If you upload personal data related to other parties, you acknowledge and agree that you have the authority of the relevant other parties for us to access and use the relevant data and that you have notified the other parties and informed them of how their information is collected and used by Collectly to provide the Services. We reserve the right to identify you as the person who has made the referral in any messages that are sent to them.</p>
                                                <p>Our payment processors also collect and maintain information related to your withdrawal of funds from any Pool.</p>
                                                <p>III. Setting up withdrawals: When you are the beneficiary (or the recipient of funds from a Pool), we collect your contact details (such as name and email address), zip code, country, your phone number (for purposes of multi-factor authentication and to send you important messages) and any information you choose to provide us.</p>
                                                <p>Our payment processors collect your bank details as well as other information necessary to set up the withdrawals.</p>
                                                <p>IV. Contribution information: On the Platform, when you donate to a Pool, we collect your contact details (such as name and email address), zip code, country, and any information you choose to provide us (such as a description of why you have donated).</p>
                                                <p>Our payment processors collect your credit card details and other information necessary to process the Contribution such as your home address.</p>
                                                <p>V. Public Communications: You can post comments, leave feedback, send thank-you notes or otherwise communicate with other users through our Platform. Any content, including such comments, feedback, and notes that you choose to post through our Platform are available to the public by default.</p>
                                                <p>Please remember that any information that is disclosed in these areas becomes public information for both us and other users to use and share. Take care not to disclose personal data unless you intend for that data to become public. Please also be considerate and respectful of others while using the community to publish your opinions. We reserve the right, but do not have the obligation, to review and monitor such posting or any other content on our Services, and to remove postings or content that may be viewed as inappropriate or offensive to others.</p>
                                                <p>VI. Communications to Collectly: If you have questions about how Collectly handles your Personal Information you may contact us via a contact form, email, by chat services or by other means (for example, with questions about our Services, for customer support, or to let us know your ideas for new products or modifications to existing products). You may also choose to respond to surveys that we send out, or queries about your Pools. When you do so, we collect the information you choose to provide us, such as your contact details, any images you choose to upload and the contents and nature of your message.</p>
                                                <p>We may engage vendors to provide certain interactive features on our Platform. Your use of these interactive features is voluntary, and we may retain the information that you submit through these features. For example, we may offer an interactive chat feature on the Platform for customer service purposes. When you participate in the interactive chat, the contents of the chat may be captured and kept as a transcript. By using these features, you understand that our vendors may process the information obtained through the feature to provide the service on our behalf. We also may combine information obtained through these features with information that we have about you.</p>
                                                <p>We would ask that you take care not to send financial information or other sensitive personal data to us through our chat services or other means, unless we ask you specifically for that data as part of providing our Service to you. When you provide such information to us directly, you consent to the processing of this data by Collectly and/or our service providers. We collect the information listed in this section for the purposes described below in the sections “Our Use of Information Collected” and “Our Disclosure of Information Collected Through the Services.” While you are under no obligation to provide us with such information, should you choose to withhold such information, we may not be able to provide you with some or all of the Services.</p>
                                                <p>VII. Information relating to other parties: You can choose to provide us with information relating to other parties. For example, if you choose to share your Pool with family and friends through our Platform’s texting services. If you decide to do that, we give you the option to either add information to our Platform or to provide us access to information stored in your email and mobile device’s address books, such as names, email addresses, or phone numbers of your contacts (collectively, “Third-Party Data”).</p>
                                                <p>If you use any feature of the Services that allows you to communicate with other parties (such as to refer another other party to the Services or to communicate with them regarding a Pool or a Contribution), either by submitting Third-Party Data to the Services or otherwise permitting the Services to automatically access Third-Party Data in your possession, you acknowledge, represent, and agree (a) that you have the authority of the relevant other party for us to access and use the relevant Third-Party Data, and (b) that you have notified these other parties and informed them how their information is collected and used by Collectly to provide the Services.</p>
                                                <p>We reserve the right to identify you as the person who has made the referral in any messages that are sent to them. We use Third-Party Data to (1) contact such party using the Third-Party Data provided, and/or (2) provide you with an editable template message designed to facilitate communication between you and such party through the Services. In addition to sending the foregoing communications, we may also send reminders or related messages to you and to other parties on your behalf from time to time, where permitted by applicable law. In each case, any such communications sent to such parties using Third-Party Data will provide a means to “opt out” of receiving further communication of the same nature.</p>
                                                <p>VIII. Sensitive information: You can also provide us with information about yourself or other parties that are considered sensitive, such as political opinions, race, ethnicity, health information or religious beliefs. If you post this information in a Pool, you choose to provide such information to be published publicly in relation to your Pool, Contribution or otherwise. Collectly may use any information which has manifestly been made public, including processing information about you that reveals sensitive information.</p>
                                                <p>When you provide such information to us, directly or indirectly, you consent to the processing of this data by Collectly and/or its service providers. We collect the information listed in this section for the purposes described below in the sections “Our Use of Information Collected” and “Our Disclosure of Information Collected Through the Services.</p>
                                                <p>IX. Biometric information: We use vendors for identity verification and fraud prevention purposes. These biometric information vendors, acting as our service providers and processors, may collect a copy of your government-issued ID (i.e., your driver’s license, state ID card, or passport) and a scan of the picture on your valid and unexpired government-issued ID for identification purposes (“biometric information”) and employ facial recognition technology to verify your identity. These biometric information services provide us with a confirmation as to whether your identity has been validated or not. Except as stated here, Collectly does not retain any biometric information, and instead that information is maintained by the processors/service providers performing the services.</p>
                                                <p>By disclosing your information with these biometric information vendors, you consent to the collection, processing, disclosure and storage of your biometric information for identity verification and fraud prevention purposes.</p>
                                                <p>Your biometric information will be used for identity verification and fraud prevention purposes and in accordance with this Notice. If you do not consent to the collection and use of your biometric information, we will use a copy of your valid and unexpired government-issued ID and other information to verify your identity.</p>
                                                <p>Your biometric information will be retained by our processors for as long as necessary for identity verification and fraud prevention and in accordance with applicable law. Please contact us as detailed in the “Contacting Collectly” section to the extent you have any questions regarding your biometric information.</p>
                                                <p>X. Data from Other Services: Collectly may use vendors to improve the quality of our own customer database so that we might improve our Services to you, and/or for verification and fraud prevention purposes. If you would like to opt out of these efforts (excluding the verification and fraud prevention purposes), please contact us at the email address or mailing address set forth under “Contacting Collectly.”</p>
                                                <p>B. Information That is Passively or Automatically Collected:</p>
                                                <p>I. Device &amp; Usage Information: When you interact with Collectly through the Services, we automatically receive and store certain information from devices that you use to access the Services. This information is collected passively by using various technologies, and includes the type of geolocation information, Internet browser or mobile device you use, any website from which you have come to the Services, your operating system, and location data through an IP address that identifies the city and state where you logged into the Platform or your precise geo-location if you have permitted your mobile device to provide that information to us. Collectly either stores such information itself or such information is included in databases owned and maintained by Collectly, and/or its agents or service providers.</p>
                                                <p>II. Location Information: When you use the Services to organize a Pool, the Services may require that you provide your zip code, city or town, and state or province of residence. Please keep in mind that other users of the Services can view your zip code, city or town, and state or province of residence in connection with the Pool, if it is made available within Collectly’s Public Search Directory. We also use your location information as described above under “Device &amp; Usage Information”, and in an aggregate way, as described below in the “Aggregated Data” section.</p>
                                                <p>III. Cookies and Other Electronic Technologies: When you interact with the Services, we try to make that experience simple and meaningful. When you visit our Platform, our web server, business providers, and/or the Social Networking Services (defined below) are integrated into the Service, we use cookies or other electronic technologies (such as web beacons or pixel tags) for various purposes. Cookies are small pieces of information that are issued to your computer or mobile device when you visit a website, or access or use a mobile application. That information regarding your use of the Platform is stored and sometimes tracked. Web beacons are transparent image files, which enable the Platform to track website usage information. Unlike cookies, web beacons are not placed on your computers. Pixel tags are tiny graphic images with unique identifiers that track online movements of our users. Unlike cookies, pixel tags are embedded in web pages. We will refer to the cookies and other technologies identified here collectively as “Cookies” for purposes of this Notice.</p>
                                                <p>i. Type of Cookies Some Cookies are strictly necessary to make our Services available to you (“Essential Cookies”). For example, Essential Cookies are used to provide the chat and login functionality and to remember your consent and privacy choices. We cannot provide our Services without these Essential Cookies. We also use Cookies for functional purposes in order to maintain and improve our Services or your experiences, and for marketing purposes (collectively, “Non-Essential Cookies”). Some of the Non-Essential Cookies used are set by us to collect and process certain data on our behalf and some are set by third parties and/or our Social Networking Services.</p>
                                                <p>Information to and from Social Networking Services Non-Essential Cookies include Cookies we use in conjunction with the Social Networking Services. One of the special features of the Services is that it allows you to enable or log into the Services via various social media applications / services, like Facebook or Twitter, or to upload videos using YouTube APIs (“Social Networking Service(s)”). By directly integrating these services, we aim to make your online experiences richer and more personalized. To take advantage of these features, we will ask you to provide your credentials for the applicable Social Networking Service in order to log in to our Services. When you add a Social Networking Services account to the Services or log into the Services using your Social Networking Services account, we will collect relevant information necessary to enable the Services to access that Social Networking Service. As part of such integration, the Social Networking Service will provide us with access to certain information that you have provided to the Social Networking Service (for example, your name and photograph, as well as other information that you permit the Social Networking Service to share with us).</p>
                                                <p>We will use, store, and disclose such information in accordance with this Notice. However, please remember that the manner in which Social Networking Services use, store, and disclose your information is governed by the policies of such third parties, and Collectly shall have no liability or responsibility for the privacy practices or other actions of any Social Networking Services that may be enabled within the Services. For example, if you upload a video onto your Pool using the mobile application for the Platform, your video will be uploaded using YouTube and subject to Google’s Privacy Policy and Google’s Security Settings. You also have the option of using single sign on or posting your activities to Social Networking Services when you access content through the Services. By proceeding, you are allowing the Social Networking Service to access your information on the Platform, and you are agreeing to the Social Networking Service’s terms of use and privacy policy in your use of the Service. You further acknowledge that if you choose to use this feature, your friends, followers, and subscribers on any Social Networking Services you have enabled will be able to view such activity. For example, if you sign on using Facebook, Facebook’s privacy policy and terms of service would apply to the data Facebook might obtain from your activities on Collectly. Please visit the terms of use and privacy policy of the relevant Social Networking Service to learn more about your rights and choices, and to exercise your choice about those technologies.</p>
                                                <p>ii. Analytics We use web analytics vendors on our Services, such as those of Google Analytics, to help us analyze how users use the Services, including by noting the website from which you arrive, and providing certain features to you including Google Signal features such as user id tracking, dynamic remarketing, interest-based advertising, audience targeting, behavioral reporting, demographics and interests reporting, user segment analysis, device reporting, display advertising, and video ads reporting. The information (including an anonymized IP address) collected by the technology will be disclosed to or collected directly by these service providers, who use the information to evaluate your use of the Services. This information can be used to place interest-based advertisements on the Platform. This may result in you seeing advertisements for our Platform when you visit other websites. To limit Google Analytics from using your information for analytics, you can install the Google Analytics Opt-out Browser Add-on by clicking here. You can also adjust your advertising settings by clicking here.</p>
                                                <p>We use Hotjar, a service provider, to help us understand and analyze how visitors use our services, and to improve the Services. Hotjar may collect the following types of information from users of our Services: device IP Address, device screen size, device type (unique device identifiers), browser information, geographic location (country only), preferred language used to display our Services, and details about your use of the Services (including clicks, cursor movement, and scrolling activity).</p>
                                                <p>Hotjar stores the above information in a pseudonymized format. Hotjar does not use this information to identify individual users, or match or link the information with other information about users. Hotjar is contractually forbidden to sell any of the data collected on our behalf. For more information regarding Hotjar’s collection and use of information, please visit Hotjar’s privacy policy here. You can opt-out of Hotjar’s use of tracking cookies and collection of information related to your use of our Services by following this opt-out link.”</p>
                                                <p>iii. Why We Use Cookies We use Cookies to collect information about your access to and use of the Platform, including to: (1) allow you to navigate and use all the features provided by our Platform; (2) customize elements of the layout and/or content within the Platform and remember that you have visited us before; (3) identify the number of unique visitors we receive; (4) improve the Platform and learn which functions of the Platform are most popular with users; and (5) understand how you use the Platform (e.g., by learning how long you spend on the Platform and where you have come to the Platform from). As we adopt additional technologies, we may gather additional information through other methods. We will notify you of such changes with updates to this Notice.</p>
                                                <p>iv. Your Cookie Preferences Most web and mobile device browsers automatically accept Cookies but, if you prefer, you can change your browser to prevent that or to notify you each time a cookie is set. If you are located in California, Colorado, Connecticut, Utah or Virginia, you can learn more about how we use cookies in our “California Privacy Notice” or the or the “Privacy Notice of certain other states in the United States”. You can also learn more about Cookies by visiting www.allaboutcookies.org, which includes additional useful information on Cookies and how to block Cookies using different types of browsers or mobile devices.</p>
                                                <p>You can also consult the “Help” section of your browser for more information (e.g., Internet Explorer, Google Chrome, Mozilla Firefox, or Apple Safari). If you receive tailored advertising on your computer, you can generally control Cookies from being put on your computer by visiting the following:</p>
                                                <p>or advertising based in the United States either the Network Advertising Initiative’s Consumer opt-out link, the Digital Advertising Alliance’s Consumer opt-out link or the Your Ad Choices for App tool; or  for advertising in Europe, the Digital Advertising Alliance Consumer Ad Choices opt-out link.  You can also manage the use of Flash technologies, including Cookies and local storage objects with the Flash management tools available at Adobe’s website. Please note that by blocking any or all Cookies, you may not have access to certain features or offerings of the Services.</p>
                                                <p>If you are accessing our Services through a mobile device, you can also update your privacy settings on your device by setting the “Limit Ad Tracking” and Diagnostics and Usage setting property located in the settings screen of your Apple iPhone or iPad, or by resetting your Android ID through apps that are available in the Play Store. You can also limit information collection by uninstalling the App on your device and you can use the standard uninstall process available as part of your device for this purpose. Finally, and in connection with the Social Networking Services, you can visit your settings with each of the Social Networking Services to exercise your choice about those technologies.</p>
                                                <p></p>
                                                <p>OUR USE OF INFORMATION COLLECTED</p>
                                                <p>Collectly uses the information collected from the Services in a manner that is consistent with this Notice. We use the information that you provide (or otherwise permit the Services to access) for the following purposes:</p>
                                                <p>A. Communicating With You We use the information we collect to contact you for administrative purposes (e.g., to provide services and information that you request or to respond to comments and questions). For instance, if you contact us by email, we will use the information you provide to answer your question or resolve your problem. In addition, we may call you if you are not responding to email and your Pool is subject to refunds.</p>
                                                <p>We also use the information we collect to send you communications relating to the Services, such as updates on events, communications relating to products and services offered by us and by third parties, and communications about services we believe will be of interest to you. For example, we can send periodic emails to registered users of the Services relating to their recent interactions with the Services, such as Contributing to a Pool.</p>
                                                <p>If you are located in Europe, we are processing this information as necessary (i) to fulfill our obligations under our contract with you or in order to take steps at your request prior to entering into a contract, or (ii) for our legitimate interest, such as, to maintain our relationship with you (including direct marketing) or to protect you and us against fraud.</p>
                                                <p> B. Mobile Services: If you access the Services through a mobile device and if you have chosen to provide us with your mobile number, or other electronic means to your mobile device, you agree that we can communicate with you regarding your Collectly account by SMS, MMS, text message. Further, when setting up your Collectly account, if you click “Send code” by “Text Message,” you agree to receive automated text messages related to your account from or on behalf of Collectly at the phone number provided. You can reply STOP to such text messages to cancel, except for automated text messages related to the security of your account. Message frequency will vary. Message and data rates may apply. In the event you change or deactivate your mobile telephone number, you agree to promptly update your Collectly account information to ensure that your messages are not misdirected. Please note that your wireless service carrier’s standard charges, data rates, and other fees may apply where you access the Services through a mobile device. In addition, downloading, installing, or using certain Services on a mobile device may be prohibited or restricted by your carrier, and not all Services may work with all carriers or devices.</p>
                                                <p>If you are located in Europe, we process this information as necessary (i) to fulfill our obligations under our contract with you or in order to take steps at your request prior to entering into a contract, or (ii) for our legitimate interest, such as, to maintain our relationship with you or to protect you and us against fraud.</p>
                                                <p>C. Providing the Services We use the information we collect to operate, maintain, and provide our Services such as enabling access to the Platform, customer support, or to complete transactions.</p>
                                                <p>If you are located in Europe, we process this information as necessary (i) to fulfill our obligations under our contract with you or in order to take steps at your request prior to entering into a contract, or (ii) for our legitimate interest, such as, to maintain our relationship with you or to protect you and us against fraud.</p>
                                                <p>D. Security and Fraud Prevention We use the information we collect to secure our Services and to verify identity, prevent fraud, and to continually improve these aspects of our Services. This includes our request for your (mobile) telephone number to conduct multi-factor authentication when you create an account and/or at the time you set up withdrawals as a beneficiary.</p>
                                                <p>If you are located in Europe, we process this information as necessary for our legitimate interest in maintaining the security or our systems, protecting our business, and/or protecting you and us against fraud.</p>
                                                <p>E. Analytics, Research and Product Development We use the information we collect to analyze data usage trends and preferences in order to improve the accuracy, effectiveness, security, usability or popularity of our Services. We further use data in connection with our research on our customer demographics, interests, and behavior.</p>
                                                <p>If you are located in Europe, we process this information (i) to fulfill our obligations under our contract with you or in order to take steps at your request prior to entering into a contract, or (ii) for our legitimate interest to monitor and improve our Services and your experience on the Platform or to maintain our relationship with you; or (iii) to protect our business or protect you and us against fraud.</p>
                                                <p>F. Customization We use the information we collect, such as device identifiers, to learn how users interact with our Services in order to personalize the content of our Services, such as customizing the language and Pools on our homepage based on your location.</p>
                                                <p>If you are located in Europe, we process this information (i) to fulfill our obligations under our contract with you or in order to take steps at your request prior to entering into a contract; or (ii) for our legitimate interest to monitor and improve your experience on the Platform.</p>
                                                <p>G. Legal We use information we collect to defend our legal rights, comply with state, local, federal or international laws, and to enforce our Terms of Service and this Notice.</p>
                                                <p>If you are located in Europe, we process information to comply with legal obligations.</p>
                                                <p>OUR DISCLOSURE OF INFORMATION COLLECTED THROUGH THE SERVICES</p>
                                                <p>There are certain circumstances in which we disclose information collected through the Services with certain other parties without further notice to you, as set forth below.</p>
                                                <p>A. Business Transfers: As we develop our business, we might sell or buy businesses or assets. In the event of a corporate sale, merger, reorganization, dissolution, similar event, or steps taken in anticipation of such events (e.g., due diligence in a transaction), user information may be part of the transferred assets.</p>
                                                <p>B. Affiliates and Subsidiaries: We disclose your personal information among the Collectly entities, including our affiliates and subsidiaries, in order to provide our Services including hosting; marketing and publicizing Pools; providing you with customer support; administering funds in connection with Pools; authenticating Contributors; sending you communications; and conducting the other activities described in this Notice.</p>
                                                <p>C. Agents, Consultants, Vendors and Related Third Parties: Collectly contracts with other companies to perform certain business-related functions on Collectly’s behalf, and we provide access to or disclose your information with these companies so they can perform services for us. Examples of such functions include marketing, mailing information, data storage, security, identity verification, fraud prevention, payment processing, legal services, and maintaining databases. For example, if you are a Contributor in Australia, Collectly’s Australian entity, Collectly Australia Pty Ltd (ACN 627 702 630) contracts with Adyen Australia for payment processing. Adyen Australia, therefore, will collect, process, and store your information on behalf of Collectly. We limit the personal information provided to these vendors and entities to that which is reasonably necessary for them to perform their functions, and we require them to agree to maintain the confidentiality of such information.</p>
                                                <p>D. Unaffiliated Parties that Partner With Us or our Affiliate or Other Services You Choose to Link: Collectly discloses personal information with third parties that partner with us on various initiatives and/or that offer services you choose to link to your Collectly Pool or that are linked to a Collectly Pool to which you may donate. Examples of this are Social Networking Services and their integrated social media tools or “plug-ins,” or other groups such as Caring Bridge or The Knot. When Collectly shares personal information with third parties, we require those third parties to handle the information in accordance with relevant laws. When you link to or interact directly with third-party companies (or you donate to Collectly Pools that are linked), their use of your personal information and your use of their features are governed by the privacy notices of those companies. We encourage you to carefully read their privacy notices.</p>
                                                <p>E. Legal Requirements: Collectly may access, disclose, transfer and preserve your information when we have a good faith belief that doing so is necessary to: (i) comply with the law including with subpoenas, search warrants, court orders, and other legal process; and respond to inquiries or requests from government, regulatory, law enforcement, public authorities, or content protection organizations; (ii) protect and defend the legal rights, privacy, safety or property of Collectly, its affiliates, subsidiaries, employees, agents, contractors, or its users; (iii) permit us to pursue available remedies, commence, participate in, or defend litigation, or limit the damages we may sustain; or (iv) enforce this Notice or any applicable Terms of Service.</p>
                                                <p>F. Organizers and beneficiaries of Pools: We may disclose your information with organizers and, if not the same, the beneficiaries of the Pool. For example, if you donate to a Pool, we disclose your name, email address and Contribution information you have provided in connection with your Contribution with the organizer or beneficiary, who may contact you. For example, if an individual starts a Pool for a Pool and you donate to that Pool, then if the information is requested, (i) the Pool can receive information about both the organizer, if not the same, and Contributors, and (ii) organizer can receive Contributor information. In the same scenario, the beneficiary may communicate with you about your Contribution and/or may rely on your information in order to comply with its legal and auditing requirements.</p>
                                                <p>G. Your Consent In certain situations, we may disclose your information in the event that you consent to the disclosure of your information. For example, we may partner with third party organizations to arrange for specific Pools. If you consent to our providing your contact information to a specific partner, we disclose, with the partner organization, your name, email address and other information you have provided in connection with your Contribution to the specific Pool.</p>
                                                <p>H. Aggregated Data We aggregate, anonymize and/or de-identify information collected actively or passively about you so that the information no longer relates to you individually. We then use that data for various lawful purposes, including but not limited to our research on our customer demographics, interests and behavior. We also disclose this information with our affiliates, agents, business partners, research facilities or other third parties (e.g., Google Analytics).</p>
                                                <p>I. Cookies and Other Electronic Technologies Information is disclosed as stated in the Section entitled “Cookies and Other Electronic Technologies.”</p>
                                                <p>J. Other Users of Our Services We provide your information to other users of our Services if you choose to make your information publicly available in a publicly accessible area of the Services, such as in your Pool or in the comments.</p>
                                                <p>VOLUNTEERED INFORMATION Please be advised that some information you provide may be publicly accessible, such as information posted in forums or comment sections. We also collect information through forums and communities, surveys and customer support communications, your communication to us of ideas for new products or modifications to existing products, feedback and other solicited or unsolicited submissions (collectively, with publicly-accessible information, “Volunteered Information”). By sending us Volunteered Information, you further (a) agree that we are under no obligation of confidentiality, express or implied, with respect to the Volunteered Information, (b) acknowledge that we may have something similar to the Volunteered Information already under consideration or in development, (c) grant us an irrevocable, non-exclusive, royalty-free, perpetual, worldwide license to use, modify, prepare derivative works, publish, distribute and sublicense the Volunteered Information, and (d) irrevocably waive, and cause to be waived, against Collectly and its users any claims and assertions of any moral rights contained in such Volunteered Information. This Volunteered Information section shall survive any termination of your account or the Services.</p>
                                                <p>CHILDREN Our Services are not designed for use by individuals under the age of 13 (or 16 for children located in Europe). If you are under the age of 13 (or 16 for children located in Europe), please do not use the Services and/or submit any information through the Services. If you have reason to believe that a child under the age of 13 (or 16 for children located in Europe) has provided personal information to Collectly through the Services, please contact us at GFMlegal@Collectly.com, and we will delete that information from our databases to the extent required by law.</p>
                                                <p>LINKS TO OTHER WEBSITES This Notice applies only to the Services. The Services can contain links to other web sites not operated or controlled by Collectly (the “Third-Party Sites”). The policies and procedures we described here do not apply to the Third-Party Sites. The links from the Services do not imply that Collectly endorses or has reviewed the Third-Party Sites. We suggest contacting those sites directly for information on their respective privacy policies.</p>
                                                <p>SECURITY While no organization can guarantee perfect security, Collectly has implemented and seeks to continuously improve technical and organizational security measures to protect the information provided via the Services from loss, misuse, unauthorized access, disclosure, alteration, or destruction. Please see here for details. For example, limiting access to information only to employees and authorized service providers who need to know such information for the purposes described in this Notice.</p>
                                                <p>DO-NOT-TRACK SIGNALS Do Not Track (“DNT”) is a privacy preference that users can set in certain web browsers. We do not respond to browser-initiated DNT signals. To learn more about Do Not Track, you can do so here. If you are a California consumer, you can view our “California Privacy Notice” to learn more about our recognition of other signals.</p>
                                                <p>RETENTION OF YOUR INFORMATION We retain your information for as long as we deem necessary for the purpose for which that information was collected and for our legitimate business operations; provided, however, that your information is only retained to the extent permitted or required by applicable laws. When we no longer need to retain your information, we will take reasonable steps to remove it from our systems and records and/or take steps to anonymize it so that you can no longer be identified from it in accordance with our internal document retention policies. When determining the retention period for your information, we take into account various criteria, such as the type of products and services requested by or provided to you, the nature and length of our relationship with you, possible re-enrolment with our products or services, the impact on the Services we provide to you if we delete some information about you, mandatory retention periods provided by law and the statute of limitations.</p>
                                                <p>CROSS BORDER DATA TRANSFERS Collectly is a global organization headquartered in the United States, which processes your information in servers in a number of countries, including the United States. Collectly has implemented other appropriate cross-border transfer solutions, such as Standard Contractual Clauses approved by appropriate regulatory authorities, to provide adequate protection for transfers of certain personal data from the European Economic Area, United Kingdom, and Switzerland to the United States.</p>
                                                <p>USERS FROM OUTSIDE THE UNITED STATES The Platform is hosted in the United States. If you are visiting the Platform from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located, and our central database is operated. The data protection and other laws of the United States and other countries might not be as comprehensive as those in your country. By using the Platform, you consent to your information being transferred to our facilities and to the facilities of those third parties with whom we share it as described in this Notice.</p>
                                                <p>USERS IN EUROPE If you are located in Europe, you have the right to ask for an overview of the information we process about you, and for a copy of your information. In addition, you may request us to update and correct inaccuracies, delete your information, restrict processing of your information, or exercise your right to data portability to easily transfer your information to another company. In some cases, you may object to the processing of your information and where we have asked you for your consent to process your information, you can withdraw it at any time. You may also withdraw a previously given consent for processing your personal information; the withdrawal of consent shall not affect the lawfulness of the processing based on consent before its withdrawal. The above rights may be limited under applicable law.</p>
                                                <p>You can make a request to exercise any of these rights in relation to your information by sending the request to us at the email address or mailing address set forth under “Contacting Collectly.” For your own privacy and security, at our discretion, we may require you to provide your identity before providing the requested information. Please note that Collectly may take up to 30 days to fulfill such requests.</p>
                                                <p>The above rights can be limited under applicable law. You also have the right to lodge a complaint with the local data protection authority if you believe that we have not complied with applicable data protection laws. You also have the right to lodge a complaint with the supervisory authority of your residence, place of work or where the incident took place.</p>
                                                <p>The Irish Data Protection Commissioner shall act as the competent supervisory authority for users in the European Economic Area. The Information Commissioner’s Office shall act as the competent supervisory authority for users in the United Kingdom.</p>
                                                <p>Marketing opt out Each marketing communication we send you will contain instructions permitting you to “opt out” of receiving future marketing communications. In addition, if at any time you wish not to receive any future marketing communications or you wish to have your name deleted from our mailing lists, please contact us at the email address or mailing address set forth under “Contacting Collectly.” If you opt out of receiving marketing communications or other information we think may interest you, we can still send you emails about your account or any Services you have requested or received from us.</p>
                                                <p>OTHER TERMS Your access to and use of the Services is subject to Collectly’s Terms of Service and such other terms, which may be made available to you in connection with your use of the Services.</p>
                                                <p>CHANGES TO Collectly’S PRIVACY NOTICE Collectly reserves the right to update or modify this Notice at any time and from time to time. We will notify you of any material updates or changes we make to this Notice. If you disagree with our revisions to the Notice, you can deactivate your account or discontinue the use of our Services. Please review this Notice periodically for any updates or changes to this Notice.</p>
                                                <p>By using our Platform and Services after any such update or modification, you acknowledge that you have read and understood the terms of the Notice as updated or modified.</p>
                                            </div>
                                        </div>

                                    )}

                                    {activeTab === 'program' && (
                                        <div className="tab-content">
                                            <h3 className="fw-bold mb-4">Secure Contribution Program</h3>
                                            <div className="program-content">
                                                <div className="alert alert-info border-0 bg-info bg-opacity-10">
                                                    <i className="bi bi-shield-check me-2"></i>
                                                    At Collectly, we value the trust our contributors place in us and we are committed to ensuring a secure and reliable platform for all users.
                                                </div>

                                                <p className="text-muted mt-4">
                                                    At Collectly, we value the trust our contributors place in us and we are committed to ensuring a secure and reliable platform for all users. To uphold this commitment, we have established the Collectly Contributor Guarantee Program. This program is designed to protect our contributors in the unlikely event that misuse occurs on our platform.

                                                    Guarantee Coverage: If a contribution is made to a pool on our platform and the organizer does not use the funds for their stated purpose, we will reimburse the contributor up to a certain amount (e.g., $1000). This guarantee applies to all contributions made on our platform and is subject to the terms and conditions outlined below.

                                                    Eligibility: To be eligible for the Collectly Contributor Guarantee Program, the contributor must have made a contribution to a pool on our platform and the organizer must have misused the funds. Misuse is defined as the organizer failing to use the funds for their stated purpose, using the funds for a fraudulent or illegal purpose, or failing to deliver promised rewards or benefits.

                                                    Claim Process: If a contributor believes that misuse has occurred, they must file a claim with us within 30 days of their contribution. The claim must include a detailed description of the alleged misuse, any relevant documentation or evidence, and the contributor's contact information. Our team will review the claim and, if approved, will reimburse the contributor up to the guarantee amount.

                                                    Exclusions: The Collectly Contributor Guarantee Program does not cover contributions made to pools that are not on our platform, contributions made to pools where the organizer has not clearly stated the purpose of the funds, or contributions made to pools where the misuse involves a disagreement over the quality or execution of the organizer's stated purpose.

                                                    Dispute Resolution: If there is a dispute between the contributor and the organizer regarding potential misuse, we will attempt to mediate the dispute. However, if a resolution cannot be reached, the dispute may need to be resolved through legal action.

                                                    Changes to the Program: We reserve the right to modify or terminate the Collectly Contributor Guarantee Program at any time. Any changes will be communicated to our users and will not affect any claims made prior to the changes.

                                                    We hope that the Collectly Contributor Guarantee Program provides our contributors with additional peace of mind when using our platform. We are committed to maintaining a safe and trustworthy environment for all users and will continue to take steps to protect our community.
                                                </p>

                                                <h5 className="mt-4">How It Works</h5>
                                                <ul className="text-muted">
                                                    <li>All contributions are protected by our secure payment system</li>
                                                    <li>We monitor all transactions for suspicious activity</li>
                                                    <li>If a pool is found to be misrepresented, we will refund contributions</li>
                                                    <li>24/7 monitoring of platform security</li>
                                                </ul>

                                                <div className="row mt-4">
                                                    <div className="col-md-6">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body text-center p-4">
                                                                <i className="bi bi-credit-card text-primary display-6 mb-3"></i>
                                                                <h5>Secure Payments</h5>
                                                                <p className="text-muted mb-0">All transactions are encrypted and secure</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body text-center p-4">
                                                                <i className="bi bi-shield-check text-primary display-6 mb-3"></i>
                                                                <h5>Fraud Protection</h5>
                                                                <p className="text-muted mb-0">Advanced systems detect and prevent fraud</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'terms' && (
                                        <div className="tab-content">
                                            <h3 className="fw-bold mb-4">Terms of Service</h3>
                                            <div className="terms-content">
                                                Subject to these Terms of Service, as amended from time to time (“Terms of Service”), Collectly provides the Collectly platform to you through its website at www.Collectly.com and attendant mobile applications (collectively, with any new features and applications, the “Platform”) and the Collectly Community and related services (collectively, with the Platform, including any new features and applications, the “Services”). If you are an Organizer (as defined below), Beneficiary (as defined below) to a Pool (as defined below), comment contributor, or Contributor (as defined below) (collectively referred to herein as a “User”) located in the United States, you are contracting with Collectly. If you are a User located outside of the United States, you are contracting with Collectly. For purposes of the following Terms of Service, “Collectly,” “we,” “us,” “our,” and other similar terms, shall refer to the party with whom you are contracting. For the avoidance of doubt, Collectly may apply, and exercise our rights under, these Terms of Service on behalf of the party that you are contracting with.

                                                ARBITRATION, JURY TRIAL, AND CLASS ACTION WAIVER: EXCEPT AS OTHERWISE DESCRIBED IN THE DISPUTES SECTION BELOW, BY USING THE SERVICES, YOU AGREE THAT DISPUTES BETWEEN YOU AND US WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE YOUR RIGHT TO A JURY TRIAL OR TO PARTICIPATE IN A CLASS ACTION. PLEASE REVIEW THE DISPUTES SECTION CAREFULLY; BY USING THE SERVICES, YOU EXPRESSLY ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND ALL OF THESE TERMS OF SERVICE.

                                                We reserve the right, at our sole discretion, to change or modify portions of these Terms of Service at any time and without notice. When we do this, we will post the revised Terms of Service on this page and will indicate the date of such revision.

                                                Your continued use of the Services after the date of any such changes constitutes your acceptance of the new Terms of Service. To the extent allowed by law, the English version of these Terms of Service is binding and their translations in other languages are for convenience only; in case of discrepancies between the English version of these Terms of Service and their translations, the English version shall prevail. If you do not wish to accept the new Terms of Service, you may discontinue your use of the Services.

                                                In addition, when using the Services, and unless you are in the European Economic Area, the United Kingdom, or Switzerland (collectively, “Europe”), you will be subject to additional applicable policies including without limitation, the Privacy Notice. All such terms are hereby incorporated by reference into these Terms of Service (provided, however, these Terms of Service will take precedence in the event of conflict). We shall resolve any such conflicts in our sole discretion, and all of our determinations are final.

                                                ACCESS AND USE OF THE SERVICES

                                                Services Description: Collectly provides a platform for individuals, entities, or non-profit organizations (the "Organizer") to create a money pool ("Pool") to collect funds ("Contributions") from contributors ("Contributors") for a specific purpose ("Purpose"). Collectly does not process payments but uses third-party payment processing partners to process Contributions for a Pool ("Payment Processor").

                                                Transaction Fee: There are no fees to start or maintain a Pool. However, a transaction fee, including credit and debit charges, is deducted from each Contribution ("Transaction Fee").

                                                The Services are Platform: Collectly is an administrative platform only. It facilitates the creation of Pools by Organizers and allows Contributors to contribute to these Pools. Collectly is not a broker, agent, financial institution, creditor, or non-profit corporation.

                                                All information and content provided by Collectly relating to the Services is for informational purposes only, and Collectly does not guarantee the accuracy, completeness, timeliness or reliability of any such information or content. No content is intended to provide financial, legal, tax or other professional advice. Before making any decisions regarding any Pool, Pools (as defined below), Contributions, Contributors, or any information or content relating to the Services, you should consult your financial, legal, tax or other professional advisor as appropriate. You acknowledge that all information and content accessed by you using the Services is at your own risk.

                                                Collectly has no control over the conduct of, or any information provided by, a User and hereby disclaims all liability in this regard to the fullest extent permitted by applicable law. We do not guarantee that a Pool will obtain a certain amount of Contributions or any Contributions at all. We do not endorse any Pool, User, or cause and we make no guarantee, express or implied, that any information provided through the Services is accurate. We expressly disclaim any liability or responsibility for the outcome or success of any Pool. You, as a Contributor, must make the final determination as to the value and appropriateness of contributing to any User or Pool.

                                                No Solicitation: The Platform is offered to help Organizers pool money. Collectly merely provides the technology to allow Pools to connect with Contributors. The existence of the Services is not a solicitation of Contributions by Collectly, and Collectly does not engage in any solicitation activities, or consult on the solicitation of contributions from the public, on behalf of any individual, entity, or organization. By using the Services, you understand and agree that Collectly is not responsible for the use of your Contributions or the amount of funds raised for the User or Pool.

                                                Contributors: All Contributions are at your own risk. When you make a Contribution through the Platform, it is your responsibility to understand how your money will be used and to check the Pool content regularly for any updates. Collectly is not responsible for any offers, promises, rewards or Promotions (as defined below) made or offered by Users or Pool; such conduct violates these Terms of Service. We do not and cannot verify the information that Users or Pool supply, nor do we represent or guarantee that the Contributions will be used in accordance with any pooling purpose prescribed by a User or Pool or in accordance with applicable laws. Notwithstanding the foregoing, we take possible fraudulent activity and the misuse of funds reported to us very seriously. You can learn more about How We Protect Our Community. If you have reason to believe that a User or Pool is not pooling or using the funds for their stated purpose, please use the “Report” button on the Pool to alert our team of this potential issue and we will investigate. If you are a Contributor, you may also be covered by the Collectly Giving Guarantee.

                                                If you are a Contributor to a non-profit organization, established as such under the applicable laws of incorporation (“Pool”):

                                                A. You are not permitted to impose restrictions on the use of such Contribution by the Pool. To the extent that you make a Contribution in response to an appeal for a particular program of a Pool, or to the extent that you purport to direct the use of Contributions by a Pool, any such directions shall constitute non-binding recommendations only and the Pool shall have full discretion to determine how all Contributions will be used.

                                                B. You should consult your tax advisor as to the amount of your Contribution that is tax deductible or eligible for tax recognition, having regard to (among other things) the tax status of the recipient of any Contribution in any relevant jurisdiction. Collectly makes no representation as to whether all or any portion of your Contributions, including, if any, Transaction Fees, are tax deductible or eligible for tax credits. Collectly will have no liability for any claim by any federal, state, provincial, territorial, local or any other tax authority with respect to the characterization on any applicable tax return of any Contribution by you, any User or any Pool.

                                                C. Unless you opt out of such disclosure, you acknowledge and agree that, in accordance with our Privacy Notice, certain of your personal information will be shared with the Pool to which you make a Contribution, including without limitation, as part of a Contributor List (as defined below) and may be used by such Pool to issue official Contribution receipts (or equivalent document) and in accordance with the Pool’s privacy policy. Collectly is not responsible, and shall not be liable, for any Pool’s use of any Contributor information.

                                                D. Please check for any applicable state-required disclosures for Pools soliciting contributions: state non-profit disclosures.

                                                Organizers: You, as an Organizer, represent, warrant, and covenant that: (i) all information you (whether through yourself, an agent or using artificial intelligence) provide in connection with a Pool or Beneficiary is accurate, complete, and not likely to deceive Users and that you will post updates as needed so that Users understand the use of funds and any other relevant information about your Pool; (ii) all Contributions contributed to your Pool will be used solely as described in the materials that you post or otherwise provide; (iii) if you withdraw Contributions believed by Contributors to be raised on behalf of someone other than you (i.e., the Beneficiary), all Contributions will be given to and/or spent on behalf of the Beneficiary; (iv) if you add a Beneficiary through the Services, you relinquish control of the Contributions; (v) you will not infringe the rights of others; (vi) you will comply with all relevant and applicable laws and financial reporting obligations, including but not limited to, laws and obligations relating to registration, tax reporting, political contributions, and asset disclosures for your Pool; (vii) to the extent you share with us any personal data of any third party for any purpose, including the names, email addresses and phone numbers of your personal contacts, you have the authority (including any necessary consents), as required under applicable law, to provide us with such personal data and allow us to use such personal data for the purposes for which you shared it with us; and (viii) you will not provide or offer to provide goods or services in exchange for Contributions. You authorize Collectly, and Collectly reserves the right to provide information relating to your Pool to Contributors, Beneficiaries of your Pool or law enforcement or other regulatory authorities, and to assist in any investigation thereof.

                                                If you use the Services as an agent of a Pool to raise funds for such Pool, you represent and warrant that: (a) you are a representative of the Pool, which representative is authorized to raise funds for the Pool and bind the Pool to these Terms of Service; (b) you are raising funds for a Pool, with a cause or activity that is legal under all applicable federal, state, provincial, territorial and local laws and regulations; (c) all donated funds will be used solely for the purpose you have stated on and in connection with your Pool, and under no circumstances may you use the funds for any other purpose; (d) your Pool has and will maintain tax-exempt status under applicable law (for example, the Internal Revenue Code in the United States or the Income Tax Act in Canada); and (e) if your Pool is in the United States, it is registered with GuideStar or the IRS tax exempt organization database, or, if your Pool is in Canada, it is listed in the Canada Revenue Agency’s database of registered Pools.

                                                Your Registration Obligations: You may be required to register with Collectly to access and use certain features of the Services. If you choose to register for the Services, you agree to provide and maintain true, accurate, current and complete information about yourself or your Pool as prompted by the Services’ registration form. Organizers must register using their true identities (or the identities of the Pools’ authorized representatives), including their name, address and any image or video purporting to depict the Organizer or the Beneficiary of such Pool. You agree to keep registration information current and up to date.

                                                Registration data and certain other information about you are governed by these Terms of Service, including our Privacy Notice. If you are under 13 years of age (16 in Europe), you are not authorized to use the Services, with or without registering. In addition, if you are under the age of majority in your jurisdiction (typically 18 or 19 years of age), you may use the Services, with or without registering, only with the approval of your parent or guardian. Certain aspects of our Services may also require you to register with, and agree to the terms of, third-party service providers (e.g., Payment Processors), with whom Collectly has entered into contracts, in order to be able to benefit from their services. If Collectly or one of our Payments Processors at any time discovers that the information you provided about you or the purpose of your Pool is incorrect or violates any of these Terms of Service or their terms of service, your access to the Services may be immediately suspended and/or terminated and fines may be applied by relevant authorities, which will in all such cases be payable by you.

                                                Pools: The Services include the features and services described here. All Contributions are subject to a Transaction Fee for each Contribution.

                                                A. Chargebacks and Refunds. Occasionally, a Contributor may dispute a credit card charge for a Contribution through the Services or submit a request for a refund under the Collectly Giving Guarantee.

                                                If Contributions are refunded to the Contributor by PayPal or pursuant to the Collectly Giving Guarantee, or if PayPal Giving Fund already remitted payment to the Organizer, the chargebacks or refunds will be deducted from future payments to the Pool, and if necessary, an invoice will be issued to the applicable Organizer. The applicable Organizer expressly agrees that: (a) it will be responsible for paying PayPal or PayPal Giving Fund the full amount of any Contribution refund due to a Contributor; and (b) PayPal or PayPal Giving Fund, as applicable, may elect to offset a future Contribution rather than requesting that the Pool return the refunded Contribution. If Contributions were made through Adyen or Stripe, the Pool has control over the Contributions and Pool, rather than Collectly or Adyen or Stripe, is responsible for issuing refunds and handling chargebacks directly with Contributors. B. Removal of a Pool from our Database. If you are the authorized representative of a Pool, and you do not wish for your Pool to appear in Collectly’s searchable database, you may contact us at mail@collectly.com to request that your Pool be removed from our database. Your email should include your full name, title, and an email address and phone number associated with your Pool. Please note that if your Pool is removed from the Collectly’s database, it will not be eligible to receive contributions through the Platform.

                                                C. Receiving Funds. As an Organizer, receipt of Contributions, minus any applicable Transaction Fees, is based upon and subject to the applicable Payment Processor’s procedures and terms. Available Payment Processors are described under “Payment Processors for Pools” below. Collectly is not a payment processor and does not hold funds.

                                                D. Taxes. Collectly does not withhold funds for tax purposes or otherwise. Pools will be solely responsible for taxes based on applicable international, federal, state, local or any other taxes or levies, or for any applicable taxes based on their net income or gross receipts (if any).

                                                E. Contributor Lists and Other Data. A Pool may access information about an Organizer of a Pool for the Pool, Contributor Lists (defined below) and Contributor Data (defined below) for compliance and transactional purposes. Please contact us here with any questions. “Contributor Data” means a Contributor’s name, email address, Contribution amount, date of transaction, transaction identification number, and name of the project. THE LIST OF ContributorS WHO CONTRIBUTE TO A POOL’S POOL THROUGH THE SERVICES (“CONTRIBUTOR LISTS”) IS PROVIDED “AS IS,” AND COLLECTLY MAKES NO REPRESENTATIONS, WARRANTIES OR GUARANTEES ABOUT THE ACCURACY, COMPLETENESS OR TIMELINESS OF ANY CONTRIBUTOR LIST OR ANY INFORMATION CONTAINED THEREIN.

                                                Taxes: It is your responsibility to determine what, if any, taxes apply to the Contributions you receive through your use of the Services. It is solely your responsibility to assess, collect, report or remit the correct tax, if any, to the appropriate tax authority.

                                                Member Account, Password and Security: You are responsible for maintaining the confidentiality of your password and account, if any, and are fully responsible for any and all activities that occur under your password or account. You agree to: (i) immediately notify Collectly of any unauthorized use of your password or account or any other breach of security; and (ii) sign out from your account at the end of each session when accessing the Services. Collectly will not be liable for any loss or damage arising from your failure to comply with this section.

                                                reCAPTCHA: The Platform uses the reCAPTCHA product to provide an added level of security. reCAPTCHA is subject to the Google Privacy Policy and Terms of Service.

                                                GoogleMaps: The Platform uses the Google Maps feature and content, which is subject to the then-current versions of the: (i) Google Maps/Google Earth Additional Terms of Service at https://maps.google.com/help/terms_maps.html; and (ii) Google Privacy Policy at https://www.google.com/policies/privacy/.

                                                Modifications to the Services: Collectly reserves the right to modify, suspend or discontinue, temporarily or permanently, the Services (or any part thereof) at any time and for any reason, with or without notice, and without any liability to you or to any third party for any claims, damages, costs, or losses resulting therefrom.

                                                Content Manifestly Made Public by the User.

                                                A. Public Content; Public Display of Information and Contributions. Some of your activity on and through the Services is public, such as content you post publicly on the Platform (including descriptions, texts, music, sound, information, data, software, graphics, comments, photos, videos, images, trademarks, logos, brands or other materials you upload or post through the Services, including through Collectly Clips or other functions on the Collectly Platform, or share with other Users or recipients) (collectively, “User Content”). Additionally, User profile information, including your first and last name, public email address, organization, personal biography, and other information you enter in connection with your User profile may be displayed to other Users to facilitate User interaction within the Services. For example, as an Organizer, you might post your personal data – such as information about a recent hospital stay – which data might be considered sensitive data. Please remember that if you choose to provide information using certain public features of the Services, then that information is governed by the privacy settings of those particular features and may be publicly available. Individuals reading such information may use or disclose it to other individuals or entities without our knowledge and without your knowledge, and search engines may index that information. We therefore urge you to think carefully about including any specific information you may deem private in content that you create or information that you submit through the Services. Please see our Privacy Notice for information on the ways that we may collect, use, and store certain information about you and your use of the Services.

                                                B. Other Information. Please be advised that User Content and other information, solicited or unsolicited, that you provide to Collectly may be publicly accessible, such as information you post in forums, comment sections or in response to surveys we may send out. We also collect information through customer support communications, your communications to us of ideas for new products or modifications to existing products, and other unsolicited submissions, or any questions, comments, suggestions, ideas, feedback or other information about the Services (collectively, with publicly-accessible information, “Other Information”). By sending us Other Information: (i) you agree that we are under no obligation of confidentiality, expressed or implied, with respect to the Other Information; (ii) you acknowledge that we may have something similar to the Other Information already under consideration or in development; (iii) you agree that Collectly will be entitled to the unrestricted use and dissemination of the Other Information for any purpose, commercial or otherwise, without acknowledgment or compensation to you; (iv) you represent and warrant that you have all rights necessary to submit the Other Information; (v) to the extent necessary, you hereby grant to Collectly a fully paid, royalty-free, perpetual, irrevocable, worldwide, non-exclusive, and fully transferable and sublicensable right (through multiple tiers) and license to use, reproduce, perform, display, distribute, adapt, modify, re-format, create derivative works of, and otherwise commercially or non-commercially exploit in any manner, any and all Other Information, and to sublicense the foregoing rights; and (vi) you irrevocably waive, and cause to be waived, against Collectly and its Users any claims and assertions of any moral rights contained in such Other Information. This Other Information section shall survive any termination of your account or the Services.

                                                You acknowledge and agree that Collectly may preserve Other Information, as well as User Content, and may also disclose your Other Information or User Content if required to do so by law or in the good-faith belief that such preservation or disclosure is reasonably necessary to: (a) comply with legal process, applicable laws or government requests; (b) enforce these Terms of Service; (c) respond to claims that any User Content violates the rights of third parties; or (d) protect the rights, property, or personal safety of Collectly, its Users, employees or the public.

                                                Third-Party Communications: If you use any feature of the Services that allows you to communicate with third parties (such as to refer a third party to the Services or to communicate with them regarding a Pool or a Contribution), either by submitting data about the third party (“Third-Party Data”) to the Services or otherwise permitting the Services to automatically access Third-Party Data in your possession, you acknowledge and agree that you have the authority of the relevant third party for us to access and use the relevant Third-Party Data and that you have notified these third parties and informed them how their information is collected and used by Collectly to provide the Services. We reserve the right to identify you as the person who has made the referral in any messages that are sent to them. We use Third-Party Data to: (i) contact such third party using the Third-Party Data provided; and/or (ii) provide you with an editable template message designed to facilitate communications between you and such third party through the Services. In addition to sending the foregoing communications, we may also send reminders or related messages to you and to third parties on your behalf from time to time where permitted by applicable law. In each case, any such communication sent to third parties using Third-Party Data will provide a means to “opt out” of receiving further communication of the same nature.

                                                Promotions on the Platform: If you are located in the United Kingdom, you will be permitted to offer give-away incentives (e.g., one sticker, while supplies last, for every Contribution made) in connection with Your Pool. Otherwise, You are not permitted to offer any contest, competition, reward, give-away, raffle, sweepstakes or similar activity (each, a “Promotion”) on or through the Services.

                                                Sales Prohibited on the Platform: You are not permitted to offer any good or service in exchange for a Contribution on the Platform.

                                                Data Retention: You acknowledge that Collectly has no obligation to you to retain data relating to any account or Pool. You acknowledge that Collectly reserves the right to delete data or to terminate accounts or Pool at any time and for any reason, with or without notice, and without any liability to you or to any third party for any claims, damages, costs or losses resulting therefrom. The foregoing does not apply to Pool or accounts started by Pools on the Platform, in which case Collectly will provide reasonable notice where possible.

                                                Mobile Services and Text Messages: The Collectly Services include certain features that may be made available via a mobile device, including the ability to: (i) upload User Content to the Platform; (ii) browse the Platform; and (iii) access certain items through an application downloaded and installed on a mobile device (collectively, the “Mobile Services”). To the extent you access Mobile Services, your wireless service carrier’s standard charges, data rates and other fees may apply. In addition, downloading, installing, or using certain Mobile Services may be prohibited or restricted by your carrier, and not all Mobile Services may work with all carriers or devices. By using the Mobile Services, you agree that we may communicate with you about matters related to your account by SMS, MMS, text message or other electronic means to your mobile device and that certain information about your usage of the Mobile Services may be communicated to us. Further, when setting up your Collectly account, if you click “Send code” by “Text Message,” you agree to receive automated text messages related to your account from or on behalf of Collectly at the phone number provided. You can reply STOP to such text messages to cancel, except for automated text messages related to the security of your account. Message frequency will vary. Message and data rates may apply. We will comply with any additional requirements that may apply under local laws and regulations before communicating with you in this manner. In the event that you change or deactivate your mobile telephone number, you agree to promptly update your Collectly account information to ensure that your messages are not sent to the person that acquires your old number.

                                                PROHIBITED CONDUCT

                                                You are solely responsible for compliance with all applicable law in relation to your Pool or use of the Services. You are further solely responsible for all User Content that you upload, post, publish, display, transmit or otherwise use. You are also responsible for ensuring the funds raised are used for the purpose outlined in the Pool. If you are not the Beneficiary of the Pool you organize, you agree to deliver funds to the ultimate Beneficiary directly and as soon as possible. You agree to fully cooperate with any request we make for evidence we deem necessary to verify your compliance with these Terms of Service.

                                                The following are examples of User Content and/or use that is illegal or prohibited by Collectly. This list is not exhaustive and we reserve the right to remove any Pool and/or investigate any User who, in our sole discretion, violates any of the terms or spirit of these Terms of Service, or other policies such as the Collectly Giving Guarantee or Beneficiary Guarantee. As we investigate your Pool, a User, or User Content, we may consider all available material including but not limited to social media, related news, and any other information that we, in our sole discretion, deem relevant in our review. We further reserve the right, without limitation, to ban or disable your use of the Services, remove the offending User Content, suspend or terminate your account, stop payments to any Pool, freeze or place a hold on Contributions, and report you to law enforcement authorities or otherwise take appropriate legal action, including without limitation, seeking restitution on behalf of ourselves and/or our Users.

                                                Without limiting the foregoing, you agree and represent, warrant and covenant:

                                                A. not to use the Services to raise funds or establish or contribute to any Pool with the implicit or explicit purpose of promoting or involving:

                                                the violation of any law, regulation, industry requirement, or third-party guidelines or agreements by which you are bound, including those of payment card providers and transaction processors that you utilize in connection with the Services; Pool that are fraudulent, misleading, inaccurate, dishonest or impossible; offensive, graphic, perverse or sensitive or sexual content; the funding of a ransom, human trafficking or exploitation, vigilantism, bribes or bounty; drugs, narcotics, steroids, controlled substances pharmaceuticals or similar products or therapies that are either illegal, prohibited, or enjoined by an applicable regulatory body; legal substances that provide the same effect as an illegal drug; or other products, medical practices or any related equipment or paraphernalia that have been found by an applicable regulatory body to cause consumer harm; activities with, in, or involving countries, regions, governments, persons, or entities that are subject to U.S. and other economic sanctions under applicable law, unless such activities are expressly authorized by the appropriate governmental authority; knives, explosives, ammunition, firearms, or other weaponry or accessories; User Content that reflects, incites or promotes behavior that we deem, in our sole discretion, to be an abuse of power or in support of terrorism, hate, violence, harassment, bullying, discrimination, terrorist financing or intolerance of any kind reflects an abuse of power relating to race, ethnicity, national origin, religious affiliation, sexual orientation, sex, gender, gender identity, gender expression, disabilities or diseases; the legal defense of alleged financial and violent crimes; User Content that reflects suicide or self-harm; publication of User Content (such as mug shots) that causes reputational harm; the aggregation of funds owed to third parties, factoring, or other activities intended to obfuscate the origin of funds; annuities, investments, loans, equity or lottery contracts, law-away system, off-short banking or similar transactions, money service businesses (including currency exchanges, check cashing or the like), pyramid schemes, “get rich quick schemes” (i.e., investment opportunities or other services, that promise high rewards), network marketing and referral marketing programs, debt collection or crypto-currencies; the receipt or grant of cash advances or lines of credit to yourself or to another person or purposes other than those purposes clearly stated in the Pool or for credit repair or debt settlement services; counterfeit music, movies, software, or other licensed materials without the appropriate authorization from the rights holder; products or services that directly infringe or facility infringement upon the trademark, patent, copyright, trade secrets, or proprietary or privacy rights of any third party; the unauthorized sale or resale of goods or services; any election campaigns in an unsupported country unless run by a registered organization within a supported country; the collecting of payments on behalf of merchants by Payment Processors or otherwise; including but not limited to self-payments on Pool or an attempt to bypass or otherwise circumvent the designated method of payment as provided by Collectly; the collecting or providing of funds for any purpose other than as described in a Pool description; or any other activity that Collectly may deem, in its sole discretion, to: (a) be unacceptable or objectionable; (b) restrict or inhibit any other person from using or enjoying the Services; or (c) expose Collectly, its employees or Users to any harm or liability of any type. B. not to use the Services to transmit or otherwise upload any User Content that: (i) infringes any intellectual property or other proprietary rights of any party; (ii) you do not have a right to upload under any law or under contractual or fiduciary relationships; (iii) contains software viruses or any other computer code, files or programs designed to interrupt, destroy or limit the functionality of any computer software or hardware or telecommunications equipment; (iv) poses or creates a privacy or security risk to any person; or (v) constitutes unsolicited or unauthorized advertising, promotional materials, commercial activities and/or sales, “junk mail,” “spam,” “chain letters,” “pyramid schemes,” “contests,” “sweepstakes,” or any other form of solicitation;

                                                C. not to interfere with or disrupt servers or networks connected to or used to provide the Services or their respective features, or disobey any requirements, procedures, policies or regulations of the networks connected to or used to provide the Services;

                                                D. not to harvest, collect or publish personally identifiable information of others;

                                                E. not to raise funds for a minor without the express permission of the minor’s guardian unless the funds are transferred into a trust, UTMA or UGMA account for the sole benefit of the minor;

                                                F. not to use the Services on behalf of a third party or post any personal data or other information about a third party, without the express consent of that third party;

                                                G. not to use another User’s account or URL without permission, impersonate any person or entity, falsely state or otherwise misrepresent your affiliation with a person or entity, misrepresent a Pool or Pool through the Services, or post User Content in any inappropriate category or areas on the Services;

                                                H. not to create any liability for Collectly or cause us to lose (in whole or in part) the services of our Internet Service Provider(s), web hosting company or any other vendors or suppliers;

                                                I. not to gain unauthorized access to the Services, or any account, computer system, or network connected to the Services, by any unauthorized or illegal means;

                                                J. not to obtain or attempt to obtain any materials or information not intentionally made available through the Services;

                                                K. not to use the Services to post, transmit or in any way exploit any information, software or other material for commercial purposes, or that contain advertising, except that using the Services for pooling activities in accordance with these Terms of Service is expressly permitted;

                                                L. not to transmit more request messages through the Services in a given period of time than a human can reasonably produce in the same period by using a conventional online web browser;

                                                M. not to undertake any activity or engage in any conduct that is inconsistent with the business or purpose of the Services; or

                                                N. not to attempt to undertake indirectly any of the foregoing.

                                                Additionally, with respect to all Contributions you make or accept through the Services, you agree and represent, warrant and covenant:

                                                A. not to make or accept any Contributions that you know or suspect to be erroneous, suspicious or fraudulent;

                                                B. not to use the Services in or for the benefit of a country, organization, entity, or person embargoed or blocked by any government, including those on sanctions lists identified by the United States Office of Foreign Asset Control (OFAC);

                                                C. to maintain reasonable and standard security measures to protect any information transmitted and received through the Services, including without limitation, adhering to any security procedures and controls required by Collectly from time to time;

                                                D. to maintain a copy of all electronic and other records related to Pool and Contributions as necessary for Collectly to verify compliance with these Terms of Service and make such records available to Collectly upon our request. For clarity, the foregoing does not affect or limit your obligations to maintain documentation as required by applicable laws, rules, regulations, or governmental authority; and

                                                E. at Collectly’s request, to fully cooperate in the auditing of, investigation of (including without limitation, investigations by Collectly, a Payment Processor, or a regulatory or governmental authority), and remedial efforts to correct any alleged or uncovered violation or wrongdoing of a User to whom, or Pool or Contribution to which, you are connected.

                                                Collectly reserves the right to refuse, condition, or suspend any Contributions or other transactions that we believe in our sole discretion may violate these Terms of Service or harm the interests of our Users, business partners, the public, or Collectly, or that expose you, Collectly, or others to risks unacceptable to us. We may share any information related to your use of the Services with the appropriate financial institution, regulatory authority, or law enforcement agency consistent with our Privacy Notice. This information may include information about you, your account, your Contributors, your Contributions, and transactions made through or in connection with your use of the Services.

                                                CONTRIBUTOR CONDUCT

                                                Contributions: In order to contribute to a Pool or to a Pool, a Contributor will be required to provide Collectly information regarding the Contributor’s credit card or other payment instrument (“Payment Instrument”) that is linked to the Contributor’s Collectly account (a “Billing Account”). You, as a Contributor, represent and warrant to Collectly that such information is true, current and accurate and that you are authorized to use the applicable Payment Instrument. You agree that a certain minimum Contribution amount may apply, and that all Contributions are final and will not be refunded unless Collectly, in its sole discretion, agrees to issue a refund, for example in accordance with the Collectly Giving Guarantee. Collectly uses third-party payment processing partners to bill you through your Payment Instrument and Billing Account for any Contributions made, and Contributors acknowledge that by contributing a Contribution to a Pool, the Contributor agrees to the processing, use, transfer or disclosure of data by the Payment Processors pursuant to these Terms of Service as well as any and all applicable terms set forth by our payment partners. For a list of our current Payment Processors and links to their terms of service, please see the PAYMENT PROCESSORS section below.

                                                ORGANIZERS, BENEFICIARIES OR POOLS

                                                Account Holds: From time to time, Collectly may, in its sole discretion, place a hold on a Pool account (a “Hold”), restrict Withdrawals (defined herein as the transfer of Funds raised to Beneficiary), initiate a reverse ACH transfer, secure reserves, or take similar actions to protect its interests and those of its Users. Some of the reasons that we may take such actions include, but are not limited to, our belief or determination, in our sole and absolute discretion, that: (i) information provided by an Organizer is false, misleading, or fraudulent, or funds are being used in a prohibited manner; (ii) the funds available should be provided directly to a person other than the Organizer, such as a legal beneficiary or person entitled by law to act on behalf of an Organizer; (iii) a Pool or Organizer has violated these Terms of Service; (iv) the Organizer is colluding with Contributors to engage in fraudulent activity; (v) there may be suspicious or fraudulent Contribution activity; or (vi) such action(s) is required to comply with a court order, subpoena, writ, injunction, or as otherwise required under applicable laws and regulations. If you have questions about a Hold we may have placed on your Pool account, or need information about how to resolve the Hold, please see this article.

                                                Withdrawing Contributions from a Pool: While Collectly strives to make Withdrawals available to you promptly, you acknowledge and agree that: (i) Withdrawals may not be available to you for use immediately; (ii) Collectly does not guarantee that Withdrawals will be available to you within any specific time frame; and (iii) Collectly expressly disclaims any and all responsibility for any delay in Withdrawals or your inability to access and use Withdrawals at any specified time, and any consequences arising from such delay or inability. You, as an Organizer and/or Beneficiary, are responsible for ensuring that the information you provide to Collectly in order to process a Withdrawal, including bank account information, is accurate and up to date. Collectly may, at any time, for any reason, without notice, and in its sole discretion, offer or issue a refund of Contribution(s) with or without consulting with you, which may comprise the entire amount donated to your Pool. Collectly is not liable to you or to any third party for any claims, damages, costs, losses, or other consequences caused by Collectly issuing refunds, including, but not limited to transaction or overdraft fees.

                                                PAYMENT PROCESSORS

                                                Collectly uses Payment Processors to process Contributions for your Pool and thereafter deliver it to you. In order to withdraw funds from a Pool, an Organizer or, if not the same, Beneficiary (collectively “Withdrawing Entity”) will be required to provide the Payment Processor information regarding bank account information (“Withdrawing Account”). You, as Withdrawing Entity, represent and warrant to Payment Processor and Collectly that such information is true and that you are authorized to use the applicable Withdrawing Account.

                                                By setting up a Pool or accepting the role of Beneficiary to a Pool, the Withdrawing Entity agrees to the processing, use, transfer or disclosure of data by the Payment Processors pursuant to these Terms of Service as well as any and all applicable terms set forth by the applicable Payment Processors. Our current Payment Processors include: PayPal, Inc. (PayPal’s terms of service), and PayPal Giving Fund. Payment Processors for Pools: Collectly has partnered with PayPal for Contributions to Pools. Although exceptions can be made, Pools in the United States, United Kingdom, Ireland, Canada and Australia will be defaulted to using PayPal to process Contributions made through the Services. The manner in which transactions are processed is explained below. Pools in other countries will be defaulted to using Adyen or Stripe.

                                                A. PayPal.

                                                i. Except as noted above, PayPal is the Payment Processor for Pool with a Pool identified as a Beneficiary.

                                                SPECIAL NOTICE FOR INTERNATIONAL USE; EXPORT CONTROLS

                                                Software (as defined below) available in connection with the Services and the transmission of applicable data, if any, may be subject to export controls and economic sanctions laws of the United States or other jurisdictions. No Software may be downloaded from the Services or otherwise exported or re-exported in violation of such export control and economic sanctions laws. Downloading or using the Software is at your sole risk. Recognizing the global nature of the Internet, you agree to comply with all local rules and laws regarding your use of the Services, including as it concerns online conduct and acceptable content.

                                                APPLE-ENABLED SOFTWARE APPLICATIONS

                                                Collectly offers Software applications that are intended to be operated in connection with products made commercially available by Apple Inc. (“Apple”), among other platforms. With respect to Software that is made available for your use in connection with an Apple-branded product (such Software, “Apple-Enabled Software”), in addition to the other terms and conditions set forth in these Terms of Service, the following terms and conditions apply:

                                                Collectly and you acknowledge that these Terms of Service are concluded between Collectly and you only, and not with Apple, and that as between Collectly and Apple. Collectly, not Apple, is solely responsible for the Apple-Enabled Software and the content thereof. You may not use the Apple-Enabled Software in any manner that is in violation of or inconsistent with the Usage Rules set forth for Apple-Enabled Software in, or otherwise be in conflict with, the App Store Terms of Service. Your license to use the Apple-Enabled Software is limited to a non-transferable license to use the Apple-Enabled Software on an iOS Product that you own or control, as permitted by the Usage Rules set forth in the App Store Terms of Service. Apple has no obligation whatsoever to provide any maintenance or support services with respect to the Apple-Enabled Software. Apple is not responsible for any product warranties, whether express or implied by law. In the event of any failure of the Apple-Enabled Software to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price for the Apple-Enabled Software to you, if any; and, to the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the Apple-Enabled Software, or any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty, which will be Collectly’s sole responsibility, to the extent it cannot be disclaimed under applicable law. Collectly and you acknowledge that Collectly, not Apple, is responsible for addressing any claims of you or any third party relating to the Apple-Enabled Software or your possession and/or use of that Apple-Enabled Software, including, but not limited to: (i) product liability claims; (ii) any claim that the Apple-Enabled Software fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation. In the event of any third party claim that the Apple-Enabled Software or the end-user’s possession and use of that Apple-Enabled Software infringes that third party’s intellectual property rights, as between Collectly and Apple, Collectly, not Apple, will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim. You represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a “terrorist supporting” country; (ii) you are not listed on any U.S. Government list of prohibited or restricted parties and (iii) you are not located in any other country or jurisdiction from which you would be barred from using the Services by applicable law. If you have any questions, complaints or claims with respect to the Apple-Enabled Software, they should be directed to Collectly as follows: Collectly mail@Collectly.com Collectly and you acknowledge and agree that Apple, and Apple’s subsidiaries, are third-party beneficiaries of these Terms of Service with respect to the Apple-Enabled Software, and that, upon your acceptance of the terms and conditions of these Terms of Service, Apple will have the right (and will be deemed to have accepted the right) to enforce these Terms of Service against you with respect to the Apple-Enabled Software as a third-party beneficiary thereof. Accordingly, the parties acknowledge and agree that Collectly enters into this clause (“Apple-Enabled Software Applications”) for its own benefit and on its own behalf and also as an agent for the benefit and on behalf of Apple and its subsidiaries with respect to the exercise and enforcement of all rights, benefits and remedies of Apple and its subsidiaries (but not any obligation or burden) in this clause (“Apple-Enabled Software Applications”) which rights, benefits and remedies shall be enforceable by Collectly in its own right and also as agent for and on behalf of each of Apple and its subsidiaries. Collectly may amend, terminate or rescind these Terms of Service without the consent of Apple or any such subsidiary.

                                                INTELLECTUAL PROPERTY RIGHTS

                                                Services Content, Software and Trademarks: You acknowledge and agree that the Services may contain content or features (“Services Content”) that are protected by copyright, patent, trademark, trade secret or other proprietary rights and laws. Except as expressly authorized by Collectly, you agree not to modify, copy, frame, scrape, rent, lease, loan, sell, distribute or create derivative works based on the Services or the Services Content, in whole or in part, except that the foregoing does not apply to your own User Content that you legally upload to the Services. In connection with your use of the Services you will not engage in or use any data mining, spiders, robots, scraping or similar data gathering or extraction methods. If you are blocked by Collectly from accessing the Services (including by blocking your IP address), you agree not to implement any measures to circumvent such blocking (e.g., by masking your IP address or using a proxy IP address). Any use of the Services or the Services Content other than as specifically authorized herein is strictly prohibited. The technology and software underlying the Services or distributed in connection therewith are the property of Collectly, our affiliates and our partners (the “Software”). You agree not to copy, modify, create a derivative work of, reverse engineer, reverse assemble or otherwise attempt to discover any source code, sell, assign, sublicense, or otherwise transfer any right in the Software. Any rights not expressly granted herein are reserved by Collectly.

                                                The Collectly name and logos are trademarks and service marks of Collectly (collectively the “Collectly Trademarks”). Other company, product, and service names and logos used and displayed via the Services may be trademarks or service marks of their respective owners, who may or may not endorse or be affiliated with or connected to Collectly. Nothing in these Terms of Service or the Services should be construed as granting, by implication, estoppel, or otherwise, any license or right to use any of Collectly Trademarks displayed on the Services, without our prior written permission in each instance. All goodwill generated from the use of Collectly Trademarks will inure to our exclusive benefit.

                                                Third-Party Material: Under no circumstances will Collectly be liable in any way for any content or materials of any third parties (including Users) or any User Content (including, but not limited to, for any errors or omissions in any User Content), or for any loss or damage of any kind incurred as a result of the use of any such User Content. You acknowledge that Collectly does not pre-screen User Content, but that Collectly and its designees will have the right (but not the obligation) in their sole discretion to refuse, remove, or allow any User Content that is available via the Services at any time and for any reason, with or without notice, and without any liability to you or to any third party for any claims, damages, costs or losses resulting therefrom.

                                                User Content Transmitted Through the Services: With respect to the User Content, you represent and warrant that you own all right, title and interest in and to, or otherwise have all necessary rights and consents to (and to allow others to) fully exploit, such User Content, including, without limitation, as it concerns all copyrights, trademark rights and rights of publicity or privacy related thereto. By uploading, sharing, providing, or otherwise making available any User Content, or any portion thereof, in connection with the Services, you hereby grant and will grant Collectly and its affiliated companies and Users a nonexclusive, worldwide, royalty free, fully paid up, transferable, sublicensable, perpetual, irrevocable license to copy, display, upload, perform, distribute, store, modify and otherwise use your User Content in connection with the operation of the Services or the promotion, advertising or marketing thereof, in any form, medium or technology now known or later developed. Without limiting the foregoing, if any User Content contains your name, image or likeness, you hereby release and hold harmless Collectly and its contractors and employees, from: (i) all claims for invasion of privacy, publicity or libel; (ii) any liability or other claims by virtue of any blurring, distortion, alteration, optical illusion, or other use or exploitation of your name, image or likeness; and (iii) any liability for claims made by you (or any successor to any claim you might bring) in connection with your User Content, name, image or likeness. You waive any right to inspect or approve any intermediary version(s) or finished version(s) of the results of the use of your User Content (including your name, image or likeness). Further, if any person (other than you) appears in your User Content, you represent and warrant that you have secured all necessary licenses, waivers and releases from such person(s) for the benefit of Collectly in a manner fully consistent with the licenses, waivers and releases set forth above. You further acknowledge that your participation in the Services and submission of User Content is voluntary and that you will not receive financial compensation of any type associated with the licenses, waivers, and releases set forth herein (or Collectly’s exploitation thereof), and that the sole consideration for subject matter of this agreement is the opportunity to use the Services.

                                                We do not guarantee that any Services Content will be made available through the Services. We reserve the right to, but do not have any obligation to: (a) remove, edit or modify any Services Content or User Content, in our sole discretion, at any time, without notice to you and for any reason (including, but not limited to, upon receipt of claims or allegations from third parties or authorities relating to such Services Content or User Content, or if we are concerned that you may have violated these Terms of Service), or for no reason at all; and (b) remove or block any Services Content or User Content from the Services.

                                                Payment Card Industry Data Security Standard: The Payment Card Industry Data Security Standard (PCI DSS) is a set of industry-mandated requirements for any business that handles, processes, or stores credit card information. The primary purpose of the standard is to maintain controls around cardholder data to reduce credit card fraud. Although card data is processed and stored by our Payment Processors, Collectly has achieved the highest level of PCI Compliance as PCI DSS Level 1 Compliance Service Provider. To learn more, see here.

                                                Copyright or Trademark Complaints: Collectly respects the intellectual property of others, and we ask our Users to do the same. If you believe that your work has been copied in a way that constitutes copyright infringement, or that your intellectual property rights have been otherwise violated, you should notify Collectly of your infringement claim in accordance with the procedure set forth below.

                                                Collectly will process and investigate notices of alleged infringement and will take appropriate actions under the Digital Millennium Copyright Act (“DMCA”), trademark infringement and other applicable intellectual property laws with respect to any alleged or actual infringement. A notification of claimed infringement should be emailed to Collectly’s Copyright Agent at GFMLegal@Collectly.com (Subject line: “DMCA Takedown Request”). You may also contact us by email at mail@collectly.com

                                                To be effective, the notification must be in writing and contain the following information:

                                                an electronic or physical signature of the person authorized to act on behalf of the owner of the copyright or other intellectual property interest; a description of the copyrighted work, trademark, or other intellectual property that you claim has been infringed; a description of where the material that you claim is infringing is located on the Services, with enough detail that we may find it on the Services; your address, telephone number, and email address; a statement by you that you have a good faith belief that the disputed use is not authorized by the copyright, trademark or intellectual property owner, its agent, or the law; and a statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright or intellectual property owner or authorized to act on the copyright or intellectual property owner’s behalf. Counter-Notice: If you believe that your User Content that was removed (or to which access was disabled) is not infringing, or that you have the authorization from the owner, the owner’s agent, or pursuant to the law, to upload and use the content in your User Content, you may send a written counter-notice containing the following information to the above-listed Copyright Agent:

                                                your physical or electronic signature; identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled; a statement that you have a good-faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content; and your name, address, telephone number, and email address, and a statement that you will accept service of process from the person who provided notification of the alleged infringement. If a counter-notice is received by the Copyright Agent, Collectly will send a copy of the counter-notice to the original complaining party, informing that person that Collectly may replace the removed content or cease disabling it in 10 business days. Unless the owner files an action seeking a court order against the content provider, member or User, the removed content may be replaced, or access to it restored, in 10 to 14 business days or more after receipt of the counter-notice, at our sole discretion.

                                                Repeat Infringer Policy: In accordance with the DMCA, trademark and other applicable law, Collectly has adopted a policy of terminating, in appropriate circumstances and at Collectly’s sole discretion, Users who are deemed to be repeat infringers. Collectly may also at its sole discretion limit access to or terminate the Services and/or terminate the memberships of any Users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.

                                                THIRD PARTY WEBSITES/SERVICES

                                                The Services or third parties may provide or facilitate links, tools, widgets or other features that allow you to access other sites, services and resources provided by third parties (collectively, “Third Party Resources”). Collectly has no control over such Third Party Resources or any products, services or content made available through or by such Third Party Resources, or the business practices of the third parties providing such Third Party Resources, and Collectly is not responsible for and does not endorse such Third Party Resources or the products, services or content made available thereby. You acknowledge that Collectly is not responsible or liable for the content, functions, accuracy, legality, appropriateness or any other aspect of such Third Party Resources. You further acknowledge and agree that Collectly will not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any content, events, goods or services available on or through any such Third Party Resources. Any dealings you have with third parties found while using the Services are between you and the third party and may be subject to additional terms provided by the third party, which you agree to by using such Third Party Resources. As an example of this, if you use the Platform through your mobile device, and you upload a video to a Pool, that video will be uploaded using YouTube, and subject to the YouTube Terms of Service. And you agree that Collectly is not liable for any loss or claim that you may have against any such third party.

                                                INDEMNITY AND RELEASE

                                                You agree to release, indemnify on demand and hold Collectly and its affiliates and their officers, employees, directors and agents harmless from any and all losses, damages, expenses, including reasonable attorneys’ fees, costs, awards, fines, damages, rights, claims, actions of any kind and injury (including death) arising out of or relating to your use of the Services, any Contribution or Pool, any User Content, your connection to the Services, your violation of these Terms of Service or your violation of any rights of another. You agree that Collectly has the right to conduct its own defense of any claims at its own discretion, and that you will indemnify Collectly for the costs of its defense (including, but not limited to attorney’s fees). If you are a California resident, you waive California Civil Code Section 1542, which says: “A general release does not extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release, and that if known by him or her would have materially affected his or her settlement with the debtor or released party.” If you are a resident of another jurisdiction—in or outside of the United States—you waive any comparable statute or doctrine.

                                                DISCLAIMER OF WARRANTIES

                                                YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK. THE SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. Collectly AND ITS AFFILIATES EXPRESSLY DISCLAIM AND EXCLUDE, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ALL WARRANTIES, CONDITIONS AND REPRESENTATIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT.

                                                COLLECTLY AND ITS AFFILIATES MAKE NO WARRANTY OR CONDITION THAT: (I) THE SERVICES WILL MEET YOUR REQUIREMENTS; (II) THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; (III) THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES WILL BE ACCURATE OR RELIABLE; OR (IV) THE QUALITY OF ANY PRODUCTS, SERVICES, INFORMATION, OR OTHER MATERIAL PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICES WILL MEET YOUR EXPECTATIONS.

                                                LIMITATION OF LIABILITY

                                                YOU EXPRESSLY UNDERSTAND AND AGREE THAT, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEITHER Collectly NOR ITS AFFILIATES WILL BE LIABLE FOR ANY: (I) INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE OR EXEMPLARY DAMAGES; (II) DAMAGES FOR LOSS OF PROFITS;, (III) DAMAGES FOR LOSS OF GOODWILL;, (IV) DAMAGES FOR LOSS OF USE; (V) LOSS OR CORRUPTION OF DATA; OR (VI) OTHER INTANGIBLE LOSSES (EVEN IF Collectly HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), WHETHER BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY OR OTHERWISE, RESULTING FROM: (A) THE USE OR THE INABILITY TO USE THE SERVICES; (B) THE COST OF PROCUREMENT OF SUBSTITUTE GOODS AND SERVICES RESULTING FROM ANY GOODS, DATA, INFORMATION OR SERVICES PURCHASED OR OBTAINED OR MESSAGES RECEIVED OR TRANSACTIONS ENTERED INTO THROUGH OR FROM THE SERVICES; (C) ANY PROMOTIONS AND RELATED PRIZES OR REWARDS MADE AVAILABLE THROUGH THE SERVICES; (D) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA; (E) STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SERVICES; OR (F) ANY OTHER MATTER RELATING TO THE SERVICES. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL COLLECTLY’S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES (INCLUDING CONTRACT, NEGLIGENCE, STATUTORY LIABILITY OR OTHERWISE) OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID COLLECTLY IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED U.S. DOLLARS (US$ 100).

                                                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE LIMITATIONS SET FORTH ABOVE MAY NOT APPLY TO YOU. IF YOU ARE DISSATISFIED WITH ANY PORTION OF THE SERVICES OR WITH THESE TERMS OF SERVICE, YOUR SOLE AND EXCLUSIVE REMEDY IS TO DISCONTINUE USE OF THE SERVICES.

                                                DISPUTES

                                                ARBITRATION CLAUSE & CLASS ACTION WAIVER – IMPORTANT – PLEASE REVIEW AS THIS AFFECTS YOUR LEGAL RIGHTS

                                                Arbitration; Class Action Waiver: YOU AGREE THAT ALL DISPUTES BETWEEN YOU AND US OR ANY OF OUR OFFICERS, DIRECTORS OR EMPLOYEES ACTING IN THEIR CAPACITY AS SUCH (WHETHER OR NOT SUCH DISPUTE INVOLVES A THIRD PARTY) WITH REGARD TO YOUR RELATIONSHIP WITH US, INCLUDING WITHOUT LIMITATION DISPUTES RELATED TO THESE TERMS OF SERVICE, YOUR USE OF THE SERVICES, AND/OR RIGHTS OF PRIVACY AND/OR PUBLICITY, WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU AND WE HEREBY EXPRESSLY WAIVE TRIAL BY JURY. DISCOVERY AND RIGHTS TO APPEAL IN ARBITRATION ARE GENERALLY MORE LIMITED THAN IN A LAWSUIT, AND OTHER RIGHTS THAT YOU AND WE WOULD HAVE IN COURT MAY NOT BE AVAILABLE IN ARBITRATION. YOU UNDERSTAND AND AGREE THAT, BY ENTERING INTO THESE TERMS, YOU AND WE ARE EACH WAIVING OUR RIGHT TO A TRIAL BY JURY OR TO PARTICIPATE IN A CLASS ACTION.

                                                Notwithstanding the foregoing, nothing in these Terms of Service will be deemed to waive, preclude, or otherwise limit the right of either of us to: (i) bring an individual action in small claims court; (ii) pursue an enforcement action through the applicable federal, state, or local agency if that action is available; (iii) seek injunctive relief in a court of law; or (iv file suit in a court of law to address an intellectual property infringement claim.

                                                The Process: Any arbitration between you and us will be settled under the Federal Arbitration Act and administered by the American Arbitration Association (“AAA”) under its Consumer Arbitration Rules (collectively, “AAA Rules”) as modified by these Terms of Service. The AAA Rules and filing forms are available online at www.adr.org.

                                                A party who intends to seek arbitration must first send a written notice of the dispute to the other party by certified U.S. Mail or by Federal Express (signature required) or, only if that other party has not provided a current physical address, then by electronic mail (“Notice of Arbitration”). Our current address for Notice is: Collectly, mail@collectly.com . The Notice of Arbitration must: (i) describe the nature and basis of the claim or dispute; and (ii) set forth the specific relief sought (“Demand”). We agree to work with you and make a good faith effort to resolve the claim directly, but if we are not successful within 60 days after the Notice of Arbitration is received, you or we may commence an arbitration proceeding. All arbitration proceedings between the parties will be confidential unless otherwise agreed by the parties in writing. During the arbitration, the amount of any settlement offer made by either of us must not be disclosed to the arbitrator until after the arbitrator makes a final decision and award, if any. If the arbitrator awards you an amount which exceeds the last written settlement amount offered by us in settlement of the dispute prior to the award, we will pay to you the higher of: (a) the amount awarded by the arbitrator; or (b) US$10,000.00.

                                                Fees: If you commence arbitration in accordance with these Terms of Service, we will reimburse you for your payment of the filing fee unless your claim is for more than US$10,000 in which case the payment of any fees will be decided by the AAA Rules. Any arbitration hearing will take place at an agreed upon location in San Francisco, California, but if the claim is for US$10,000 or less, you may choose whether the arbitration will be conducted: (i) solely on the basis of documents submitted to the arbitrator; (ii) through a telephone hearing; or (iii) by an in-person hearing as established by the AAA Rules in the county of your billing address. If the arbitration finds that either the substance of your claim or the relief sought in the Demand is frivolous or brought for an improper purpose (as measured by the standards set forth in the Federal Rule of Civil procedure 11(b)), then the payment of all fees will be governed by the AAA Rules. In that case, you agree to reimburse us for all monies previously disbursed by us that are otherwise your obligation to pay under the AAA Rules. Regardless of the manner in which the arbitration is conducted, the arbitrator must issue a reasoned written decision sufficient to explain the essential findings and conclusions on which the decision and award, if any, are based. The arbitrator may make rulings and resolve disputes as to the payment and reimbursement of fees or expenses at any time during the proceeding and upon request from either party made within 14 days of the arbitrator’s ruling on the merits.

                                                No Class Actions: YOU AND WE AGREE THAT EACH MAY BRING CLAIMS TO THE FULLEST EXTENT LEGALLY PERMISSIBLE AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. Further, unless both you and we agree otherwise, the arbitrator may not consolidate more than one person’s claims and may not otherwise preside over any form of a representative or class proceeding.

                                                Modifications to this Arbitration Provision: If we make any future change to this arbitration provision, other than a change to our address for Notice of Arbitration, you may reject the change by sending us written notice within 30 days of the change to our address for Notice of Arbitration, in which case your account with us will be immediately terminated and this arbitration provision, as in effect immediately prior to the changes you rejected will survive.

                                                Enforceability: If this Disputes section is found to be unenforceable, then the entirety of this Disputes section will be null and void and, in that case, the parties agree that the exclusive jurisdiction and venue described in the General section below will govern any action arising out of or related to these Terms of Service.

                                                Confidentiality: We each agree to keep the arbitration proceedings, all information exchanged between us, and any settlement offers confidential, unless otherwise required by law or requested by law enforcement or any court or governmental body. However, we may each disclose these matters, in confidence, to our respective accountants, auditors, and insurance providers.

                                                TERMINATION You agree that Collectly, in its sole discretion, may suspend or terminate your account (or any part thereof) or your access to the Services and remove and discard any User Content or data at any time and for any reason, with or without notice, and without any liability to you or to any third party for any claims, damages, costs or losses resulting therefrom.

                                                USER DISPUTES You agree that you are solely responsible for your interactions with any other User in connection with the Services and Collectly will have no liability or responsibility with respect thereto. Collectly reserves the right, but has no obligation, to become involved in any way with disputes between you and any other User of the Services.

                                                GENERAL These Terms of Service constitute the entire agreement between you and Collectly and govern your use of the Services, superseding any prior agreements between you and Collectly with respect to the Services. You also may be subject to additional terms of service that may apply when you use affiliate or third-party services, third-party content or third-party software. These Terms of Service will be governed by the laws of the State of California without regard to its conflict of law provisions. With respect to any disputes or claims not subject to arbitration, as set forth above, you and Collectly agree to submit to the personal and exclusive jurisdiction of the state and federal courts located within San Mateo County, California. The failure of Collectly to exercise or enforce any right or provision of these Terms of Service will not constitute a waiver of such right or provision. If any provision of these Terms of Service is found by a court of competent jurisdiction to be (or are otherwise) invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties’ intentions as reflected in the provision, and the other provisions of these Terms of Service remain in full force and effect. You agree that regardless of any statute or law to the contrary, any claim or cause of action arising out of or related to use of the Services or these Terms of Service must be filed within one (1) year after such claim or cause of action arose or be forever barred. A printed version of this agreement and of any notice given in electronic form will be admissible in judicial or administrative proceedings based upon or relating to this agreement to the same extent and subject to the same conditions as other business documents and records originally generated and maintained in printed form. You may not assign these Terms of Service without the prior written consent of Collectly, but Collectly may assign or transfer these Terms of Service, in whole or in part, without restriction. If we fail to enforce any of our rights, that does not result in a waiver of that right. The section titles in these Terms of Service are for convenience only and have no legal or contractual effect. Notices to you may be made via email or regular mail. The Services may also provide notices to you of changes to these Terms of Service or other matters by displaying notices or links to notices generally on the Platform. Collectly may, at any time, assign our rights or delegate our obligations hereunder without notice to you in connection with a merger, acquisition, reorganization or sale of equity or assets, or by operation of law or otherwise. Nothing in these Terms of Service shall prevent Collectly from complying with the law. Collectly shall not be liable for any delay or failure to perform resulting from causes outside its reasonable control, including, but not limited to, acts of God, war or threats of war, terrorism or threats of terrorism, riots, embargos, acts of civil or military authorities, fire, floods, accidents, governmental regulation or advisory, recognized health threats,as determined by the World Health Organization, the Centers for Disease Control, or local government authority or health agencies, strikes or shortages or curtailment of transportation facilities, fuel, energy, labor or materials.

                                                PRIVACY NOTICE At Collectly, we respect the privacy of our Users. For details please see our Privacy Notice. By using the Services, you consent to our collection and use of personal data as outlined therein. If you are in Europe, by using the Services, you acknowledge Collectly’s collection and use of personal information as described in the Privacy Notice.

                                                QUESTIONS? CONCERNS? SUGGESTIONS?

                                                Please visit the Help Center to learn more about Collectly’s platform or contact us to report violations or pose any question.
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'faq' && (
                                        <div className="tab-content">
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="faq-section">
                                                        <div className="row">
                                                            <div className="col-lg-4">
                                                                <div className="faq-sidebar">
                                                                    <div className="faq-categories">
                                                                        <h4 className="category-title">FAQ Categories</h4>
                                                                        <ul className="category-list">
                                                                            <li
                                                                                className={`category-item ${activeCategory === 'general' ? 'active' : ''}`}
                                                                                onClick={() => setActiveCategory('general')}
                                                                            >
                                                                                <i className="fa fa-question-circle"></i>
                                                                                <span>General Questions</span>
                                                                            </li>
                                                                            <li
                                                                                className={`category-item ${activeCategory === 'events' ? 'active' : ''}`}
                                                                                onClick={() => setActiveCategory('events')}
                                                                            >
                                                                                <i className="fa fa-calendar"></i>
                                                                                <span>Events & Pools</span>
                                                                            </li>
                                                                            <li
                                                                                className={`category-item ${activeCategory === 'security' ? 'active' : ''}`}
                                                                                onClick={() => setActiveCategory('security')}
                                                                            >
                                                                                <i className="fa fa-shield"></i>
                                                                                <span>Security & Safety</span>
                                                                            </li>
                                                                        </ul>
                                                                    </div>

                                                                    <div className="support-cta">
                                                                        <div className="support-info">
                                                                            <i className="fa fa-headphones"></i>
                                                                            <h5>Need More Help?</h5>
                                                                            <p>Our support team is available to assist you with any questions.</p>
                                                                            <button
                                                                                className="btn btn-primary"
                                                                                onClick={() => setActiveTab('email')}
                                                                            >
                                                                                Contact Support
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-8">
                                                                <div className="faq-content">
                                                                    <div className="faq-header">
                                                                        <h3>Frequently Asked Questions</h3>
                                                                        <p>Find quick answers to common questions about Collectly</p>
                                                                    </div>

                                                                    <div className="accordion faq-accordion" id="faqAccordion">

                                                                        {(activeCategory === 'general' || !activeCategory) && (
                                                                            <>
                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqGeneral1"
                                                                                        >
                                                                                            <i className="fa fa-question-circle"></i>
                                                                                            What is Collectly and how does it work?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqGeneral1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            Collectly is a collaborative financial platform that simplifies group financial contributions. Whether you're fundraising for a cause, planning an event, or managing expenses for a team, Collectly makes it easy to collect and manage funds securely and transparently. You can create Pools for various purposes and invite participants to contribute.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqGeneral2"
                                                                                        >
                                                                                            <i className="fa fa-shield"></i>
                                                                                            Is Collectly safe and secure?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqGeneral2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            Yes, Collectly takes security seriously. We use industry-standard encryption to protect your data and transactions. Additionally, we partner with reputable payment processors like PayPal to ensure the security of financial transactions. Your information and funds are protected with the highest security measures.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqGeneral3"
                                                                                        >
                                                                                            <i className="fa fa-users"></i>
                                                                                            Can I use Collectly for personal expenses?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqGeneral3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            While Collectly is designed for group financial collaboration, you can certainly use it to manage personal expenses, especially if you want to involve friends and family in budgeting or savings goals. Many users create Pools for personal projects, travel funds, or shared household expenses.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        )}


                                                                        {activeCategory === 'events' && (
                                                                            <>
                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqEvents1"
                                                                                        >
                                                                                            <i className="fa fa-calendar"></i>
                                                                                            What are "Events" in Collectly?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqEvents1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            Events in Collectly refer to the ability to create and manage multiple Pools for different purposes within a single event. For example, if you're planning a school fundraiser, you can create separate Pools for donations, ticket sales, and merchandise sales, all under one event.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqEvents2"
                                                                                        >
                                                                                            <i className="fa fa-money"></i>
                                                                                            How do I create an Event with multiple Pools?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqEvents2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            Creating an Event is simple. After logging in, click on "Create Event" and follow the prompts. You can specify the Event's name, description, and the types of Pools you want to include. Once the Event is set up, you can start inviting participants and managing the individual Pools within it.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqEvents3"
                                                                                        >
                                                                                            <i className="fa fa-user-plus"></i>
                                                                                            Can I invite different people to each Pool within an Event?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqEvents3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            Yes, you have the flexibility to invite different participants to each Pool within an Event. This feature is especially useful for events with various fundraising objectives or when different people are responsible for different aspects of the event.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        )}


                                                                        {activeCategory === 'security' && (
                                                                            <>
                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqSecurity1"
                                                                                        >
                                                                                            <i className="fa fa-lock"></i>
                                                                                            How does fund distribution work within an Event?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqSecurity1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            Funds collected within each Pool are kept separate. You can manage and distribute funds individually for each Pool within the Event. This allows for transparent tracking and allocation of contributions based on their intended purpose.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="accordion-item">
                                                                                    <h2 className="accordion-header">
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target="#faqSecurity2"
                                                                                        >
                                                                                            <i className="fa fa-credit-card"></i>
                                                                                            Are there any additional fees for using Events?
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div id="faqSecurity2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                                                        <div className="accordion-body">
                                                                                            No, there are no extra fees associated with creating Events or using the multiple Pool feature. Collectly's standard transaction fees apply, and these are typically associated with payment processing, which is managed by our trusted partners.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        )}

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <style jsx>{`
            .faq-section {
                padding: 20px 0;
            }
            
            .faq-sidebar {
                position: sticky;
                top: 20px;
            }
            
            .faq-categories {
                background: #fff;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 24px;
            }
            
            .category-title {
                font-family: 'Urbanist', sans-serif;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 20px;
                font-size: 18px;
            }
            
            .category-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .category-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                margin-bottom: 8px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #64748b;
                font-weight: 500;
            }
            
            .category-item:hover {
                background: #f8fafc;
                color: #3b82f6;
            }
            
            .category-item.active {
                background: #3b82f6;
                color: white;
            }
            
            .category-item i {
                margin-right: 12px;
                width: 20px;
                text-align: center;
            }
            
            .support-cta {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 24px;
                color: white;
                text-align: center;
            }
            
            .support-info i {
                font-size: 32px;
                margin-bottom: 16px;
            }
            
            .support-info h5 {
                font-family: 'Urbanist', sans-serif;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .support-info p {
                opacity: 0.9;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .faq-content {
                background: #fff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .faq-header {
                margin-bottom: 32px;
                text-align: center;
            }
            
            .faq-header h3 {
                font-family: 'Urbanist', sans-serif;
                font-weight: 700;
                color: #2d3748;
                margin-bottom: 8px;
            }
            
            .faq-header p {
                color: #64748b;
                font-size: 16px;
            }
            
            .faq-accordion .accordion-item {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                margin-bottom: 12px;
                overflow: hidden;
            }
            
            .faq-accordion .accordion-button {
                background: #fff;
                border: none;
                padding: 20px 24px;
                font-family: 'Urbanist', sans-serif;
                font-weight: 600;
                color: #2d3748;
                font-size: 16px;
            }
            
            .faq-accordion .accordion-button:not(.collapsed) {
                background: #f8fafc;
                color: #3b82f6;
                box-shadow: none;
            }
            
            .faq-accordion .accordion-button i {
                margin-right: 12px;
                color: #3b82f6;
            }
            
            .faq-accordion .accordion-button:not(.collapsed) i {
                color: #3b82f6;
            }
            
            .faq-accordion .accordion-body {
                padding: 20px 24px;
                background: #f8fafc;
                color: #64748b;
                line-height: 1.6;
                font-size: 15px;
            }
            
            @media (max-width: 991px) {
                .faq-sidebar {
                    position: static;
                    margin-bottom: 30px;
                }
                
                .faq-content {
                    padding: 24px;
                }
                
                .faq-accordion .accordion-button {
                    padding: 16px 20px;
                    font-size: 15px;
                }
                
                .faq-accordion .accordion-body {
                    padding: 16px 20px;
                }
            }
                                                         `}</style>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                .support-page {
                    background: linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%);
                    min-height: 100vh;
                }
                
                .support-tabs .nav-link {
                    color: #64748b;
                    padding: 1rem;
                    border: none;
                    border-radius: 0;
                    transition: all 0.2s;
                }
                
                .support-tabs .nav-link.active {
                    color: #FFC371;
                    background: transparent;
                    border-bottom: 3px solid #FFC371;
                }
                
                .support-tabs .nav-link:hover {
                    color: #FFC371;
                    background: rgba(255, 195, 113, 0.1);
                }
                
                .card {
                    border-radius: 1rem;
                }
                
                .accordion-button:not(.collapsed) {
                    background-color: rgba(255, 195, 113, 0.1);
                    color: #C5914B;
                }
                
                .list-group-item {
                    border: none;
                    border-radius: 0.5rem !important;
                    margin-bottom: 0.5rem;
                }
                
                .list-group-item.active {
                    background-color: #FFC371;
                    border-color: #FFC371;
                }

                @media (max-width: 768px) {
                    .border-start-md {
                        border-left: none !important;
                        padding-left: 0 !important;
                    }
                }
            `}</style>
            </div>
            <Footer />
        </>
    );
};

export default Support;