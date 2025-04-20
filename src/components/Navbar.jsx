import React, { useEffect, useRef, useState } from "react";
import "./css/Navbar.css";
import { delete_cookie, read_cookie } from "sfcookies";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { app, db } from "../Firebase";
import { getAuth, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
    const [userName, setUserName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const uid = read_cookie('user') || null;
    const docRef = collection(db, 'userDetails');
    const location = useLocation();
    const dropdownRef = useRef(null);

    const GetUser = async () => {
        const docSnap = await getDoc(doc(docRef, uid));
        if (docSnap.exists()) {
            setUserName(docSnap.data().username);
            setAvatar(docSnap.data().avatar);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    useEffect(() => {
        if (uid.length != 0) GetUser();
    }, [location.pathname]);

    const HandleSignOut = async (e) => {
        e.preventDefault();
        const auth = getAuth(app);
        await signOut(auth).then(async () => {
            await updateDoc(doc(docRef, read_cookie('user')), {
                signedIn: 0
            });
            delete_cookie('user');
            toast.success(`${userName} logged out!`, {
                position: 'bottom-left',
                autoClose: 3000,
            });
            setUserName("");
            navigate('/signin');
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <>
            <div className="nav">
                <div className="nav-logo"><a href="#"><img src="logo.jpg" alt="Logo" /></a></div>
                <div className="nav-items">
                    <div className="item"><a href="#">Browse Users</a></div>
                    <div className="item"><a href="#">Browse Rooms</a></div>
                </div>
                {userName ?
                    <div className="nav-user-profile" ref={dropdownRef}>
                        <div className="user" onClick={() => setShowDropdown(prev => !prev)}>{userName}</div>
                        <img
                            src={avatar || "/default-avatar.png"}
                            alt="avatar"
                            className="navbar-avatar"
                            onClick={() => setShowDropdown(prev => !prev)}
                        />
                        {showDropdown && (
                            <div className="dropdown">
                                <a href="#profile">Profile</a>
                                <button onClick={HandleSignOut} style={{ borderRadius: '0' }}>Sign Out</button>
                            </div>
                        )}
                </div> :
                <div className="nav-user-profile">
                     <button onClick={e => window.location.href="#signin"}>SignIn</button>
                </div>
                }
            </div>
        </>
    )
}

export default Navbar;