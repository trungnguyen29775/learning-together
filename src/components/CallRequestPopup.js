
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Avatar, CircularProgress } from '@mui/material';
import Close from '@mui/icons-material/Close';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import instance from '../axios/instance';

const CallRequestPopup = ({ incomingCall, accepting, peerId, onAccept, onDecline }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Fetch featured avatar from userImage
    const fetchAvatar = useCallback(async () => {
        if (!incomingCall?.fromUser?.user_id) return;
        try {
            const res = await instance.get(`/user-image/get-user-images/${incomingCall.fromUser.user_id}`);
            const images = res.data || [];
            const featured = images.find(img => img.is_featured) || images[0];
            setAvatarUrl(featured ? featured.path : null);
        } catch (err) {
            setAvatarUrl(null);
        }
    }, [incomingCall]);

    useEffect(() => {
        fetchAvatar();
    }, [fetchAvatar]);

    return (
        <Box sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3000,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 8,
            p: 4,
            minWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        }}>
            <Box sx={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                boxShadow: '0 4px 24px 0 rgba(33,150,243,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                position: 'relative',
                background: 'white',
            }}>
                <Avatar
                    src={avatarUrl || incomingCall.fromUser?.avt_file_path || 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'}
                    alt={incomingCall.fromUser?.name || 'Avatar'}
                    sx={{ width: 90, height: 90, border: '3px solid #1976d2' }}
                />
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: '#1976d2',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: 2,
                }}>
                    {incomingCall.type === 'video' ? <VideocamIcon fontSize="small" /> : <CallIcon fontSize="small" />}
                </Box>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1976d2', textAlign: 'center' }}>
                {incomingCall.fromUser?.name || 'Người dùng'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: '#333', textAlign: 'center' }}>
                đang gọi bạn
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} thickness={5} sx={{ color: '#1976d2' }} />
                <Typography variant="caption" sx={{ color: '#1976d2' }}>Đang đổ chuông...</Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 1, width: 180, fontWeight: 600, fontSize: 16, borderRadius: 2, boxShadow: 2 }}
                onClick={onAccept}
                disabled={accepting || !peerId}
            >
                {peerId ? 'Chấp nhận' : 'Đang kết nối...'}
            </Button>
            <Button
                variant="outlined"
                color="error"
                startIcon={<Close />}
                onClick={onDecline}
                sx={{ width: 180, fontWeight: 600, fontSize: 16, borderRadius: 2 }}
            >
                Từ chối
            </Button>
        </Box>
    );
};

export default CallRequestPopup;
