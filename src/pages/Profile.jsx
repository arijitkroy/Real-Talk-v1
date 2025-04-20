import React, { useEffect, useState } from "react";
import "./css/Profile.css";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { read_cookie } from "sfcookies";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [userName, setUserName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();
    const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    useEffect(() => {
        const fetchUser = async () => {
            const uid = read_cookie('user') || null;
    
            if (uid.length !== 0) {
                try {
                    const docRef = doc(db, 'userDetails', uid);
                    const docSnap = await getDoc(docRef);
    
                    if (docSnap.exists()) {
                        setUserName(docSnap.data().username);
                        setAvatar(docSnap.data().avatar || "default-avatar.png");
                    } else {
                        toast.error("User not found in database!", {
                            position: 'bottom-left',
                            autoClose: 3000
                        });
                        navigate('/signin');
                    }
                } catch (err) {
                    toast.error("User is not logged in!", {
                        position: 'bottom-left',
                        autoClose: 3000
                    });
                    navigate('/signin');
                }
            } else {
                toast.error("User is not logged in!", {
                    position: 'bottom-left',
                    autoClose: 3000
                });
                navigate('/signin');
            }
        };
        fetchUser();
    }, [navigate])

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const uid = read_cookie('user');

        try {
            setIsUploading(true);
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl);

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');

                const formData = new FormData();
                formData.append("key", imgbbApiKey);
                formData.append("image", base64Image);

                const res = await fetch("https://api.imgbb.com/1/upload", {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                setIsUploading(false);

                if (data.success) {
                    const avatarUrl = data.data.url;
                    setAvatar(avatarUrl);
                    const userDoc = doc(db, 'userDetails', uid);
                    await updateDoc(userDoc, {
                        avatar: avatarUrl
                    });
                    toast.success("Avatar updated!");
                } else {
                    throw new Error("ImgBB upload failed");
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setIsUploading(false);
            console.error("Upload error:", err);
            toast.error("Failed to upload avatar.");
        }
    };

    return (
        <>
            <div className="container">
                <div className="profile-box">
                    <div className="avatar">
                        <div className="avatar-container">
                            {isUploading && <div className="avatar-spinner"></div>}
                            <img src={avatar} alt="User Avatar" className="profile-avatar" />
                            <label htmlFor="avatarUpload" className="change-avatar-btn">✎</label>
                            <input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }}/>
                        </div>
                        <h1>{userName}</h1>
                    </div>
                    <div className="content"></div>
                </div>
            </div>
        </>
    )
}

export default Profile;