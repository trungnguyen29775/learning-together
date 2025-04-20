import React, { useContext, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Box, Snackbar, Alert, Button, IconButton } from '@mui/material';
import StateContext from '../context/context.context';
import instance from '../axios/instance';
import { motion } from 'framer-motion';
import { Star, NavigateBefore, NavigateNext } from '@mui/icons-material';

const TinderCards = () => {
    const [state] = useContext(StateContext);
    const [profiles, setProfiles] = useState([]);
    const [userImages, setUserImages] = useState({});
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [animate, setAnimate] = useState({ x: 0, opacity: 1 });

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
        console.log(profile);
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
            label: hobby,
            status: true,
        }));
    }

    useEffect(() => {
        if (state.login) {
            // Load all user profiles
            instance
                .post('/get-all-user', { user_id: state.userData.user_id })
                .then((res) => {
                    setProfiles(res.data);

                    // Load images for each user
                    const imagePromises = res.data.map((profile) =>
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

                    Promise.all(imagePromises).then((results) => {
                        const imagesMap = {};
                        results.forEach((result) => {
                            imagesMap[result.user_id] = result.images;
                        });
                        setUserImages(imagesMap);
                    });
                })
                .catch((err) => {
                    console.error('Error fetching profiles:', err);
                    setError('Failed to load profiles');
                });
        }
    }, [state.userData.user_id, state.login]);

    const handleNextImage = () => {
        const currentProfile = profiles[currentIndex];
        const images = userImages[currentProfile?.user_id] || [];
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const handlePrevImage = () => {
        const currentProfile = profiles[currentIndex];
        const images = userImages[currentProfile?.user_id] || [];
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const handleAction = (type) => {
        setAnimate({ x: type === 'like' ? 300 : -300, opacity: 0 });

        if (type === 'like') {
            instance
                .post('/create-friendship', {
                    user_id: state.userData.user_id,
                    friend_id: profiles[currentIndex].user_id,
                })
                .then((res) => {
                    if (res.status === 200) {
                        setSnackbar({
                            open: true,
                            message: '🎉 Chúc mừng, hai bạn đã match với nhau! 🎉',
                            severity: 'success',
                        });
                        instance.post('/create-notification', {
                            type: 'matched',
                            data: {
                                user_id: state.userData.user_id,
                                friend_id: profiles[currentIndex].user_id,
                                currentName: state.userData.name,
                                targetName: profiles[currentIndex].name,
                                currentAvtFilePath: state.userData.avt_file_path,
                                targetAvtFilePath: profiles[currentIndex].avt_file_path,
                            },
                        });
                    } else if (res.status === 201) {
                        setSnackbar({
                            open: true,
                            message: `❤️ Bạn đã thích ${profiles[currentIndex]?.name}!`,
                            severity: 'info',
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setSnackbar({
                        open: true,
                        message: 'Đã xảy ra lỗi, vui lòng thử lại!',
                        severity: 'error',
                    });
                });
        } else {
            instance
                .post('/create-friendship', {
                    user_id: state.userData.user_id,
                    friend_id: profiles[currentIndex].user_id,
                    status: 'skipped',
                })
                .then((res) => {
                    if (res.status === 201) {
                        setSnackbar({
                            open: true,
                            message: 'Bạn đã bỏ qua người này ❌',
                            severity: 'error',
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setSnackbar({
                        open: true,
                        message: 'Đã xảy ra lỗi, vui lòng thử lại!',
                        severity: 'error',
                    });
                });
        }

        setTimeout(() => {
            if (currentIndex <= profiles.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setCurrentImageIndex(0); // Reset image index when moving to next profile
                setAnimate({ x: 0, opacity: 1 });
            }
        }, 500);
    };

    const getCurrentImage = () => {
        if (!profiles[currentIndex]) return null;

        const currentProfile = profiles[currentIndex];
        const images = userImages[currentProfile.user_id] || [];

        // If user has uploaded images
        if (images.length > 0) {
            const currentImage = images[currentImageIndex] || images.find((img) => img.is_featured) || images[0];
            return currentImage?.path;
        }

        // Fallback to avatar or default image
        return (
            currentProfile.avt_file_path ||
            'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J'
        );
    };

    const getCurrentProfileImagesCount = () => {
        const currentProfile = profiles[currentIndex];
        if (!currentProfile) return 0;
        return userImages[currentProfile.user_id]?.length || 0;
    };

    const isCurrentImageFeatured = () => {
        const currentProfile = profiles[currentIndex];
        if (!currentProfile) return false;
        const images = userImages[currentProfile.user_id] || [];
        return images[currentImageIndex]?.is_featured || false;
    };

    return (
        <div
            className="tinderCards"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginBottom: '50px',
            }}
        >
            {error ? (
                <Typography color="error">{error}</Typography>
            ) : currentIndex <= profiles.length - 1 ? (
                <motion.div animate={animate} transition={{ duration: 0.5 }}>
                    <Card
                        sx={{
                            width: 500,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            marginTop: '114px',
                        }}
                    >
                        <Box sx={{ position: 'relative', height: 400 }}>
                            <CardMedia
                                sx={{ height: '100%' }}
                                image={getCurrentImage()}
                                title={profiles[currentIndex]?.name || 'Profile Image'}
                            />

                            {/* Navigation arrows */}
                            {getCurrentProfileImagesCount() > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                            },
                                        }}
                                    >
                                        <NavigateBefore />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                            },
                                        }}
                                    >
                                        <NavigateNext />
                                    </IconButton>
                                </>
                            )}

                            {/* Featured image indicator */}
                            {isCurrentImageFeatured() && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Star color="warning" sx={{ fontSize: '1rem', mr: 0.5 }} />
                                    <Typography variant="caption">Ảnh đại diện</Typography>
                                </Box>
                            )}

                            {/* Image counter */}
                            {getCurrentProfileImagesCount() > 1 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 10,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        padding: '2px 10px',
                                        borderRadius: '20px',
                                    }}
                                >
                                    <Typography variant="caption">
                                        {currentImageIndex + 1}/{getCurrentProfileImagesCount()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography gutterBottom variant="h5" component="div">
                                Name: {profiles[currentIndex]?.name || 'N/A'}
                            </Typography>
                            <Typography gutterBottom variant="h6" component="div">
                                Age: {calculateAge(profiles[currentIndex]?.dob)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Slogan: {profiles[currentIndex]?.slogan || 'No slogan available'}
                            </Typography>
                            <Typography variant="body2">
                                🎓 School: {profiles[currentIndex]?.school || 'Unknown'}
                            </Typography>
                            <Typography variant="body2">
                                📖 Major: {profiles[currentIndex]?.major || 'Unknown'}
                            </Typography>
                            <Typography variant="body2">
                                🔍 Looking for:{' '}
                                {profiles[currentIndex]?.needs
                                    ? profiles[currentIndex].needs.replace(/([A-Z])/g, ' $1')
                                    : 'Unknown'}
                            </Typography>

                            <Typography sx={{ marginTop: '10px' }}>Sở thích:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                                {processProfileData(profiles[currentIndex]).map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item.label}
                                        sx={{ margin: '5px', backgroundColor: 'hsl(210deg 100% 95%)' }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <Typography variant="h5" color="text.secondary">
                    Đã hết người dùng
                </Typography>
            )}

            {currentIndex <= profiles.length - 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleAction('skip')}
                        sx={{ marginRight: '10px' }}
                    >
                        Skip ❌
                    </Button>
                    <Button variant="contained" color="success" onClick={() => handleAction('like')}>
                        Like ❤️
                    </Button>
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default TinderCards;
