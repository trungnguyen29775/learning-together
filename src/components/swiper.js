import React, { useContext, useEffect, useState, useRef } from 'react';
import { Box, Typography, Chip, Snackbar, Alert, IconButton, useTheme, useMediaQuery, Avatar } from '@mui/material';
import { Star, Favorite, Close, School, Work, LocationOn, FavoriteBorder } from '@mui/icons-material';
import StateContext from '../context/context.context';
import instance from '../axios/instance';
import { motion, useAnimation } from 'framer-motion';

const TinderCards = () => {
    const [state] = useContext(StateContext);
    const [profiles, setProfiles] = useState([]);
    const [userImages, setUserImages] = useState({});
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const controls = useAnimation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const scrollContainerRef = useRef(null);

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

    useEffect(() => {
        async function fetchRecommendations() {
            if (!state.login) return;
            try {
                // Fetch recommended users from Node.js backend
                const res = await instance.post('/api/recommend', {
                    user_id: state.userData.user_id,
                });
                let recommended = res.data.recommendations || [];
                // Sort by score (accuracy) descending
                recommended = recommended.sort((a, b) => (b.score || 0) - (a.score || 0));
                setProfiles(recommended);

                // Fetch images for recommended users
                const imagePromises = recommended.map((profile) =>
                    instance
                        .get(`/user-image/get-user-images/${profile.user_id}`)
                        .then((response) => ({
                            user_id: profile.user_id,
                            images: response.data,
                        }))
                        .catch(() => ({
                            user_id: profile.user_id,
                            images: [],
                        })),
                );

                const results = await Promise.all(imagePromises);
                const imagesMap = {};
                results.forEach((result) => {
                    imagesMap[result.user_id] = result.images;
                });
                setUserImages(imagesMap);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError('Failed to load recommended profiles');
            }
        }
        fetchRecommendations();
    }, [state.userData, state.login]);

    const handleAction = async (type) => {
        await controls.start({
            x: type === 'like' ? 500 : -500,
            opacity: 0,
            transition: { duration: 0.3 },
        });

        if (type === 'like') {
            try {
                // Store like for learning in Node.js backend
                await instance.post('/api/like', {
                    user_id: state.userData.user_id,
                    liked_user_id: profiles[currentIndex].user_id,
                });
                setSnackbar({
                    open: true,
                    message: `❤️ You liked ${profiles[currentIndex]?.name}!`,
                    severity: 'info',
                });
            } catch (err) {
                console.log(err);
                setSnackbar({
                    open: true,
                    message: 'An error occurred, please try again!',
                    severity: 'error',
                });
            }
        } else {
            setSnackbar({
                open: true,
                message: 'You skipped this person ❌',
                severity: 'error',
            });
        }

        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
            controls.start({
                x: 0,
                opacity: 1,
                transition: { duration: 0 },
            });
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
            }
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const getCurrentProfileImages = () => {
        if (!profiles[currentIndex]) return [];
        const currentProfile = profiles[currentIndex];
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

    const isCurrentImageFeatured = (image) => {
        return image?.is_featured || false;
    };

    const handleSwipe = async (info) => {
        const threshold = 50;
        const velocity = 500;

        if (info.offset.x > threshold || info.velocity.x > velocity) {
            await handleAction('like');
        } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
            await handleAction('skip');
        }
    };

    const renderProfileInfo = () => {
        if (!profiles[currentIndex]) return null;

        // Calculate accuracy percentage based on score
        const profile = profiles[currentIndex];
        if (!profile) return null;
        // Assume max score is hobbyKeys.length + 1 (for like boost)
        const maxScore = 22; // 21 hobbies + 1 like boost
        const accuracy = profile.score ? Math.round((profile.score / maxScore) * 100) : 0;
        return (
            <Box
                sx={{
                    width: '100%',
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '0 0 24px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {profile.name || 'N/A'}, {calculateAge(profile.dob)}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                        Người này hợp với bạn đến {accuracy}%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOn fontSize="small" />
                        <Typography variant="body1" sx={{ ml: 0.5 }}>
                            {profile.location || 'Unknown location'}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {profile.bio || 'No bio available'}
                    </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Basics
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {profile.school && (
                            <Chip icon={<School />} label={profile.school} variant="outlined" />
                        )}
                        {profile.job && (
                            <Chip icon={<Work />} label={profile.job} variant="outlined" />
                        )}
                        {profile.needs && (
                            <Chip
                                label={`Looking for: ${profile.needs.replace(/([A-Z])/g, ' $1')}`}
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Interests
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {processProfileData(profile).map((item, index) => (
                            <Chip
                                key={index}
                                label={item.label}
                                sx={{
                                    backgroundColor: theme.palette.primary.light,
                                    color: theme.palette.primary.contrastText,
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                width: '600px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f8f8f8',
                position: 'relative',
                overflow: 'hidden',
                alignItems: 'center',

            }}
        >
            {error ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : currentIndex <= profiles.length - 1 ? (
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => handleSwipe(info)}
                    animate={controls}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        
                    }}
                >
                    <Box
                        ref={scrollContainerRef}
                        sx={{
                            width: '100%',
                            height: '100%',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        {/* Hiển thị ảnh đầu tiên */}
                        {getCurrentProfileImages().length > 0 && (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100vh',
                                    position: 'relative',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundImage: `url(${getCurrentProfileImages()[0].path})`,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '40%',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                    }}
                                />

                                {isCurrentImageFeatured(getCurrentProfileImages()[0]) && (
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

                        {/* Hiển thị thông tin cá nhân ngay sau ảnh đầu tiên */}
                        {renderProfileInfo()}

                        {/* Hiển thị các ảnh còn lại */}
                        {getCurrentProfileImages()
                            .slice(1)
                            .map((image, index) => (
                                <Box
                                    key={index + 1}
                                    sx={{
                                        width: '100%',
                                        height: '70vh',
                                        position: 'relative',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundImage: `url(${image.path})`,
                                        mt: 2,
                                    }}
                                >
                                    {isCurrentImageFeatured(image) && (
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
                </motion.div>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: '24px',
                    }}
                >
                    <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                        No more profiles
                    </Typography>
                    <Typography variant="body1">
                        You've seen all available profiles. Check back later or adjust your preferences.
                    </Typography>
                </Box>
            )}

            {currentIndex <= profiles.length - 1 && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '32px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 4,
                        zIndex: 10,
                    }}
                >
                    <IconButton
                        onClick={() => handleAction('skip')}
                        sx={{
                            backgroundColor: 'white',
                            width: '60px',
                            height: '60px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: '#ffeeee',
                            },
                        }}
                    >
                        <Close sx={{ color: theme.palette.error.main, fontSize: '32px' }} />
                    </IconButton>
                    <IconButton
                        onClick={() => handleAction('like')}
                        sx={{
                            backgroundColor: 'white',
                            width: '60px',
                            height: '60px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: '#eeffee',
                            },
                        }}
                    >
                        <Favorite sx={{ color: theme.palette.success.main, fontSize: '32px' }} />
                    </IconButton>
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TinderCards;
