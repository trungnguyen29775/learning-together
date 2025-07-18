import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Avatar,
    TextField,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Drawer
} from '@mui/material';
import { Send, Favorite, FavoriteBorder, TimerOutlined, Person, Close, Star, School, Work, LocationOn } from '@mui/icons-material';
import { socket } from '../socket';
import StateContext from '../context/context.context';
import instance from '../axios/instance';

const QuickChat = () => {
    const [state] = useContext(StateContext);
    const [status, setStatus] = useState('idle'); // idle, searching, chatting, matched
    const [timeLeft, setTimeLeft] = useState(600);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [chatInfo, setChatInfo] = useState(null);
    const [matchDialog, setMatchDialog] = useState(false);
    const [matchedUserProfile, setMatchedUserProfile] = useState(null);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [matchedUserImages, setMatchedUserImages] = useState([]);
    const [timer, setTimer] = useState(null);
    const [friendId, setFriendId] = useState('');

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (timer) clearInterval(timer);
            if (chatInfo?.id) {
                socket.emit('leave-chat', { chatId: chatInfo.id });
            }
        };
    }, [timer, chatInfo?.id]);

    // Handler to open profile drawer
    function calculateAge(dob) {
        if (!dob) return 'Unknown';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    }
    function processProfileData(profile) {
        if (!profile) return [];
        const hobbies = Object.keys(profile).filter(
            (key) =>
                [
                    'music',
                    'game',
                    'sing',
                    'eat',
                    'exercise',
                    'running',
                    'badminton',
                    'walking',
                    'beach',
                    'hiking',
                    'travel',
                    'reading',
                    'pets',
                    'basketball',
                    'pickelBall',
                    'horror',
                    'anime',
                    'romance',
                    'action',
                    'detective',
                    'fantasy',
                ].includes(key) && profile[key],
        );
        return hobbies.map((hobby) => ({
            label: hobby.charAt(0).toUpperCase() + hobby.slice(1),
            status: true,
        }));
    }
    const handleAvatarClick = async () => {
        if (!matchedUserProfile || !matchedUserProfile.user_id) {
            setProfileDrawerOpen(true);
            setMatchedUserImages([]);
            return;
        }
        try {
            const imgRes = await instance.get(`/user-image/get-user-images/${matchedUserProfile.user_id}`);
            let images = imgRes.data;
            if (!images || images.length === 0) {
                images = [
                    {
                        path:
                            matchedUserProfile.avt_file_path ||
                            'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
                        is_featured: true,
                    },
                ];
            }
            setMatchedUserImages(images);
            setProfileDrawerOpen(true);
        } catch (err) {
            setMatchedUserImages([]);
            setProfileDrawerOpen(true);
        }
    };
    const handleDrawerClose = () => {
        setProfileDrawerOpen(false);
    };

    const startTimer = useCallback(() => {
        if (timer) clearInterval(timer);
        const newTimer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(newTimer);
                    if (chatInfo?.id) {
                        socket.emit('leave-chat', { chatId: chatInfo.id });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setTimer(newTimer);
    }, [chatInfo?.id, timer]);

    const getInterests = useCallback(() => {
        return Object.entries(state.userData)
            .filter(([key, value]) => value === true && key !== 'action')
            .map(([key]) => key);
    }, [state.userData]);

    const resetChat = useCallback(() => {
        if (timer) clearInterval(timer);
        setStatus('idle');
        setTimeLeft(600);
        setMessages([]);
        setChatInfo(null);
        setTimer(null);
    }, [timer]);

    // Socket event listeners
    useEffect(() => {
        const onChatStarted = (data) => {
            setStatus('chatting');
            console.log(data);
            setFriendId(data.friend_id);
            setChatInfo({
                id: data.chatId,
                partnerInterests: data.partnerInterests,
            });
            startTimer();
        };

        const onNewMessage = ({ message, isPartner }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: message,
                    isPartner,
                    timestamp: new Date(),
                },
            ]);
        };

        const onMatchMade = async (data) => {
        setStatus('matched');
        setMatchDialog(data);
        setChatInfo((prev) => ({ ...prev, partnerId: data.partnerId }));
        // Fetch matched user's profile
        try {
            const res = await instance.get(`/get-profile/${data.partnerId}`);
            setMatchedUserProfile(res.data.user);
        } catch (err) {
            setMatchedUserProfile(null);
        }
        };

        const onChatEnded = ({ reason }) => {
            alert(`Chat ended: ${reason}`);
            resetChat();
        };

        socket.on('chat-started', onChatStarted);
        socket.on('new-message', onNewMessage);
        socket.on('match-made', onMatchMade);
        socket.on('chat-ended', onChatEnded);

        return () => {
            socket.off('chat-started', onChatStarted);
            socket.off('new-message', onNewMessage);
            socket.off('match-made', onMatchMade);
            socket.off('chat-ended', onChatEnded);
        };
    }, [startTimer, resetChat]);

    const joinQuickChat = () => {
        if (status !== 'idle') return;

        setStatus('searching');
        socket.emit(
            'join-quick-chat',
            {
                userId: state.userData.user_id,
                interests: getInterests(),
            },
            (response) => {
                if (response.error) {
                    alert(response.error);
                    resetChat();
                }
            },
        );
    };

    const sendMessage = () => {
        if (!message.trim() || !chatInfo?.id) return;

        socket.emit('send-chat-message', {
            chatId: chatInfo.id,
            message: message.trim(),
        });

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                text: message,
                isPartner: false,
                timestamp: new Date(),
            },
        ]);

        setMessage('');
    };

    useEffect(() => {
        console.log(chatInfo);
    }, []);

    const likePartner = async () => {
        if (!chatInfo?.id) return;

        socket.emit('like-partner', { chatId: chatInfo.id });
        const res = await instance.post('/create-friendship', {
            user_id: state.userData.user_id,
            friend_id: friendId,
            status: 'liked',
        });
    };

    const leaveChat = () => {
        if (chatInfo?.id) {
            socket.emit('leave-chat', { chatId: chatInfo.id });
        }
        resetChat();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    {status === 'idle' && (
                        <>
                            <Typography variant="h5" gutterBottom textAlign="center">
                                Quick Anonymous Chat
                            </Typography>
                            <Typography textAlign="center" mb={3}>
                                Chat randomly for 10 minutes. Match by liking each other!
                            </Typography>
                            <Box display="flex" justifyContent="center">
                                <Button variant="contained" startIcon={<Person />} onClick={joinQuickChat}>
                                    Start Chat
                                </Button>
                            </Box>
                        </>
                    )}

                    {status === 'searching' && (
                        <Box textAlign="center" py={4}>
                            <CircularProgress size={60} />
                            <Typography variant="h6" mt={2}>
                                Finding a partner...
                            </Typography>
                        </Box>
                    )}

                    {status === 'chatting' && (
                        <>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Box display="flex" alignItems="center">
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <Person />
                                    </Avatar>
                                    <Box ml={2}>
                                        <Typography>Anonymous</Typography>
                                        <Box display="flex" gap={1} mt={1}>
                                            {chatInfo.partnerInterests?.map((interest, i) => (
                                                <Chip key={i} label={interest} size="small" />
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <TimerOutlined />
                                    <Typography ml={1}>{formatTime(timeLeft)}</Typography>
                                    <IconButton onClick={leaveChat} sx={{ ml: 1 }}>
                                        <Close />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Box sx={{ height: 300, overflowY: 'auto', mb: 2, p: 1, border: '1px solid #eee' }}>
                                {messages.length === 0 ? (
                                    <Typography color="text.secondary" textAlign="center" py={4}>
                                        Say hello to start the conversation!
                                    </Typography>
                                ) : (
                                    messages.map((msg) => (
                                        <Box
                                            key={msg.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: msg.isPartner ? 'flex-start' : 'flex-end',
                                                alignItems: 'center',
                                                mb: 2,
                                            }}
                                        >
                                            {msg.isPartner && matchedUserProfile && (
                                                <Avatar
                                                    src={matchedUserProfile.avatar}
                                                    alt={matchedUserProfile.name}
                                                    sx={{ width: 32, height: 32, mr: 1, cursor: 'pointer' }}
                                                    onClick={handleAvatarClick}
                                                />
                                            )}
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    maxWidth: '70%',
                                                    bgcolor: msg.isPartner ? 'action.selected' : 'primary.main',
                                                    color: msg.isPartner ? 'text.primary' : 'primary.contrastText',
                                                }}
                                            >
                                                <Typography>{msg.text}</Typography>
                                                <Typography variant="caption" display="block" textAlign="right">
                                                    {msg.timestamp.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                                )}
                            </Box>

                            <Box display="flex" alignItems="center">
                                <TextField
                                    fullWidth
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    sx={{ mr: 1 }}
                                />
                                <IconButton onClick={sendMessage} disabled={!message.trim()}>
                                    <Send />
                                </IconButton>
                            </Box>

                            <Box display="flex" justifyContent="center" mt={2}>
                                <Button variant="outlined" startIcon={<FavoriteBorder />} onClick={likePartner}>
                                    Like Partner
                                </Button>
                            </Box>
                        </>
                    )}

                    {status === 'matched' && (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h5" color="primary" gutterBottom>
                                It's a Match!
                            </Typography>
                            <Typography>You and your partner liked each other!</Typography>
                            <Button variant="contained" sx={{ mt: 3 }} onClick={() => setMatchDialog(true)}>
                                View Match Details
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!matchDialog} onClose={() => setMatchDialog(false)}>
                <DialogTitle>Match Details</DialogTitle>
                <DialogContent>
                    {matchDialog && (
                        <>
                            {matchedUserProfile ? (
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <Avatar src={matchedUserProfile.avatar} alt={matchedUserProfile.name} sx={{ width: 56, height: 56, cursor: 'pointer' }} onClick={handleAvatarClick} />
                                    <Typography variant="h6">{matchedUserProfile.name}</Typography>
                                </Box>
                            ) : (
                                <Typography>You matched with user: {matchDialog.partnerId}</Typography>
                            )}
                            <Typography sx={{ mt: 2 }}>Shared interests:</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                {matchDialog.sharedInterests?.map((interest, i) => (
                                    <Chip key={i} label={interest} />
                                ))}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMatchDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Profile Drawer for other user */}
            <Drawer anchor="right" open={profileDrawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: 400, p: 3 }} role="presentation">
                    {matchedUserProfile ? (
                        <>
                            {/* Show all images */}
                            {matchedUserImages.length > 0 && (
                                <Box>
                                    {matchedUserImages.map((image, idx) => (
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
                                                    <Star color="warning" sx={{ fontSize: '1rem', mr: 0.5 }} />
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
                                    {matchedUserProfile.name || 'N/A'}, {calculateAge(matchedUserProfile.dob)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOn fontSize="small" />
                                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                                        {matchedUserProfile.location || 'Unknown location'}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {matchedUserProfile.bio || 'No bio available'}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Basics
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {matchedUserProfile.school && (
                                        <Chip icon={<School />} label={matchedUserProfile.school} variant="outlined" />
                                    )}
                                    {matchedUserProfile.job && (
                                        <Chip icon={<Work />} label={matchedUserProfile.job} variant="outlined" />
                                    )}
                                    {matchedUserProfile.needs && (
                                        <Chip
                                            label={`Looking for: ${matchedUserProfile.needs.replace(/([A-Z])/g, ' $1')}`}
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Interests
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {processProfileData(matchedUserProfile).map((item, index) => (
                                        <Chip
                                            key={index}
                                            label={item.label}
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Typography>Loading profile...</Typography>
                    )}
                    <Button onClick={handleDrawerClose} sx={{ mt: 3 }} fullWidth variant="outlined">Close</Button>
                </Box>
            </Drawer>
        </Box>
    );
};

export default QuickChat;
