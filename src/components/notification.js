
import React from 'react';
import { Box, Avatar, Typography, Button, Drawer, Chip } from '@mui/material';
import { Star, School, Work, LocationOn } from '@mui/icons-material';
import PropTypes from 'prop-types';
import instance from '../axios/instance';

const Notification = ({ notification, onAction }) => {
    const handleAction = async (action) => {
        try {
            const res = await instance.post('/update-friendship-from-notification', {
                notification_id: notification.id,
                action: action,
                senderId: notification.sender_id,
                receiverId: notification.receiver_id,
            });
            if (onAction) {
                onAction(notification, action, res.data);
            }
        } catch (error) {
            console.error('Failed to update friendship from notification:', error);
            // Optionally, show error to user
        }
    };

    // Always use otherUserAvt and otherUserName for avatar and name display, fallback to img_path if needed
    // If not present, fallback to sender info
    const avatarSrc = notification.otherUserAvt || notification.img_path || notification.senderAvt || '';
    const otherUserName = notification.otherUserName || notification.senderName || '';

    const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
    const [selectedProfile, setSelectedProfile] = React.useState(null);
    const [selectedProfileImages, setSelectedProfileImages] = React.useState([]);
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
        if (!notification.sender_id) {
            setSelectedProfile(null);
            setSelectedProfileImages([]);
            setProfileDrawerOpen(true);
            return;
        }
        try {
            const res = await instance.get(`/get-profile/${notification.sender_id}`);
            setSelectedProfile(res.data.user);
            // Fetch all images for the user
            const imgRes = await instance.get(`/user-image/get-user-images/${notification.sender_id}`);
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
    };
    const handleDrawerClose = () => {
        setProfileDrawerOpen(false);
    };
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #e0e0e0',
                    marginTop: '8px',
                    gap: 2,
                }}
            >
                <Avatar src={avatarSrc} alt={otherUserName || 'User'} sx={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleAvatarClick} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {notification.text}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {otherUserName || 'User'}
                    </Typography>
                </Box>
                {notification.status === 'action_required' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="success" size="small" onClick={() => handleAction('accepted')}>
                            Accept
                        </Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleAction('rejected')}>
                            Reject
                        </Button>
                    </Box>
                )}
            </Box>
            <Drawer anchor="right" open={profileDrawerOpen} onClose={handleDrawerClose}>
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
                                    {selectedProfile.name || 'N/A'}, {calculateAge(selectedProfile.dob)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOn fontSize="small" />
                                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                                        {selectedProfile.location || 'Unknown location'}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {selectedProfile.bio || 'No bio available'}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Basics
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {selectedProfile.school && (
                                        <Chip icon={<School />} label={selectedProfile.school} variant="outlined" />
                                    )}
                                    {selectedProfile.job && (
                                        <Chip icon={<Work />} label={selectedProfile.job} variant="outlined" />
                                    )}
                                    {selectedProfile.needs && (
                                        <Chip
                                            label={`Looking for: ${selectedProfile.needs.replace(/([A-Z])/g, ' $1')}`}
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Interests
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {processProfileData(selectedProfile).map((item, index) => (
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
        </>
    );
};

Notification.propTypes = {
    notification: PropTypes.object.isRequired,
    onAction: PropTypes.func,
};

export default Notification;
