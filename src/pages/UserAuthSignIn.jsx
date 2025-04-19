import React, { useState } from "react";
import "./css/UserAuth.css";
import { Link, useNavigate } from "react-router-dom";
import SignIn from "../auth/SignIn";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { read_cookie } from "sfcookies";
import { toast } from "react-toastify";

const UserAuthSignIn = () => {
    const [userData, setUserData] = useState({});
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const docRef = collection(db, 'userDetails');

    const HandleChange = async (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setUserData(val => ({...val, [name]: value}));
    }

    const HandleSubmit = async (e) => {
        e.preventDefault();

        if (userData && (userData.email && userData.passwd)) {
            await SignIn(userData.email, userData.passwd);
            await updateDoc(doc(docRef, `/${read_cookie('user')}`), {
                "signedIn": 1
            });
            const docSnap = await getDoc(doc(docRef, `/${read_cookie('user')}`));
            if (docSnap.exists()) navigate('/');
            toast.success(`${docSnap.data().username} signed in!`, {
                position: 'bottom-left',
                autoClose: 3000,
            });
        }
        else setError("One or more field(s) is/are empty!");
    }

    return (
        <>
            <div className="container">
                <form className="form-signup">
                    <h1>Sign In</h1>
                    <div className="input-group">
                        <div className="input-item">
                            <label>Email</label>
                            <input type="email" name="email" onChange={HandleChange}/>
                        </div>
                        <div className="input-item">
                            <label>Password</label>
                            <input type="password" name="passwd" onChange={HandleChange}/>
                        </div>
                    </div>
                    <div className="error" style={!error ? {display: 'none'} : {}}>
                        {error}
                    </div>
                    <div className="btn">
                        <button onClick={HandleSubmit}>Sign-In</button>
                    </div>
                    <div className="redirection">
                        Don't have an account? <Link to="/signup">Sign-Up</Link>
                    </div>
                </form>
            </div>
        </>
    )
}

export default UserAuthSignIn;