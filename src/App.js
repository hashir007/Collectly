import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import "./App.css";
import secureLocalStorage from "react-secure-storage";
import { io } from 'socket.io-client';
import EventBus from "./app/common/eventBus";
import { Hourglass } from 'react-loader-spinner';
import toast, { Toaster } from 'react-hot-toast';
import LoadingBar from 'react-top-loading-bar'
import { getPoolDefaultSettings } from "./app/slices/pool";
import { clearMessage } from "./app/slices/message";


import FrontendLayout from './app/layouts/frontend/frontend';

import Login from "./app/pages/login/Login";
import Register from "./app/pages/register/Register";
import Dashboard from "./app/pages/dashboard/dashboard";
import Account from "./app/pages/account/account";
import PoolDetails from './app/pages/poolDetails/poolDetails';
import Notifications from './app/pages/notifications/notifications';
import Support from './app/pages/support/support';
import Pools from "./app/pages/pools/pools";
import PoolJoin from "./app/pages/poolJoin/poolJoin";
import PoolEdit from "./app/pages/poolEdit/poolEdit";
import PoolCreate from "./app/pages/poolCreate/poolCreate";
import PageNotFound from "./app/pages/pageNotFound/pageNotFound";
import ForgotPassword from "./app/pages/ForgotPassword/forgotPassword";
import ResetPassword from "./app/pages/resetPassword/resetPassword";
import Payouts from "./app/pages/payouts/payouts";
import PoolMember from "./app/pages/poolMember/poolMember";
import EmailVerification from "./app/pages/emailVerification/emailVerification";


const App = () => {
    const socketRef = useRef();
    const dispatch = useDispatch();
    const { progress } = useSelector((state) => state.loader);
    const { message, type } = useSelector((state) => state.message);
    const { user: currentUser, isLoggedIn } = useSelector((state) => state.auth);


    useEffect(() => {
        if (isLoggedIn) {
            Promise.all([
                dispatch(getPoolDefaultSettings({}))
            ])
        }
    }, [isLoggedIn]);


    useEffect(() => {

        if (message) {
            switch (type) {
                case 'error': toast.error(message);
                    break;
                case 'success': toast.success(message);
                    break;
            }
        }

        return () => {
            dispatch(clearMessage({}))
        }
    }, [message, type])



    useEffect(() => {

        if (message) {
            createNotification(type, message);
        }

    }, [message, type]);


    function createNotification(type, message) {
        switch (type) {
            case 'info':
                NotificationManager.info(message);
                break;
            case 'success':
                NotificationManager.success(message);
                break;
            case 'warning':
                NotificationManager.warning(message);
                break;
            case 'error':
                NotificationManager.error(message);
                break;
        }
    }



    return (
        <>
            <LoadingBar
                color='#C5914B'
                progress={progress}
            />
            <NotificationContainer />
            <Router>
                <Routes>
                    <Route element={<FrontendLayout />}>
                        <Route path="/" element={<Pools />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/pools" element={<Pools />} />
                        <Route path="/pool-details" element={<PoolDetails />} />
                        <Route path="/pool-join" element={<PoolJoin />} />
                        <Route path="/pool-edit" element={<PoolEdit />} />
                        <Route path="/pool-create" element={<PoolCreate />} />
                        <Route path="/pool-payouts" element={<Payouts />} />
                        <Route path="/pool-member" element={<PoolMember />} />
                        <Route path="/email-verification" element={<EmailVerification />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Route>
                </Routes>
            </Router>
        </>
    );
};

export default App;