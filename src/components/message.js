
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
    DialogContent
} from '@mui/material';
import { Send, Call, Videocam as VideocamIcon, Info, MoreVert, Close, CallEnd as CallEndIcon } from '@mui/icons-material';
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

    // Auto-join call if acceptedCallInfo is provided
    useEffect(() => {
        if (acceptedCallInfo && peerId) {
            // Open call dialog
            setCallActive(true);
            setCallDialog({
                open: true,
                type: acceptedCallInfo.type,
                from: acceptedCallInfo.fromUser,
                duration: 0,
            });
            setCallStartTime(Date.now());
            setRemotePeerId(acceptedCallInfo.peerId);
            // Answer the call (connect to caller's peerId)
            (async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: acceptedCallInfo.type === 'video',
                        audio: true,
                    });
                    setMediaStream(stream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                    if (peer && acceptedCallInfo.peerId) {
                        const call = peer.call(acceptedCallInfo.peerId, stream, { metadata: { type: acceptedCallInfo.type } });
                        call.on('stream', (remoteStream) => {
                            setRemoteStream(remoteStream);
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = remoteStream;
                            }
                        });
                    }
                } catch (err) {
                    alert('Không thể truy cập camera/microphone.');
                }
            })();
            // Reset acceptedCallInfo after use
            setAcceptedCallInfo && setAcceptedCallInfo(null);
        }
    }, [acceptedCallInfo, peer, peerId]);

    useEffect(() => {
        // Create PeerJS instance
        const newPeer = new Peer(undefined, { debug: 2 });
        setPeer(newPeer);
        newPeer.on('open', (id) => {
            setPeerId(id);
        });
        // Handle incoming PeerJS call
        newPeer.on('call', async (call) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: call.metadata.type === 'video',
                    audio: true,
                });
                setMediaStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    setRemoteStream(remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                });
            } catch (err) {
                alert('Không thể truy cập camera/microphone.');
            }
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
        <Videocam />
            setCallActive(false);
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
    const renderCallDialog = () => (
        <Dialog open={callDialogOpen} onClose={handleCallDialogClose} maxWidth="xs" fullWidth PaperProps={{
            sx: {
                borderRadius: 4,
                boxShadow: 8,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            }
        }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {callType === 'video' ? <VideocamIcon color="primary" /> : <Call color="primary" />}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {callType === 'video' ? 'Video Call' : 'Audio Call'}
                    </Typography>
                </Box>
                <IconButton onClick={handleCallDialogClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, pt: 1 }}>
                {callType === 'video' ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        width: '100%',
                        mb: 2,
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{ width: 120, height: 90, borderRadius: 10, background: '#e3e3e3', border: '2px solid #1976d2' }}
                            />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>Bạn</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{ width: 320, height: 240, borderRadius: 16, background: '#e3e3e3', border: '2px solid #1976d2' }}
                            />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>Đối phương</Typography>
                        </Box>
                    </Box>
                ) : (
                    <Avatar sx={{ width: 90, height: 90, mb: 2, border: '3px solid #1976d2' }} src={otherUser?.avt_file_path} />
                )}
                {callType === 'video' && (
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 1 }}>
                        {(!localVideoRef.current?.srcObject || !remoteVideoRef.current?.srcObject) && (
                            <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 500 }}>
                                Đang kết nối video...
                            </Typography>
                        )}
                    </Box>
                )}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600, color: '#1976d2' }}>
                    {otherUser?.name || 'Đang kết nối...'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>

                    <Button variant="contained" color="error" onClick={handleEndCall} startIcon={<CallEndIcon />} sx={{ fontWeight: 600, fontSize: 16, borderRadius: 2, boxShadow: 2 }}>Kết thúc</Button>
                </Box>
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
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'whitesmoke', marginTop: '18px' }}>
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
            {/* Call Notification Dialog */}
            {callDialog.open && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2000,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        minWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {callDialog.from?.user_id === state.userData.user_id
                            ? `Đang gọi ${selectedUser?.name} (${callDialog.type === 'video' ? 'Video' : 'Audio'})...`
                            : `${callDialog.from?.name || 'Người dùng'} đang gọi bạn (${callDialog.type === 'video' ? 'Video' : 'Audio'})`}
                    </Typography>
                    {/* Video/Audio UI */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2 }}>
                        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 120, height: 90, background: '#eee', marginRight: 8, borderRadius: 8 }} />
                        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 120, height: 90, background: '#eee', borderRadius: 8 }} />
                    </Box>
            {callDialog.from?.user_id !== state.userData.user_id && (
                <Button variant="contained" color="primary" sx={{ mb: 1 }} onClick={async () => {
                    if (incomingCallInfo && peerId) {
                        socket.emit('accept-call', {
                            toUser: incomingCallInfo.fromUser.user_id,
                            fromUser: state.userData,
                            type: incomingCallInfo.type,
                            chat_rooms_id: incomingCallInfo.chat_rooms_id,
                            peerId,
                        });
                        setCallActive(true);
                        setCallStartTime(Date.now());
                        setCallDialog((prev) => ({ ...prev, open: true }));
                        // Answer the call (connect to caller's peerId)
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({
                                video: incomingCallInfo.type === 'video',
                                audio: true,
                            });
                            setMediaStream(stream);
                            if (localVideoRef.current) {
                                localVideoRef.current.srcObject = stream;
                            }
                            const call = peer.call(incomingCallInfo.peerId, stream, { metadata: { type: incomingCallInfo.type } });
                            call.on('stream', (remoteStream) => {
                                setRemoteStream(remoteStream);
                                if (remoteVideoRef.current) {
                                    remoteVideoRef.current.srcObject = remoteStream;
                                }
                            });
                        } catch (err) {
                            alert('Không thể truy cập camera/microphone.');
                        }
                    }
                }}>
                    Chấp nhận
                </Button>
            )}
                    <Button variant="outlined" color="error" startIcon={<Close />} onClick={handleEndCall}>
                        Kết thúc cuộc gọi
                    </Button>
                </Box>
            )}

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
