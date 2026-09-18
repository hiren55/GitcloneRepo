import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/constants";
import Loader from "./Loader";

const RoleRoute = ({ allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loader message="Verifying permissions..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
        // Redirect customer to /customer and owner to /owner if they try accessing the wrong portal
        if (user?.role === ROLES.CUSTOMER) {
            return <Navigate to="/customer" replace />;
        }
        if (user?.role === ROLES.RESTAURANT_OWNER) {
            return <Navigate to="/owner" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
