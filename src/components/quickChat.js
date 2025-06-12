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
} from '@mui/material';
import { Send, Favorite, FavoriteBorder, TimerOutlined, Person, Close } from '@mui/icons-material';
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
                                                mb: 2,
                                            }}
                                        >
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
                            <Typography>You matched with user: {matchDialog.partnerId}</Typography>
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
                    <Button variant="contained">View Profile</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuickChat;
