import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Avatar,
    TextField,
    IconButton,
    Badge,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Send, Favorite, FavoriteBorder, TimerOutlined, Person, Close } from '@mui/icons-material';

const QuickChat = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 phút = 600 giây
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [liked, setLiked] = useState(false);
    const [partnerLiked, setPartnerLiked] = useState(false);
    const [isMatched, setIsMatched] = useState(false);
    const [showMatchDialog, setShowMatchDialog] = useState(false);

    // Mock function để tìm người chat
    const findChatPartner = () => {
        setIsSearching(true);
        // Giả lập tìm kiếm trong 2-5 giây
        setTimeout(() => {
            setIsSearching(false);
            setIsChatting(true);
            startTimer();
            // Thêm một tin nhắn mẫu từ đối tác
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: 2,
                        text: 'Xin chào! Bạn thế nào?',
                        isPartner: true,
                        timestamp: new Date(),
                    },
                ]);
            }, 1000);
        }, 3000);
    };

    const startTimer = () => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages((prev) => [
                ...prev,
                {
                    id: 1,
                    text: message,
                    isPartner: false,
                    timestamp: new Date(),
                },
            ]);
            setMessage('');
        }
    };

    const handleLike = () => {
        setLiked(true);
        // Giả lập 50% khả năng đối tác cũng like
        if (Math.random() > 0.5) {
            setPartnerLiked(true);
            setIsMatched(true);
            setShowMatchDialog(true);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleCloseChat = () => {
        setIsChatting(false);
        setTimeLeft(600);
        setMessages([]);
        setLiked(false);
        setPartnerLiked(false);
    };

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto', mt: 4, height: '80%' }}>
            <Card>
                <CardContent>
                    {!isSearching && !isChatting && (
                        <>
                            <Typography variant="h5" gutterBottom textAlign="center">
                                Chat Nhanh Ẩn Danh
                            </Typography>
                            <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
                                Trò chuyện ngẫu nhiên trong 10 phút. Nếu cả hai thích nhau, các bạn sẽ được kết nối!
                            </Typography>
                            <Box display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={findChatPartner}
                                    startIcon={<Person />}
                                >
                                    Bắt đầu chat
                                </Button>
                            </Box>
                        </>
                    )}

                    {isSearching && (
                        <Box textAlign="center" py={4}>
                            <CircularProgress size={60} />
                            <Typography variant="h6" mt={2}>
                                Đang tìm kiếm đối tác chat...
                            </Typography>
                        </Box>
                    )}

                    {isChatting && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box display="flex" alignItems="center">
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <Person />
                                    </Avatar>
                                    <Typography variant="subtitle1" ml={1}>
                                        Người lạ
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <TimerOutlined color="action" />
                                    <Typography variant="body2" ml={1}>
                                        {formatTime(timeLeft)}
                                    </Typography>
                                    <IconButton onClick={handleCloseChat} size="small" sx={{ ml: 1 }}>
                                        <Close />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    height: 300,
                                    overflowY: 'auto',
                                    p: 2,
                                    border: '1px solid #eee',
                                    borderRadius: 1,
                                    mb: 2,
                                }}
                            >
                                {messages.map((msg, index) => (
                                    <Box
                                        key={index}
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
                                            <Typography variant="body1">{msg.text}</Typography>
                                            <Typography variant="caption" display="block" textAlign="right">
                                                {msg.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            <Box display="flex" alignItems="center">
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    sx={{ mr: 1 }}
                                />
                                <IconButton color="primary" onClick={handleSendMessage} disabled={!message.trim()}>
                                    <Send />
                                </IconButton>
                            </Box>

                            <Box display="flex" justifyContent="center" mt={2}>
                                <Button
                                    variant={liked ? 'contained' : 'outlined'}
                                    color="error"
                                    startIcon={liked ? <Favorite /> : <FavoriteBorder />}
                                    onClick={handleLike}
                                    disabled={liked || timeLeft === 0}
                                >
                                    {liked ? 'Đã thích' : 'Thích'}
                                </Button>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialog khi match */}
            <Dialog open={showMatchDialog} onClose={() => setShowMatchDialog(false)}>
                <DialogTitle>🎉 Match thành công!</DialogTitle>
                <DialogContent>
                    <Typography>Cả hai đã thích nhau! Giờ bạn có thể xem thông tin và tiếp tục trò chuyện.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowMatchDialog(false)}>Đóng</Button>
                    <Button variant="contained" color="primary">
                        Xem hồ sơ
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuickChat;
