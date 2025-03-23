import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Typography, List, ListItem, Avatar, TextField, IconButton, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';
import instance from '../axios/instance';
import StateContext from '../context/context.context';
import { socket } from '../socket';

const Message = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [state] = useContext(StateContext);
    const messagesEndRef = useRef(null); // Tham chiếu đến phần tử cuối cùng

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

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
    useEffect(() => {
        const handleReceivedMessage = ({ senderId, message, chat_rooms_id }) => {
            if (chat_rooms_id === selectedChatRoomId) {
                setChatMessages((prev) => [...prev, { sender: senderId, content: message }]);
            }
        };

        socket.on('received-message', handleReceivedMessage);

        return () => {
            socket.off('received-message', handleReceivedMessage);
        };
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
                        <>
                            <Avatar
                                src={
                                    selectedUser.avt_file_path ||
                                    'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'
                                }
                                alt={selectedUser.name}
                                sx={{ marginRight: '10px', border: '2px solid #0084ff' }}
                            />
                            <Typography variant="h6">{selectedUser.name}</Typography>
                        </>
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
                                    justifyContent: msg.sender === state.userData.user_id ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <Typography
                                    sx={msg.sender === state.userData.user_id ? messageStyle : otherMessageStyle}
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
        </Box>
    );
};

export default Message;
