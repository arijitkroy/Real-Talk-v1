import React, { useState } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/VerifyEmail.css";
import { app } from "../Firebase";
import { bake_cookie } from "sfcookies";

const VerifyEmail = () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResend = async () => {
        if (user && !user.emailVerified) {
            await sendEmailVerification(user);
            setSent(true);
            toast.success("Verification email sent!");
        }
    };

    const handleContinue = async () => {
        setChecking(true);
        await user.reload();
        if (user.emailVerified) {
            toast.success("Email verified! Redirecting...");
            bake_cookie('user', user.uid);
            navigate("/");
        } else {
            toast.error("Email is still not verified. Please check again.");
        }
        setChecking(false);
    };

    return (
        <div className="verify-email-container">
            <div className="verify-card">
                <h2>Verify Your Email</h2>
                <p>
                    We sent you a verification link. Please check your inbox.
                    <br />
                    Didn't receive it? Resend below.
                </p>
                <button className="resend-btn" onClick={handleResend} disabled={sent}>
                    {sent ? "Email Sent!" : "Resend Email"}
                </button>
                <button className="resend-btn" onClick={handleContinue} disabled={checking}>
                    {checking ? "Checking..." : "I've Verified My Email"}
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;