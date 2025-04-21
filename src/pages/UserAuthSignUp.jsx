import React, { useState } from "react";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, validatePassword } from "firebase/auth";
import { app, db } from "../Firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { bake_cookie } from "sfcookies";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/UserAuth.css";

const UserAuthSignUp = () => {
    const [userData, setUserData] = useState({});
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const HandleChange = (e) => {
        setError("");
        let name = e.target.name;
        let value = e.target.value;
        setUserData(val => ({...val, [name]: value}));
    }

    const HandleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        const { username, email, passwd, repasswd } = userData;
        const auth = getAuth(app);
        const passRules = validatePassword(auth, passwd);
    
        if (!username || !email || !passwd || !repasswd) {
            setError("All fields are required!");
            return;
        }
    
        if (passwd !== repasswd) {
            setError("Passwords do not match!");
            return;
        }
    
        if (passwd.length < 6) {
            setError("Password must be at least 6 characters long!");
            return;
        }

        if (!(await passRules).containsLowercaseLetter) {
            setError("Password must contain a lowercase letter!");
            return;
        }

        if (!(await passRules).containsUppercaseLetter) {
            setError("Password must contain an uppercase letter!");
            return;
        }

        if (!(await passRules).containsNumericCharacter) {
            setError("Password must contain a numeric digit!");
            return;
        }

        if (!(await passRules).containsNonAlphanumericCharacter) {
            setError("Password must contain a special symbol!");
            return;
        }
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, passwd);
            const user = userCredential.user;
    
            await sendEmailVerification(user);
    
            const userInfo = {
                uid: user.uid,
                username,
                password: passwd,
                email,
                createdAt: new Date().toISOString(),
            };
    
            await setDoc(doc(collection(db, "userDetails"), user.uid), userInfo);
    
            toast.success("Account created! Please verify your email before logging in.", {
                position: 'bottom-left',
                autoClose: 4000,
            });
    
            navigate("/verify-email");
    
        } catch (error) {
            console.error(error);
            if (error.code === "auth/email-already-in-use") {
                setError("Email already in use.");
            } else {
                setError("Sign up failed. Please try again.");
            }
        }
    };
    

    return (
        <>
            <div className="container">
                <form className="form-signup">
                    <h1>Sign Up</h1>
                    <div className="input-group">
                        <div className="input-item">
                            <label>Username</label>
                            <input type="text" name="username" onChange={HandleChange}/>
                        </div>
                        <div className="input-item">
                            <label>Email</label>
                            <input type="email" name="email" onChange={HandleChange}/>
                        </div>
                        <div className="input-item">
                            <label>Password</label>
                            <input type="password" name="passwd" onChange={HandleChange}/>
                        </div>
                        <div className="input-item">
                            <label>Re-type password</label>
                            <input type="password" name="repasswd" onChange={HandleChange}/>
                        </div>
                    </div>
                    <div className="error" style={!error ? {display: 'none'} : {}}>
                        {error}
                    </div>
                    <div className="btn">
                        <button onClick={HandleSubmit}>Sign-Up</button>
                    </div>
                    <div className="redirection">
                        Already have an account? <a href="#signin">Sign-In</a>
                    </div>
                </form>
            </div>
        </>
    )
}

export default UserAuthSignUp;