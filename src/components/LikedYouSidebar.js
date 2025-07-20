import React, { useEffect, useState, useContext } from 'react';
import { Drawer, Box, Typography, IconButton, Button, Chip } from '@mui/material';
import { Close, Star, School, Work, LocationOn, Favorite, Clear } from '@mui/icons-material';
import StateContext from '../context/context.context';
import instance from '../axios/instance';

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

const LikedYouSidebar = ({ open, onClose }) => {
    const [state] = useContext(StateContext);
    const [likedUsers, setLikedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userImages, setUserImages] = useState({});

    useEffect(() => {
        if (open && state.userData?.user_id) {
            setLoading(true);
            instance
                .get(`/get-liked-you/${state.userData.user_id}`)
                .then((res) => {
                    console.log('Liked users:', res.data);
                    setLikedUsers(res.data);
                    // Fetch images for each user
                    const imagePromises = res.data.map((profile) =>
                        instance
                            .get(`/user-image/get-user-images/${profile.user_id}`)
                            .then((response) => ({
                                user_id: profile.user_id,
                                images: response.data,
                            }))
                            .catch(() => ({ user_id: profile.user_id, images: [] }))
                    );
                    Promise.all(imagePromises).then((results) => {
                        const imagesMap = {};
                        results.forEach((result) => {
                            imagesMap[result.user_id] = result.images;
                        });
                        setUserImages(imagesMap);
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [open, state.userData?.user_id]);

    const handleAction = async (type) => {
        if (!likedUsers[currentIndex]) return;
        const targetUser = likedUsers[currentIndex];
        try {
            await instance.post('/create-friendship', {
                user_id: state.userData.user_id,
                friend_id: targetUser.user_id,
                status: type === 'like' ? 'liked' : 'rejected',
            });
        } catch (err) {}
        if (currentIndex < likedUsers.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
            setLikedUsers([]);
        }
    };

    const getCurrentProfileImages = () => {
        if (!likedUsers[currentIndex]) return [];
        const currentProfile = likedUsers[currentIndex];
        const images = userImages[currentProfile.user_id] || [];
        if (images.length === 0) {
            return [
                {
                    path:
                        currentProfile.avt_file_path ||
                        'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
                    is_featured: true,
                },
            ];
        }
        return images;
    };

    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 400, p: 3, height: '100vh', overflowY: 'auto', position: 'relative' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    People Who Liked You
                </Typography>
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : likedUsers.length === 0 ? (
                    <Typography>No one has liked you yet.</Typography>
                ) : (
                    <>
                        {/* Show images */}
                        {getCurrentProfileImages().length > 0 && (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '220px',
                                    position: 'relative',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundImage: `url(${getCurrentProfileImages()[0].path})`,
                                    borderRadius: 2,
                                }}
                            >
                                {getCurrentProfileImages()[0].is_featured && (
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
                        )}
                        {/* Profile info */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                {likedUsers[currentIndex]?.name || 'N/A'}, {calculateAge(likedUsers[currentIndex]?.dob)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LocationOn fontSize="small" />
                                <Typography variant="body1" sx={{ ml: 0.5 }}>
                                    {likedUsers[currentIndex]?.location || 'Unknown location'}
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                {likedUsers[currentIndex]?.bio || 'No bio available'}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Basics
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {likedUsers[currentIndex]?.school && (
                                    <Chip icon={<School />} label={likedUsers[currentIndex].school} variant="outlined" />
                                )}
                                {likedUsers[currentIndex]?.job && (
                                    <Chip icon={<Work />} label={likedUsers[currentIndex].job} variant="outlined" />
                                )}
                                {likedUsers[currentIndex]?.needs && (
                                    <Chip
                                        label={`Looking for: ${likedUsers[currentIndex].needs.replace(/([A-Z])/g, ' $1')}`}
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Interests
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {processProfileData(likedUsers[currentIndex]).map((item, index) => (
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
                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Clear />}
                                onClick={() => handleAction('reject')}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Favorite />}
                                onClick={() => handleAction('like')}
                            >
                                Match
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default LikedYouSidebar;
