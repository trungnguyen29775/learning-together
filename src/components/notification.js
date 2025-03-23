import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const Notification = ({ avatarSrc, username, notificationContent }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #e0e0e0',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: '#f5f5f5',
                },
                marginTop: '8px',
            }}
        >
            <Avatar src={avatarSrc} alt={username} sx={{ marginRight: '10px' }} />
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {notificationContent}
                </Typography>
            </Box>
        </Box>
    );
};

Notification.propTypes = {
    avatarSrc: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    notificationContent: PropTypes.string.isRequired,
};

export default Notification;
