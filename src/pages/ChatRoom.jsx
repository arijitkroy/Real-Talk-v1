import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { read_cookie } from 'sfcookies';
import "./css/ChatRoom.css";
import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../Firebase';
import { toast } from 'react-toastify';

const ChatRoom = (props) => {
    const [msg, setMsg] = useState("");
    const [boxContent, setboxContent] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [uid, setUid] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = read_cookie('user');
        const roomCookie = read_cookie('room');
    
        if (!userCookie || userCookie.length === 0) {
            toast.error('User is not logged in!', {
                position: 'bottom-left',
                autoClose: 3000
            });
            navigate('/signin');
            return;
        }
    
        setUid(userCookie);
    
        const unsub = onSnapshot(doc(db, 'messageRooms', roomCookie), docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const messages = Array.isArray(data.messages) ? data.messages : [];
                setboxContent(messages);
                const uids = [...new Set(messages.map(m => m.uid))];
                uids.forEach(async (id) => {
                    if (!userMap[id]) {
                        const userDoc = await getDoc(doc(db, 'userDetails', id));
                        if (userDoc.exists()) {
                            setUserMap(prev => ({ ...prev, [id]: userDoc.data().username }));
                        }
                    }
                });
            }
        });
    
        return () => unsub();
    }, []);

    const HandleSubmit = async (e) => {
        e.preventDefault();
        if (msg.trim().length === 0) {
            toast.error('Cannot send empty message!', {
                position: 'bottom-left',
                autoClose: 3000
            });
            return;
        }
    
        const roomId = read_cookie('room');
        const roomRef = doc(db, 'messageRooms', roomId);
    
        try {
            const docSnap = await getDoc(roomRef);
            const oldMessages = docSnap.exists() ? docSnap.data().messages || [] : [];
    
            const newMessage = {
                uid: uid,
                text: msg
            };
    
            await updateDoc(roomRef, {
                messages: [...oldMessages, newMessage],
                timestamp: serverTimestamp()
            });
    
            setMsg("");
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Failed to send message.");
        }
    };

    return (
        <>
            <div className='container'>
                <h2>Room code: {read_cookie('room')}</h2>
                <div className='chat-box'>
                    <div className='message-box'>
                        {
                            Array.isArray(boxContent) && boxContent.map((msgObj, i) => {
                                if (msgObj.type === "system") {
                                    return (
                                        <div key={i} className='user-join'>{msgObj.content}</div>
                                    )
                                }
                                return (
                                <div key={i} className={msgObj.uid === uid ? 'msg-sender' : 'msg-receiver'}>
                                    <strong>{msgObj.uid === uid ? 'You' : userMap[msgObj.uid] || '...'}</strong>: {msgObj.text}
                                </div>)
                            })
                        }
                    </div>
                    <div className='input-box'>
                        <input type='text' name='msg-user' value={msg} onChange={e => setMsg(e.target.value)}/>
                        <button onClick={HandleSubmit}>Send</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatRoom;