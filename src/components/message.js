import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, Avatar, TextField, IconButton, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';
import instance from '../axios/instance';
import StateContext from '../context/context.context';

const Message = () => {
    const [users, setUsers] = useState([]); // Danh sách người dùng từ API
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [state, dispatchState] = useContext(StateContext);
    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const response = await instance.get(`/get-chat-feature/${state.userData.user_id}`);
                console.log(response.data);
                setUsers(response.data);
                setSelectedUser(response.data[0]?.user_id || null);
            } catch (error) {
                console.error('Error fetching chat users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatUsers();
    }, []);

    const handleSelectUser = (userId) => {
        setSelectedUser(userId);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedUser) return;
        const newMessage = { sender: 'self', text: messageInput };

        setChatMessages((prev) => ({
            ...prev,
            [selectedUser]: [...(prev[selectedUser] || []), newMessage],
        }));

        setMessageInput('');
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'whitesmoke' }}>
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
                                    bgcolor: selectedUser === user.user_id ? 'hsl(210deg 100% 95%)' : 'transparent',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'lightgray' },
                                }}
                                onClick={() => handleSelectUser(user.user_id)}
                            >
                                <Avatar src={user.avatar} alt={user.username} />
                                <Typography sx={{ marginLeft: '10px' }}>{user.username}</Typography>
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
                <Box sx={{ padding: '10px', bgcolor: 'white', borderBottom: '1px solid lightgray' }}>
                    <Typography variant="h6">
                        {users.find((user) => user.user_id === selectedUser)?.username || 'Select a chat'}
                    </Typography>
                </Box>

                {/* Tin nhắn */}
                <Box sx={{ flexGrow: 1, padding: '10px', overflowY: 'auto', bgcolor: '#f9f9f9' }}>
                    {chatMessages[selectedUser]?.map((msg, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.sender === 'self' ? 'flex-end' : 'flex-start',
                                margin: '5px 0',
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: '70%',
                                    padding: '10px',
                                    bgcolor: 'white',
                                    color: 'black',
                                    borderRadius: '10px',
                                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                                }}
                            >
                                {msg.text}
                            </Box>
                        </Box>
                    ))}
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
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <IconButton onClick={handleSendMessage}>
                        <Send />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default Message;
