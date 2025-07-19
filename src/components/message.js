
import React, { useState, useEffect, useContext, useRef } from 'react';
import Peer from 'peerjs';
import {
    Box,
    Typography,
    List,
    ListItem,
    Avatar,
    TextField,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem,
    Snackbar,
    Alert,
    Drawer,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Chip
} from '@mui/material';
import { Send, Call, Videocam as VideocamIcon, Info, MoreVert, Close, CallEnd as CallEndIcon, VolumeOff, VolumeUp, VideocamOff } from '@mui/icons-material';
import instance from '../axios/instance';
import StateContext from '../context/context.context';
import { socket } from '../socket';


const Message = ({ acceptedCallInfo, setAcceptedCallInfo }) => {
    const [state] = useContext(StateContext);

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedProfileImages, setSelectedProfileImages] = useState([]);
    const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [callDialog, setCallDialog] = useState({ open: false, type: '', from: null, duration: 0 });
    const [callActive, setCallActive] = useState(false);
    const [callStartTime, setCallStartTime] = useState(null);
    // PeerJS setup
    const [peer, setPeer] = useState(null);
    const [peerId, setPeerId] = useState('');
    const [remotePeerId, setRemotePeerId] = useState('');
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [mediaError, setMediaError] = useState('');

    // Auto-join call if acceptedCallInfo is provided
    useEffect(() => {
        if (acceptedCallInfo && peerId) {
            console.log('[Call] acceptedCallInfo:', acceptedCallInfo, 'peerId:', peerId);
            setCallActive(true);
            setCallDialog({
                open: true,
                type: acceptedCallInfo.type,
                from: acceptedCallInfo.fromUser,
                duration: 0,
            });
            setCallStartTime(Date.now());
            setRemotePeerId(acceptedCallInfo.peerId);
            (async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: acceptedCallInfo.type === 'video',
                        audio: true,
                    });
                    // For audio-only calls, disable video tracks
                    if (acceptedCallInfo.type !== 'video') {
                        stream.getVideoTracks().forEach(track => track.enabled = false);
                    }
                    setMediaError('');
                    console.log('[getUserMedia] local stream:', stream, stream.getTracks());
                    setMediaStream(stream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                        setTimeout(() => {
                            localVideoRef.current.play().catch(e => console.warn('Local video play() error:', e));
                        }, 100);
                        const videoTracks = stream.getVideoTracks();
                        const audioTracks = stream.getAudioTracks();
                        console.log('[Local Stream] video enabled:', videoTracks.map(t => t.enabled), 'audio enabled:', audioTracks.map(t => t.enabled));
                    }
                    if (peer && acceptedCallInfo.peerId) {
                        const call = peer.call(acceptedCallInfo.peerId, stream, { metadata: { type: acceptedCallInfo.type } });
                        console.log('[PeerJS] Calling peer:', acceptedCallInfo.peerId, 'with stream:', stream);
                        call.on('stream', (remoteStream) => {
                            console.log('[PeerJS] Received remote stream:', remoteStream, remoteStream.getTracks());
                            setRemoteStream(remoteStream);
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = remoteStream;
                                setTimeout(() => {
                                    remoteVideoRef.current.play().catch(e => console.warn('Remote video play() error:', e));
                                }, 100);
                                const videoTracks = remoteStream.getVideoTracks();
                                const audioTracks = remoteStream.getAudioTracks();
                                console.log('[Remote Stream] video enabled:', videoTracks.map(t => t.enabled), 'audio enabled:', audioTracks.map(t => t.enabled));
                            }
                        });
                        call.on('error', (err) => {
                            console.error('[PeerJS] Call error:', err);
                        });
                    }
                } catch (err) {
                    setMediaError('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập hoặc thiết bị.');
                    console.error('[getUserMedia] Error:', err);
                }
            })();
            setAcceptedCallInfo && setAcceptedCallInfo(null);
        }
    }, [acceptedCallInfo, peer, peerId]);

    useEffect(() => {
        // Create PeerJS instance
        const newPeer = new Peer(undefined, { debug: 2 });
        setPeer(newPeer);
        newPeer.on('open', (id) => {
            console.log('[PeerJS] Opened with id:', id);
            setPeerId(id);
        });
        // Handle incoming PeerJS call
        newPeer.on('call', async (call) => {
            console.log('[PeerJS] Incoming call:', call);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: call.metadata.type === 'video',
                    audio: true,
                });
                // For audio-only calls, disable video tracks
                if (call.metadata.type !== 'video') {
                    stream.getVideoTracks().forEach(track => track.enabled = false);
                }
                setMediaError('');
                console.log('[getUserMedia] local stream (answer):', stream, stream.getTracks());
                setMediaStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                call.answer(stream);
                console.log('[PeerJS] Answered call with stream:', stream);
                call.on('stream', (remoteStream) => {
                    console.log('[PeerJS] Received remote stream (answer):', remoteStream, remoteStream.getTracks());
                    setRemoteStream(remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                });
                call.on('error', (err) => {
                    console.error('[PeerJS] Call error (answer):', err);
                });
            } catch (err) {
                setMediaError('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập hoặc thiết bị.');
                console.error('[getUserMedia] Error (answer):', err);
            }
        });
        newPeer.on('error', (err) => {
            console.error('[PeerJS] Peer error:', err);
        });
        return () => {
            newPeer.destroy();
        };
    }, []);
        <Call />
    // Only handle call-accepted and call-ended here (incoming-call is now global)
    useEffect(() => {
        function handleCallAccepted({ fromUser, toUser, type, chat_rooms_id, peerId: calleePeerId }) {
            setCallActive(true);
            setCallDialog({ open: true, type, from: fromUser, duration: 0 });
            setCallStartTime(Date.now());
            setRemotePeerId(calleePeerId);
        }
        function handleCallEnd({ fromUser, toUser, type, duration, chat_rooms_id }) {
            // End the call dialog and reset state when other user ends the call
            setCallActive(false);
            setCallDialog({ open: false, type: '', from: null, duration: 0 });
            setRemotePeerId('');
            setRemoteStream(null);
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop());
                setMediaStream(null);
            }
            if (selectedChatRoomId === chat_rooms_id) {
                setChatMessages((prev) => [...prev, {
                    sender: 'system',
                    content: `Cuộc gọi ${type === 'video' ? 'video' : 'thường'} kết thúc. Thời lượng: ${Math.round(duration/1000)} giây.`,
                }]);
            }
        }
        socket.on('call-accepted', handleCallAccepted);
        socket.on('call-ended', handleCallEnd);
        return () => {
            socket.off('call-accepted', handleCallAccepted);
            socket.off('call-ended', handleCallEnd);
        };
    }, [selectedChatRoomId, mediaStream]);

    // Store info about incoming call for accept
    const [incomingCallInfo, setIncomingCallInfo] = useState(null);
      useEffect(() => {
        if (state.userData?.user_id) {
            socket.emit('online', { user_id: state.userData.user_id });
        }
    }, [state.userData?.user_id]);
    // Start a call (audio or video)
    const handleStartCall = async (type) => {
        if (!selectedUser || !peerId) return;
        console.log('[Call] handleStartCall:', { selectedUser, peerId, type });
        setCallActive(true);
        setCallStartTime(Date.now());
        socket.emit('start-call', {
            toUser: selectedUser.user_id,
            fromUser: state.userData,
            type,
            chat_rooms_id: selectedChatRoomId,
            peerId,
        });
        setCallDialog({ open: true, type, from: state.userData, duration: 0 });
    };

    // End a call
    const handleEndCall = () => {
        if (!callActive) return;
        const duration = Date.now() - callStartTime;
        setCallActive(false);
        setCallDialog({ open: false, type: '', from: null, duration: 0 });
        setRemotePeerId('');
        setRemoteStream(null);
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
        socket.emit('end-call', {
            toUser: selectedUser.user_id,
            fromUser: state.userData,
            type: callDialog.type,
            duration,
            chat_rooms_id: selectedChatRoomId,
        });
        setChatMessages((prev) => [...prev, {
            sender: 'system',
            content: `Cuộc gọi ${callDialog.type === 'video' ? 'video' : 'thường'} kết thúc. Thời lượng: ${Math.round(duration/1000)} giây.`,
        }]);
    };
    const messagesEndRef = useRef(null); // Tham chiếu đến phần tử cuối cùng
    const [anchorEl, setAnchorEl] = useState(null); // State để quản lý vị trí của menu
    const open = Boolean(anchorEl); // Kiểm tra xem menu có đang mở không
    const [snackbarOpen, setSnackbarOpen] = useState(false); // State để quản lý Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Thông báo của Snackbar
    const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // Mức độ nghiêm trọng của thông báo

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Hàm mở menu
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Dialog open/close state
    const callDialogOpen = callDialog.open;
    const handleCallDialogClose = () => {
        setCallDialog({ open: false, type: '', from: null, duration: 0 });
        setCallActive(false);
        setRemotePeerId('');
        setRemoteStream(null);
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
    };

    // Helper for call type
    const callType = callDialog.type;
    // Helper for other user
    const otherUser = selectedUser;

    // Hàm đóng menu
    // Call duration timer
    const [callDuration, setCallDuration] = useState(0);
    useEffect(() => {
        let timer;
        if (callDialogOpen && callActive) {
            timer = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(timer);
    }, [callDialogOpen, callActive]);

    // Mute/camera toggle state (UI only)
    const [muted, setMuted] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);

    // Real mute/camera logic
    const handleToggleMute = () => {
        if (mediaStream) {
            const audioTracks = mediaStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const newMuted = !audioTracks[0].enabled;
                audioTracks.forEach(track => { track.enabled = newMuted; });
                setMuted(!newMuted);
            }
        }
    };

    const handleToggleCamera = () => {
        if (mediaStream) {
            const videoTracks = mediaStream.getVideoTracks();
            if (videoTracks.length > 0) {
                const newCameraOn = !videoTracks[0].enabled;
                videoTracks.forEach(track => { track.enabled = newCameraOn; });
                setCameraOn(newCameraOn);
            }
        }
    };

    const renderCallDialog = () => (
        <Dialog open={callDialogOpen} onClose={handleCallDialogClose} fullWidth TransitionProps={{ appear: true }} PaperProps={{
            sx: {
                borderRadius: 6,
                boxShadow: 12,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '3px solid #1976d2',
                animation: callDialogOpen ? 'fadeIn 0.5s' : 'none',
                minHeight: '80vh',
                width: '80vw',
                maxWidth: '80vw',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
            }
        }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={otherUser?.avt_file_path || 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'}
                        alt={otherUser?.name || 'Avatar'}
                        sx={{ width: 70, height: 70, border: '3px solid #1976d2', boxShadow: 4, mr: 2, animation: !callActive ? 'ringing 1.2s infinite' : 'none' }}
                    />
                    {callType === 'video' ? <VideocamIcon color="primary" /> : <Call color="primary" />}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {callType === 'video' ? 'Video Call' : 'Audio Call'}
                    </Typography>
                </Box>
                <IconButton onClick={handleCallDialogClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                pt: 2,
                height: '100%',
                width: '100%',
            }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 600, mb: 1, textAlign: 'center' }}>
                        {otherUser?.name || 'Connecting...'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Avatar src={selectedProfileImages?.find(img => img.is_featured)?.path || otherUser?.avt_file_path || 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'} sx={{ width: 40, height: 40, border: '2px solid #1976d2' }} />
                        <Chip label={callActive ? 'In Call' : (!localVideoRef.current?.srcObject || !remoteVideoRef.current?.srcObject) ? 'Connecting...' : 'Call Ended'} color={callActive ? 'success' : 'warning'} size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#333', mb: 2 }}>
                    Duration: {Math.floor(callDuration / 60)}:{('0' + (callDuration % 60)).slice(-2)}
                </Typography>
                {mediaError && (
                    <Alert severity="error" sx={{ mb: 2 }}>{mediaError}</Alert>
                )}
                {callType === 'video' ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        width: '100%',
                        mb: 2,
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted={muted}
                                playsInline
                                style={{ width: 220, height: 160, borderRadius: 18, background: '#e3e3e3', border: '3px solid #1976d2', boxShadow: 4 }}
                            />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>You</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                muted={false}
                                style={{ width: 320, height: 240, borderRadius: 22, background: '#e3e3e3', border: '3px solid #1976d2', boxShadow: 4 }}
                            />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>Other user</Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        width: '100%',
                        mb: 2,
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 180, height: 180, mb: 2, border: '3px solid #1976d2', boxShadow: 4 }} src={selectedProfileImages?.find(img => img.is_featured)?.path || otherUser?.avt_file_path} />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>You</Typography>
                            <audio
                                ref={localVideoRef}
                                autoPlay
                                muted={muted}
                                controls={false}
                                style={{ width: 220, height: 40, marginTop: 8 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 180, height: 180, mb: 2, border: '3px solid #1976d2', boxShadow: 4 }} src={selectedProfileImages?.find(img => img.is_featured)?.path || otherUser?.avt_file_path} />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>Other user</Typography>
                            <audio
                                ref={remoteVideoRef}
                                autoPlay
                                muted={false}
                                controls={false}
                                style={{ width: 320, height: 40, marginTop: 8 }}
                            />
                        </Box>
                    </Box>
                )}
                {callType === 'video' && (
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 1 }}>
                        {(!localVideoRef.current?.srcObject || !remoteVideoRef.current?.srcObject) && (
                            <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 500 }}>
                                Connecting video...
                            </Typography>
                        )}
                    </Box>
                )}
                <Box sx={{ display: 'flex', gap: 6, mt: 4, justifyContent: 'center', width: '100%' }}>
                    <IconButton color={muted ? 'error' : 'primary'} onClick={handleToggleMute} sx={{ width: 64, height: 64, fontSize: 32, border: muted ? '2px solid #f44336' : '2px solid #1976d2', background: muted ? '#ffebee' : '#e3f2fd' }}>
                        {muted ? <VolumeOff sx={{ fontSize: 40 }} /> : <VolumeUp sx={{ fontSize: 40 }} />}
                    </IconButton>
                    <IconButton color={cameraOn ? 'primary' : 'error'} onClick={handleToggleCamera} sx={{ width: 64, height: 64, fontSize: 32, border: cameraOn ? '2px solid #1976d2' : '2px solid #f44336', background: cameraOn ? '#e3f2fd' : '#ffebee' }}>
                        {cameraOn ? <VideocamIcon sx={{ fontSize: 40 }} /> : <VideocamOff sx={{ fontSize: 40 }} />}
                    </IconButton>
                    <Button variant="contained" color="error" onClick={handleEndCall} startIcon={<CallEndIcon sx={{ fontSize: 40 }} />} sx={{ fontWeight: 700, fontSize: 24, borderRadius: 4, boxShadow: 6, px: 6, py: 2, background: 'linear-gradient(90deg, #f44336 0%, #ff7961 100%)', minWidth: 180 }}>
                        End Call
                    </Button>
                </Box>
                <style>{`
                    @keyframes ringing {
                        0% { box-shadow: 0 0 0 0 #1976d2; }
                        70% { box-shadow: 0 0 0 10px #1976d233; }
                        100% { box-shadow: 0 0 0 0 #1976d2; }
                    }
                    @keyframes fadeIn {
                        0% { opacity: 0; transform: scale(0.95); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );

    // --- FIX misplaced code block: move this into the correct handler function ---
    // The following code was outside any function, causing syntax errors. It should be inside the handler for menu actions (e.g., handleMenuAction).

    // Example fix: (Assuming this is part of a menu action handler)
    // Place this inside the appropriate function, e.g., handleMenuAction
    // (This is a placeholder, as the actual function is not shown in the patch context)

    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const response = await instance.get(`/get-chat-feature/${state.userData.user_id}`);
                setUsers(response.data);
                if (response.data.length > 0) {
                    handleSelectUser(response.data[0]);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatUsers();
    }, []);

    // Lắng nghe tin nhắn mới

    // Fix: handleMenuClose, handleMenuAction, handleSnackbarClose
    const handleMenuClose = () => setAnchorEl(null);
    const handleMenuAction = () => {};
    const handleSnackbarClose = () => setSnackbarOpen(false);
    useEffect(() => {
        if (state.login) {
            const handleReceivedMessage = ({ senderId, message, chat_rooms_id }) => {
                console.log('[received-message] event:', { senderId, message, chat_rooms_id, selectedChatRoomId });
                if (chat_rooms_id === selectedChatRoomId) {
                    setChatMessages((prev) => [...prev, { sender: senderId, content: message }]);
                }
            };

            socket.on('received-message', handleReceivedMessage);

            return () => {
                socket.off('received-message', handleReceivedMessage);
            };
        }
    }, [selectedChatRoomId]);

    // Chọn người dùng để chat
    const handleSelectUser = async (user) => {
        if (selectedUser?.user_id === user.user_id) return;

        if (!user.chat_rooms_id) {
            console.warn('User does not have a chat_rooms_id.');
            return;
        }

        setSelectedUser(user);
        setSelectedChatRoomId(user.chat_rooms_id);
        setChatMessages([]);
        setLoading(true);

        try {
            const response = await instance.get(`/get-messages-by-chat-room/${user.chat_rooms_id}`);
            setChatMessages(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy tin nhắn:', error);
            alert('Failed to fetch messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChatRoomId || sending) return;

        const newMessage = {
            sender: state.userData.user_id,
            content: messageInput,
            chat_rooms_id: selectedChatRoomId,
        };

        setSending(true);

        try {
            await instance.post('/create-message', newMessage);
            setChatMessages((prev) => [...prev, newMessage]);
            console.log('[send-message] emit:', {
                targetUserId: selectedUser.user_id,
                message: messageInput,
                senderId: state.userData.user_id,
                chat_rooms_id: selectedChatRoomId,
            });
            socket.emit('send-message', {
                targetUserId: selectedUser.user_id,
                message: messageInput,
                senderId: state.userData.user_id,
                chat_rooms_id: selectedChatRoomId,
            });
            setMessageInput('');
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
        } finally {
            setSending(false);
        }
    };

    // Hiệu ứng popup cho tin nhắn
    const messageStyle = {
        bgcolor: '#0084ff',
        color: 'white',
        borderRadius: '8px',
        padding: '8px',
        margin: '5px',
        maxWidth: '70%',
        wordWrap: 'break-word',
        animation: 'popup 0.3s ease-out',
    };

    const otherMessageStyle = {
        bgcolor: '#e5e5ea',
        color: 'black',
        borderRadius: '8px',
        padding: '8px',
        margin: '5px',
        maxWidth: '70%',
        wordWrap: 'break-word',
        animation: 'popup 0.3s ease-out',
    };

    const globalStyles = (
        <style>
            {`
            @keyframes popup {
                0% {
                    transform: scale(0.8);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            `}
        </style>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'whitesmoke', marginTop: '18px', position: 'relative' }}>
            {/* Danh sách liên hệ */}
            <Box sx={{ width: '25%', bgcolor: 'white', borderRight: '1px solid lightgray', overflowY: 'auto' }}>
                <Typography variant="h6" sx={{ padding: '10px', fontWeight: 'bold' }}>
                    Contacts
                </Typography>
                {loading ? (
                    <CircularProgress sx={{ margin: '20px auto', display: 'block' }} />
                ) : (
                    <List>
                        {users.map((user) => (
                            <ListItem
                                key={user.user_id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                    bgcolor:
                                        selectedUser?.user_id === user.user_id ? 'hsl(210deg 100% 95%)' : 'transparent',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'lightgray', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
                                    transition: 'background-color 0.3s, box-shadow 0.3s',
                                }}
                                onClick={() => handleSelectUser(user)}
                            >
                                <Avatar
                                    src={
                                        user.avt_file_path ||
                                        'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'
                                    }
                                    alt={user.name}
                                    sx={{ marginRight: '10px', border: '2px solid #0084ff' }}
                                />
                                <Typography sx={{ marginLeft: '10px', fontWeight: '500' }}>{user.name}</Typography>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            {/* Khu vực chat */}
            <Box
                sx={{
                    width: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                }}
            >
                {/* Tiêu đề phòng chat */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        bgcolor: 'white',
                        borderBottom: '1px solid lightgray',
                    }}
                >
                    {selectedUser ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                <Avatar
                                    src={
                                        selectedUser.avt_file_path ||
                                        'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'
                                    }
                                    alt={selectedUser.name}
                                    sx={{ marginRight: '10px', border: '2px solid #0084ff', cursor: 'pointer' }}
                                    onClick={async () => {
                                        if (!selectedUser.user_id) {
                                            setSelectedProfile(null);
                                            setSelectedProfileImages([]);
                                            setProfileDrawerOpen(true);
                                            return;
                                        }
                                        try {
                                            const res = await instance.get(`/get-profile/${selectedUser.user_id}`);
                                            setSelectedProfile(res.data.user);
                                            // Fetch all images for the user
                                            const imgRes = await instance.get(`/user-image/get-user-images/${selectedUser.user_id}`);
                                            let images = imgRes.data;
                                            if (!images || images.length === 0) {
                                                images = [
                                                    {
                                                        path:
                                                            res.data.user.avt_file_path ||
                                                            'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
                                                        is_featured: true,
                                                    },
                                                ];
                                            }
                                            setSelectedProfileImages(images);
                                            setProfileDrawerOpen(true);
                                        } catch (err) {
                                            setSelectedProfile(null);
                                            setSelectedProfileImages([]);
                                            setProfileDrawerOpen(true);
                                        }
                                    }}
                                />
                                <Typography variant="h6">{selectedUser.name}</Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                {/* Icon Call */}

                                {/* Icon Call */}
                                <IconButton
                                    color="primary"
                                    aria-label="Call"
                                    onClick={() => handleStartCall('audio')}
                                    disabled={callActive}
                                >
                                    <Call />
                                </IconButton>

                                {/* Icon Call Video */}
                                <IconButton
                                    color="primary"
                                    aria-label="Call Video"
                                    onClick={() => handleStartCall('video')}
                                    disabled={callActive}
                                >
                                    <VideocamIcon />
                                </IconButton>
            {/* Enlarged Call Dialog Overlay */}
            {callDialog.open && renderCallDialog()}

                                {/* Icon Info */}
                                <IconButton
                                    color="primary"
                                    aria-label="Info"
                                    onClick={() => console.log('Info clicked')}
                                >
                                    <Info />
                                </IconButton>

                                <IconButton color="primary" aria-label="More" onClick={handleMenuOpen}>
                                    <MoreVert />
                                </IconButton>

                                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} sx={{ width: '500px' }}>
                                    <MenuItem onClick={() => handleMenuAction('report')}>Báo cáo</MenuItem>
                                    <MenuItem onClick={() => handleMenuAction('block')}>Chặn</MenuItem>
                                    <MenuItem onClick={() => handleMenuAction('unmatch')}>Unmatch</MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="h6">Chọn người để trò chuyện</Typography>
                    )}
                </Box>

                {/* Danh sách tin nhắn */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '10px',
                        '&::-webkit-scrollbar': {
                            width: '0.4em',
                        },
                        '&::-webkit-scrollbar-track': {
                            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,.1)',
                            outline: '1px solid slategrey',
                        },
                    }}
                >
                    {chatMessages.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="body1" sx={{ color: 'rgb(0, 115, 230)' }}>
                                Hãy gửi lời chào tới {selectedUser?.name || 'người này'}!
                            </Typography>
                        </Box>
                    ) : (
                        chatMessages.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent:
                                        msg.sender === state.userData.user_id
                                            ? 'flex-end'
                                            : msg.sender === 'system'
                                            ? 'center'
                                            : 'flex-start',
                                }}
                            >
                                <Typography
                                    sx={
                                        msg.sender === state.userData.user_id
                                            ? messageStyle
                                            : msg.sender === 'system'
                                            ? { ...otherMessageStyle, bgcolor: '#ffe082', color: '#333', fontStyle: 'italic' }
                                            : otherMessageStyle
                                    }
                                >
                                    {msg.content}
                                </Typography>
                            </Box>
                        ))
                    )}
                    {/* Tham chiếu đến phần tử cuối cùng */}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Ô nhập tin nhắn */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        bgcolor: 'white',
                        borderTop: '1px solid lightgray',
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Nhập tin nhắn..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <IconButton color="primary" onClick={handleSendMessage} disabled={sending}>
                        <Send />
                    </IconButton>
                </Box>
            </Box>
            <Drawer anchor="right" open={profileDrawerOpen} onClose={() => setProfileDrawerOpen(false)}>
                <Box sx={{ width: 400, p: 3 }} role="presentation">
                    {selectedProfile ? (
                        <>
                            {/* Show all images */}
                            {selectedProfileImages.length > 0 && (
                                <Box>
                                    {selectedProfileImages.map((image, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                width: '100%',
                                                height: '220px',
                                                position: 'relative',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundImage: `url(${image.path})`,
                                                mt: idx === 0 ? 0 : 2,
                                                borderRadius: 2,
                                            }}
                                        >
                                            {image.is_featured && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '16px',
                                                        left: '16px',
                                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    <span>Profile Photo</span>
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Profile info */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                    {selectedProfile.name || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {selectedProfile.bio || 'No bio available'}
                                </Typography>
                                {/* Add more profile fields as needed, e.g., school, job, needs, etc. */}
                            </Box>
                        </>
                    ) : (
                        <Typography>Loading profile...</Typography>
                    )}
                    <Button onClick={() => setProfileDrawerOpen(false)} sx={{ mt: 3 }} fullWidth variant="outlined">Close</Button>
                </Box>
            </Drawer>

            {/* Snackbar để hiển thị thông báo */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Message;
