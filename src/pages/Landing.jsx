import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bake_cookie, read_cookie } from 'sfcookies';
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { toast } from 'react-toastify';
import "./css/Landing.css";

const Landing = () => {
    const [room, setRoom] = useState("");
    const navigate = useNavigate();
    const userRef = collection(db, "userDetails");
    const uid = read_cookie('user') || null;

    const GenerateCode = async (e) => {
        e.preventDefault();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setRoom(code);
    }

    const CreateRoom = async (e) => {
        e.preventDefault();
        if (uid.length != 0) {
            if ((await getDoc(doc(userRef, uid))).exists()) {
                if (room.length == 8) {
                    const roomCol = collection(db, "messageRooms");
                    const roomDoc = doc(roomCol, room);
                    const existingRoom = await getDoc(roomDoc);
                    if (!existingRoom.exists()) {
                        await setDoc(roomDoc, {
                            users: [uid],
                            messages: [],
                            joinedUsers: []
                        });
                    } else {
                        toast.error("Room already exists. Try another code.", {
                            position: 'bottom-left',
                            autoClose: 3000
                        });
                        return;
                    }
                    await updateDoc(doc(collection(db, 'userDetails'), uid), {
                        rooms: arrayUnion(room)
                    });
                    bake_cookie('room', room);
                    navigate('/chatroom')
                }
                else {
                    toast.error("Room code must be exactly 8 characters long!", {
                        position: 'bottom-left',
                        autoClose: 3000
                    });
                }
            }
            else {
                toast.error("Unauthorized user!", {
                    position: 'bottom-left',
                    autoClose: 3000
                });
                navigate('/signin');
            }
        }
        else {
            toast.error("User is not signed in!", {
                position: 'bottom-left',
                autoClose: 3000,
            });
            navigate('/signin');
        }
    }

    const JoinRoom = async (e) => {
        e.preventDefault();
        if (uid.length != 0) {
            if ((await getDoc(doc(userRef, uid))).exists()) {
                const roomCol = collection(db, "messageRooms");
                const docSnap = await getDoc(doc(roomCol, room));
                if (docSnap.exists()) {
                    const roomDoc = doc(roomCol, room);
                    const roomData = (await getDoc(roomDoc)).data();
                    if (!roomData.users.includes(uid)) {
                        await updateDoc(roomDoc, {
                            users: arrayUnion(uid)
                        });
                        const userSnap = await getDoc(doc(userRef, uid));
                        const username = userSnap.data().username;

                        await updateDoc(roomDoc, {
                            messages: arrayUnion({
                                type: "system",
                                uid,
                                content: `${username} has joined the room.`,
                                timestamp: new Date().toISOString()
                            })
                        });
                    }
                    bake_cookie('room', room);
                    navigate('/chatroom')
                }
                else {
                    toast.error("Room code is invalid!", {
                        position: 'bottom-left',
                        autoClose: 3000
                    });
                }
            }
            else {
                toast.error("Unauthorized user!", {
                    position: 'bottom-left',
                    autoClose: 3000,
                });
                navigate('/signin');
            }
        }
        else {
            toast.error("User is not signed in!", {
                position: 'bottom-left',
                autoClose: 3000,
            });
            navigate('/signin');
        }
    }

    return (
        <>
            <div className='container'>
                <div className='room-creation'>
                    <h2>Room creation</h2>
                    <div className='input-group'>
                        <div className='input-item'>
                            <label>Enter room code</label>
                            <input type='text' name='room-code' value={room} onChange={e => setRoom(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}/>
                            <button onClick={GenerateCode}>🔃</button>
                        </div>
                    </div>
                    <div className="btn">
                        <button onClick={JoinRoom}>Join Room</button>
                        <button onClick={CreateRoom}>Create Room</button>
                    </div>
                    <div className="redirection">
                        Don't have an account? <Link to="/signup">Sign-Up</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Landing;