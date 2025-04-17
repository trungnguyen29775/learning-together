import React, { useContext, useEffect, useState } from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import instance from '../axios/instance';
import StateContext from '../context/context.context';

const Notification = ({ avatarSrc, notificationContent }) => {
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
            <Avatar src={avatarSrc} alt={''} sx={{ marginRight: '10px' }} />
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
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
