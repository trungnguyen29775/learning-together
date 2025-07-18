import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import StateContext from '../context/context.context';
import { setIncomingCall, clearIncomingCall } from '../context/action.context';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import Profile from '../components/profile';
import FriendList from '../components/friendList';
import Message from '../components/message';
import Notification from '../components/notification';
import Setting from '../components/setting';
import CallRequestPopup from '../components/CallRequestPopup';
import TinderCards from '../components/swiper';
import QuickChat from '../components/quickChat';
import LikedYouCards from '../components/LikedYouSidebar';

import Peer from 'peerjs';
import instance from '../axios/instance';

const MainLayout = () => {
    const [state, dispatchState] = useContext(StateContext);
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        if (state.login) {
            instance
                .get(`/get-notification-by-user/${state.userData.user_id}`)
                .then((res) => {
                    setNotifications(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [state]);

    // Listen for incoming-call globally
    useEffect(() => {
        function handleIncomingCall(data) {
            dispatchState(setIncomingCall(data));
        }
        socket.on('incoming-call', handleIncomingCall);
        return () => {
            socket.off('incoming-call', handleIncomingCall);
        };
    }, [dispatchState]);
    // Global call popup


    const [accepting, setAccepting] = useState(false);
    const [peerId, setPeerId] = useState('');
    const [peer, setPeer] = useState(null); // peer is needed for PeerJS instance, but if not used, can be removed
    // State to trigger call dialog in Message after accepting
    const [acceptedCallInfo, setAcceptedCallInfo] = useState(null);

    // Initialize PeerJS and set peerId
    useEffect(() => {
        // Use your own local PeerJS server
        const newPeer = new Peer(undefined, {
            host: 'localhost',
            port: 9000,
            path: '/',
            secure: false
        });
        setPeer(newPeer);
        newPeer.on('open', (id) => {
            setPeerId(id);
        });
        // Clean up peer on unmount
        return () => {
            newPeer.destroy();
        };
    }, []);


    const handleAcceptCall = async () => {
        if (!state.incomingCall || !peerId) return;
        setAccepting(true);
        socket.emit('accept-call', {
            toUser: state.incomingCall.fromUser.user_id,
            fromUser: state.userData,
            type: state.incomingCall.type,
            chat_rooms_id: state.incomingCall.chat_rooms_id,
            peerId,
        });
        // Set accepted call info to trigger call dialog in Message
        setAcceptedCallInfo({
            fromUser: state.incomingCall.fromUser,
            type: state.incomingCall.type,
            chat_rooms_id: state.incomingCall.chat_rooms_id,
            peerId: state.incomingCall.peerId, // caller's peerId
        });
        // Switch to message component
        dispatchState({ type: 'CHANGE_COMPONENT', payload: 'message' });
        dispatchState(clearIncomingCall());
        setAccepting(false);
    };

    const handleDeclineCall = () => {
        dispatchState(clearIncomingCall());
    };

    const navigate = useNavigate();
    useEffect(() => {
        if (state.login === false) {
            navigate('/login');
        }
    }, [state, navigate]);

    return (
        <>
            {/* Global Call Notification Popup */}
            {state.incomingCall && (
                <CallRequestPopup
                    incomingCall={state.incomingCall}
                    accepting={accepting}
                    peerId={peerId}
                    onAccept={handleAcceptCall}
                    onDecline={handleDeclineCall}
                />
            )}

            <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ height: '100%', minWidth: '250px' }}>
                <Sidebar />
            </Box>
            {state.currentComponent === 'home' ? (
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <TinderCards />
                </Box>
            ) : state.currentComponent === 'message' ? (
                <Box sx={{ height: '100%', flex: 1 }}>
                    <Message acceptedCallInfo={acceptedCallInfo} setAcceptedCallInfo={setAcceptedCallInfo} />
                </Box>
            ) : state.currentComponent === 'notification' ? (
                <Box sx={{ height: '100vh', flex: 1, overflow: 'auto', marginTop: '18px' }}>
                    {notifications?.map((notification, index) => (
                        <Notification
                            key={notification.notification_id || index}
                            notification={notification}
                            onAction={async (notif, action) => {
                                // Call backend to update friendship and notification status
                                try {
                                    await instance.post('/update-friendship-from-notification', {
                                        notification_id: notif.notification_id,
                                        user_id: notif.user_id,
                                        action,
                                    });
                                    // Refresh notifications after action
                                    const res = await instance.get(`/get-notification-by-user/${state.userData.user_id}`);
                                    setNotifications(res.data);
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                        />
                    ))}
                </Box>
            ) : state.currentComponent === 'profile' ? (
                <Box sx={{ height: '100%', flex: 1, overflow: 'auto' }}>
                    <Profile />
                    <FriendList />
                </Box>
            ) : state.currentComponent === 'setting' ? (
                <Setting />
            ) : state.currentComponent === 'quickChat' ? (
                <Box sx={{ height: '100%', flex: 1, overflow: 'auto' }}>
                    <QuickChat />
                </Box>
            ) : state.currentComponent === 'like-you' ? (
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <LikedYouCards />
                </Box>
            ) : (
                ''
            )}
        </Box>
        </>
    );
};
export default MainLayout;
