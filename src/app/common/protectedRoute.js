import React from 'react';
import { Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles, }) => {
    const location = useLocation();
    const { isLoggedIn, user: currentUser } = useSelector((state) => state.auth);

    const formatReturnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    const returnUrl = `?returnUrl=${formatReturnUrl}`;

    if (!isLoggedIn) {
        return <Navigate to={`/login${returnUrl}`} />;
    }  

    return children;
};

export default ProtectedRoute;