import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { bake_cookie } from "sfcookies";
import { app } from "../Firebase";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, requireEmailVerified = true }) => {
    const { user, loading } = useAuth(app);

    const style = {
        backgroundColor: 'black',
        height: '100vh',
        color: 'white',
        fontSize: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    if (loading) return <div style={style}>Loading...</div>;

    if (!user) return <Navigate to="/signin" replace />;
    if (requireEmailVerified && !user.emailVerified) {
        toast.warn("Email is not verified!", {
            position: "top-right",
            autoClose: 4000,
        });
        <Navigate to="/verify-email" replace />
    }

    return children;
};

export default ProtectedRoute;
