import React, { useState } from "react";
import { getAuth, validatePassword } from "firebase/auth";
import "./css/UserAuth.css";
import { app, db } from "../Firebase";
import SignUp from "../auth/SignUp";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { read_cookie } from "sfcookies";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserAuthSignUp = () => {
    const [userData, setUserData] = useState({});
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const docRef = collection(db, "userDetails");

    const HandleChange = (e) => {
        setError("");
        let name = e.target.name;
        let value = e.target.value;
        setUserData(val => ({...val, [name]: value}));
    }

    const HandleSubmit = async (e) => {
        e.preventDefault();
        console.log(userData);
        if (userData && (userData.username && userData.email && userData.passwd && userData.passwd == userData.repasswd)) {
            const status = await validatePassword(getAuth(app), userData.passwd);
            console.log(status);
            if (status.isValid) {
                await SignUp(userData.email, userData.passwd);
                await setDoc(doc(docRef, `/${read_cookie('user')}`), userData);
                const docSnap = await getDoc(doc(docRef, `/${read_cookie('user')}`));
                if (docSnap.exists()) navigate('/');
                toast.success(`${docSnap.data().username} registered successfully!`, {
                    position: 'bottom-left',
                    autoClose: 3000,
                });
            }
            else setError("The password must be 6 characters long!");
        }
        else if (userData.passwd != userData.repasswd) setError("Passwords doesn't match!");
        else setError("One or more field(s) is/are empty!");
    }

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