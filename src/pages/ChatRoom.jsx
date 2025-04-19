import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { delete_cookie, read_cookie } from 'sfcookies';
import { deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { toast } from 'react-toastify';
import "./css/ChatRoom.css";

const ChatRoom = (props) => {
    const [msg, setMsg] = useState("");
    const [boxContent, setboxContent] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [uid, setUid] = useState("");
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    useEffect(() => {
        scrollToBottom();
    }, [msg])

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

    const HandleEnterKey = (e) => {
        if (e.key == 'Enter') {
            HandleSubmit(e);
        }
    }

    const handleLeaveRoom = async () => {
        const roomId = read_cookie('room');
        const username = userMap[uid] || 'Someone';
    
        const roomRef = doc(db, 'messageRooms', roomId);
    
        try {
            const docSnap = await getDoc(roomRef);
            const oldMessages = docSnap.exists() ? docSnap.data().messages || [] : [];
            const activeUsers = docSnap.data().users || [];
            const newUsers = activeUsers.filter(userId => userId !== uid);
    
            const systemMessage = {
                type: "system",
                content: `${username} has left the room.`,
            };
    
            if (newUsers.length == 0) {
                await updateDoc(roomRef, {
                    messages: [...oldMessages, systemMessage],
                    timestamp: serverTimestamp()
                });

                setTimeout(async () => {
                    await updateDoc(roomRef, {
                        messages: [],
                        users: [],
                    });
                    await deleteDoc(roomRef);
                }, 500);
            }
            else {
                await updateDoc(roomRef, {
                    messages: [...oldMessages, systemMessage],
                    users: newUsers,
                    timestamp: serverTimestamp()
                });
            }
            delete_cookie('room');
            navigate('/');
        } catch (err) {
            console.error("Error leaving room:", err);
            toast.error("Failed to leave the room.");
        }
    };

    return (
        <>
            <div className='container'>
                <div className='heading'>
                    <h2>Room code: {read_cookie('room')}</h2>
                    <button onClick={handleLeaveRoom}>Leave Room</button>
                </div>
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
                                    <div ref={messagesEndRef}/>
                                </div>)
                                
                            })
                        }
                    </div>
                    <div className='input-box'>
                        <input type='text' name='msg-user' value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={HandleEnterKey}/>
                        <button onClick={HandleSubmit}>Send</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatRoom;