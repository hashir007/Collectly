import classes from './footer.module.css';
import React from 'react';
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";


const Footer = () => {

    return (
        <footer className="container-xl text-center py-5 text-sm text-slate-500 border-top shadow-soft">
            <div className="d-flex flex-column gap-3">
                {/* Links row with responsive divider */}
                <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 gap-md-3">
                    <Link to="/support?tab=terms" className="text-slate-500 text-decoration-none hover:text-slate-700">
                        Terms & Conditions
                    </Link>
                    <span className="bull-sm d-none d-md-inline">•</span>
                    <Link to="/support?tab=privacy" className="text-slate-500 text-decoration-none hover:text-slate-700">
                        Privacy Policy
                    </Link>
                    <span className="bull-sm d-none d-md-inline">•</span>
                    <Link to="/support?tab=program" className="text-slate-500 text-decoration-none hover:text-slate-700">
                        Secure Contribution Program
                    </Link>
                    <span className="bull-sm d-none d-md-inline">•</span>
                    <Link to="/support?tab=faq" className="text-slate-500 text-decoration-none hover:text-slate-700">
                        FAQ
                    </Link>
                    <span className="bull-sm d-none d-md-inline">•</span>
                    <Link to="/support?tab=email" className="text-slate-500 text-decoration-none hover:text-slate-700">
                        Contact Us
                    </Link>
                </div>

                {/* Copyright and additional info */}
                <div className="d-flex flex-column gap-1">
                    <span>
                        Built with ♥ by <span className="fw-semibold">Collectly</span>
                    </span>
                    <span className="copyright">
                        Copyright © {new Date().getFullYear()} Collectly, LLC
                    </span>
                    <span className="text-xs">
                        For entertainment/marketing purposes only.
                    </span>
                </div>

                {/* Hidden debug output */}
                <div id="debugOutput" className="d-none"></div>
            </div>
        </footer>
    );
};

export default Footer;