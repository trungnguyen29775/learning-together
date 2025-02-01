import React, { useState } from 'react';
import { Box, Typography, List, ListItem, Avatar, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';

const users = [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Alice Brown', avatar: 'https://i.pravatar.cc/150?img=3' },
];

const messages = {
    1: [
        { sender: 'self', text: 'Hi John!' },
        { sender: 'John Doe', text: 'Hello!' },
    ],
    2: [
        { sender: 'self', text: 'Hey Jane!' },
        { sender: 'Jane Smith', text: 'Hi there!' },
    ],
    3: [
        { sender: 'self', text: 'Hello Alice!' },
        { sender: 'Alice Brown', text: 'Hey!' },
    ],
};

const Message = () => {
    const [selectedUser, setSelectedUser] = useState(users[0].id); // Default: First user
    const [chatMessages, setChatMessages] = useState(messages);
    const [messageInput, setMessageInput] = useState('');

    const handleSelectUser = (userId) => {
        setSelectedUser(userId);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        const newMessage = { sender: 'self', text: messageInput };
        setChatMessages({
            ...chatMessages,
            [selectedUser]: [...(chatMessages[selectedUser] || []), newMessage],
        });
        setMessageInput(''); // Clear input
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100%',
                bgcolor: 'whitesmoke',
                width: '100%',
                height: '100%',
            }}
        >
            <Box
                sx={{
                    width: '25%',
                    bgcolor: 'white',
                    borderRight: '1px solid lightgray',
                    overflowY: 'auto',
                }}
            >
                <Typography variant="h6" sx={{ padding: '10px', fontWeight: 'bold' }}>
                    Contacts
                </Typography>
                <List>
                    {users.map((user) => (
                        <ListItem
                            key={user.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                bgcolor: selectedUser === user.id ? 'hsl(210deg 100% 95%)' : 'transparent',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'lightgray',
                                },
                            }}
                            onClick={() => handleSelectUser(user.id)}
                        >
                            <Avatar src={user.avatar} alt={user.name} />
                            <Typography sx={{ marginLeft: '10px' }}>{user.name}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box
                sx={{
                    width: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                }}
            >
                <Box
                    sx={{
                        padding: '10px',
                        bgcolor: 'white',
                        borderBottom: '1px solid lightgray',
                        width: '100%',
                    }}
                >
                    <Typography variant="h6">{users.find((user) => user.id === selectedUser)?.name}</Typography>
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        padding: '10px',
                        overflowY: 'auto',
                        bgcolor: '#f9f9f9',
                    }}
                >
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
