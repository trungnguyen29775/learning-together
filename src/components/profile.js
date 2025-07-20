import React, { useContext, useEffect, useState, useRef } from 'react';
import {
    Box,
    Button,
    Card,
    Chip,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Divider,
    Tooltip,
    Fade,
    Slide,
    Grow,
    Zoom,
    CardMedia,
    CardActions,
    Container,
    useTheme, // Thêm useTheme vào danh sách import từ @mui/material
} from '@mui/material';
import {
    CloudUpload,
    Star,
    Delete,
    Edit,
    Close,
    Check,
    StarBorder,
    PhotoLibrary,
    Reorder,
    CheckCircle,
    PriorityHigh,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import instance from '../axios/instance';
import StateContext from '../context/context.context';
import { useNavigate } from 'react-router-dom';
const hobbiesList = [
    'anime',
    'badminton',
    'basketball',
    'beach',
    'eat',
    'exercise',
    'game',
    'hiking',
    'music',
    'pets',
    'pickelBall',
    'reading',
    'running',
    'sing',
    'travel',
    'walking',
];

const movieGenresList = ['action', 'detective', 'fantasy', 'horror', 'romance'];

const CloudinaryUploadWidget = ({ uwConfig, onUploadSuccess }) => {
    const uploadWidgetRef = useRef(null);
    const uploadButtonRef = useRef(null);
    const theme = useTheme();

    const handleUploadClick = () => {
        if (uploadWidgetRef.current) {
            uploadWidgetRef.current.open();
        }
    };

    useEffect(() => {
        const initializeUploadWidget = () => {
            if (window.cloudinary && uploadButtonRef.current) {
                uploadWidgetRef.current = window.cloudinary.createUploadWidget(uwConfig, (error, result) => {
                    if (!error && result && result.event === 'success') {
                        onUploadSuccess(result.info);
                    }
                });
            }
        };

        initializeUploadWidget();
    }, [uwConfig, onUploadSuccess]);

    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
                variant="contained"
                onClick={handleUploadClick}
                ref={uploadButtonRef}
                fullWidth
                startIcon={<CloudUpload />}
                sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                        boxShadow: theme.shadows[8],
                    },
                }}
            >
                <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                    Tải ảnh lên
                </Typography>
            </Button>
        </motion.div>
    );
};

const priorityOptions = [
    { label: 'Thấp', value: 1 },
    { label: 'Vừa', value: 2 },
    { label: 'Cao', value: 3 },
];

const Profile = () => {
    const [state] = useContext(StateContext);
    const [profileData, setProfileData] = useState({
        name: '',
        dob: '',
        sex: '',
        school: '',
        major: '',
        slogan: '',
        needs: '',
        favoriteHobbies: {},
        favoriteMovies: {},
    });
    const [priority, setPriority] = useState({
        hobbies: 1,
        movieGenres: 1,
        needs: 1,
        school: 1,
        location: 1,
    });
    const [userImages, setUserImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const cloudName = 'dmoqywl3c';
    const uploadPreset = 'learning-together';
    const theme = useTheme();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (state.userData) {
            loadProfileData();
            loadUserImages();
            loadPriority();
        }
    }, [state.userData]);

    const loadPriority = async () => {
        try {
            // Try to get existing priority settings
            const res = await instance.get(`/api/user-priority/${state.userData.user_id}`);
            if (res.data) {
                setPriority({
                    hobbies: res.data.hobbies || 1,
                    movieGenres: res.data.movieGenres || 1,
                    needs: res.data.needs || 1,
                    school: res.data.school || 1,
                    location: res.data.location || 1,
                });
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // If no priority settings exist yet, create them
                try {
                    const defaultPriorities = {
                        user_id: state.userData.user_id,
                        hobbies: 1,
                        movieGenres: 1,
                        needs: 1,
                        school: 1,
                        location: 1
                    };
                    
                    await instance.post('/api/user-priority', defaultPriorities);
                    setPriority(defaultPriorities);
                } catch (createError) {
                    console.error('Error creating default priorities:', createError);
                }
            } else {
                console.error('Error loading priorities:', error);
            }
            // Set default priorities in state regardless of error
            setPriority({
                hobbies: 1,
                movieGenres: 1,
                needs: 1,
                school: 1,
                location: 1,
            });
        }
    };

    const loadProfileData = () => {
        setProfileData({
            name: state.userData.name || '',
            dob: state.userData.dob ? state.userData.dob.split('T')[0] : '',
            sex: state.userData.sex || '',
            school: state.userData.school || '',
            major: state.userData.major || '',
            slogan: state.userData.slogan || '',
            needs: state.userData.needs || '',
            favoriteHobbies: hobbiesList.reduce(
                (acc, hobby) => ({
                    ...acc,
                    [hobby]: !!state.userData[hobby],
                }),
                {},
            ),
            favoriteMovies: movieGenresList.reduce(
                (acc, genre) => ({
                    ...acc,
                    [genre]: !!state.userData[genre],
                }),
                {},
            ),
        });
    };

    const loadUserImages = async () => {
        try {
            setLoading(true);
            const response = await instance.get(`/user-image/get-user-images/${state.userData.user_id}`);
            setUserImages(response.data || []);
        } catch (error) {
            console.error('Error loading user images:', error);
            showSnackbar('Failed to load images', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData({ ...profileData, [field]: value });
    };

    const toggleHobby = (hobby) => {
        setProfileData((prev) => ({
            ...prev,
            favoriteHobbies: {
                ...prev.favoriteHobbies,
                [hobby]: !prev.favoriteHobbies[hobby],
            },
        }));
    };

    const toggleMovieGenre = (genre) => {
        setProfileData((prev) => ({
            ...prev,
            favoriteMovies: {
                ...prev.favoriteMovies,
                [genre]: !prev.favoriteMovies[genre],
            },
        }));
    };

    const handleCloudinaryUpload = (info) => {
        setError('');
        setSuccess('');

        if (userImages.length >= 10) {
            setError('Bạn chỉ có thể tải lên tối đa 10 ảnh');
            return;
        }

        const newImage = {
            url: info.secure_url,
            publicId: info.public_id,
            is_featured: userImages.length === 0,
        };

        showSnackbar('Ảnh đã được tải lên thành công!', 'success');
        // Always reload images from server after upload
        loadUserImages();
    };

    const handleDeleteFromServer = async (imageId) => {
        try {
            await instance.delete('/user-image/delete-image', {
                data: { user_image_id: imageId },
            });
        } catch (err) {
            console.error('Error deleting image:', err);
            throw err;
        }
    };

    const handleDelete = async (index) => {
        try {
            setLoading(true);
            const newImages = [...userImages];
            const [removed] = newImages.splice(index, 1);
            console.log(removed);
            if (removed.user_image_id) {
                await handleDeleteFromServer(removed.user_image_id);
            }

            if (removed.is_featured && newImages.length > 0) {
                newImages[0].is_featured = true;
                if (newImages[0].user_image_id) {
                    await instance.post('/user-image/update-image', {
                        user_image_id: newImages[0].user_image_id,
                        is_featured: true,
                    });
                }
            }

            showSnackbar('Ảnh đã được xóa thành công', 'success');
            // Always reload images from server after delete
            await loadUserImages();
        } catch (err) {
            setError('Xóa ảnh không thành công');
            showSnackbar('Xóa ảnh không thành công', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSetFeatured = async (index) => {
        try {
            setLoading(true);
            const newImages = userImages.map((img, i) => ({
                ...img,
                is_featured: i === index,
            }));

            // Reset all featured images first
            await Promise.all(
                userImages.map((img) => {
                    if (img.user_image_id && img.is_featured) {
                        return instance.post('/user-image/update-image', {
                            user_image_id: img.user_image_id,
                            path: img.url || img.path,
                            is_featured: false,
                        });
                    }
                    return Promise.resolve();
                }),
            );

            // Set new featured image
            if (userImages[index].user_image_id) {
                await instance.post('/user-image/update-image', {
                    user_image_id: userImages[index].user_image_id,
                    path: userImages[index].url || userImages[index].path,
                    is_featured: true,
                });
            }

            showSnackbar('Đã cập nhật ảnh đại diện', 'success');
            // Always reload images from server after update
            await loadUserImages();
        } catch (err) {
            console.error('Error updating featured image:', err);
            setError('Cập nhật ảnh đại diện không thành công');
            showSnackbar('Cập nhật ảnh đại diện không thành công', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const newImages = [...userImages];
        const [reorderedItem] = newImages.splice(result.source.index, 1);
        newImages.splice(result.destination.index, 0, reorderedItem);
        setUserImages(newImages);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // Convert favoriteHobbies object to array of selected hobbies
            const selectedHobbies = Object.entries(profileData.favoriteHobbies)
                .filter(([_, isSelected]) => isSelected)
                .map(([hobby]) => hobby);
            // Convert favoriteMovies object to array of selected genres
            const selectedMovies = Object.entries(profileData.favoriteMovies)
                .filter(([_, isSelected]) => isSelected)
                .map(([genre]) => genre);
            // Prepare request body
            const requestBody = {
                user_id: state.userData.user_id,
                email: state.userData.email,
                name: profileData.name,
                dob: profileData.dob || null,
                sex: profileData.sex || '',
                school: profileData.school || '',
                major: profileData.major || '',
                slogan: profileData.slogan || '',
                needs: profileData.needs || '',
                favoriteHobbies: selectedHobbies || [],
                favoriteMovies: selectedMovies || [],
            };
            // Debug: log request body
            console.log('updateProfile requestBody:', requestBody);

            // Validate required fields
            const allowedNeeds = ['findTutor', 'studyBuddy', 'sharedHobby', ''];
            if (!requestBody.email) {
                showSnackbar('Email is required!', 'error');
                setLoading(false);
                return;
            }
            if (!allowedNeeds.includes(requestBody.needs)) {
                showSnackbar('Nhu cầu không hợp lệ!', 'error');
                setLoading(false);
                return;
            }

            // Compare current user data to new data
            const userData = state.userData;
            let profileChanged = false;
            if (
                userData.name !== requestBody.name ||
                (userData.dob ? userData.dob.split('T')[0] : '') !== requestBody.dob ||
                userData.sex !== requestBody.sex ||
                userData.school !== requestBody.school ||
                userData.major !== requestBody.major ||
                userData.slogan !== requestBody.slogan ||
                userData.needs !== requestBody.needs ||
                JSON.stringify(userData.favoriteHobbies || []) !== JSON.stringify(requestBody.favoriteHobbies) ||
                JSON.stringify(userData.favoriteMovies || []) !== JSON.stringify(requestBody.favoriteMovies)
            ) {
                profileChanged = true;
            }

            // Only update profile if changed
            if (profileChanged) {
                await instance.post('/update-profile', requestBody);
            }

            // Save priority (always)
            try {
                await instance.post('/api/user-priority', {
                    user_id: state.userData.user_id,
                    ...priority,
                });
            } catch (priorityError) {
                console.error('Error updating priority:', priorityError);
                showSnackbar('Cập nhật ưu tiên không thành công', 'error');
            }
            // Save images
            if (userImages.length > 0) {
                // Upload new images (only if url or path exists)
                const uploadPromises = userImages
                    .filter((img) => !img.user_image_id && (img.url || img.path))
                    .map((img) => {
                        return instance.post('/user-image/create-image', {
                            user_id: state.userData.user_id,
                            path: img.url || img.path,
                            is_featured: img.is_featured,
                        });
                    });
                // Update existing images
                const updatePromises = userImages
                    .filter((img) => img.user_image_id)
                    .map((img) => {
                        return instance.post('/user-image/update-image', {
                            user_image_id: img.user_image_id,
                            path: img.url || img.path,
                            is_featured: img.is_featured,
                        });
                    });
                await Promise.all([...uploadPromises, ...updatePromises]);
                // Always reload images from server after upload/update
                await loadUserImages();
            }
            showSnackbar('Thông tin đã được cập nhật thành công', 'success');
            // Reload profile data to ensure we have the latest state
            await loadProfileData();
            await loadPriority();
        } catch (error) {
            console.error('Error updating profile:', error);
            let errorMsg = 'Cập nhật thông tin không thành công';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMsg += ': ' + error.response.data;
                } else if (error.response.data.message) {
                    errorMsg += ': ' + error.response.data.message;
                } else {
                    errorMsg += ': ' + JSON.stringify(error.response.data);
                }
            }
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const openEditImageDialog = (image) => {
        setSelectedImage(image);
        setOpenImageDialog(true);
    };

    const handleImageUpdate = async () => {
        try {
            setLoading(true);
            await instance.put(`/user-image/update/${selectedImage.id}`, {
                caption: selectedImage.caption,
            });
            loadUserImages();
            setOpenImageDialog(false);
            showSnackbar('Ảnh đã được cập nhật', 'success');
        } catch (error) {
            console.error('Error updating image:', error);
            showSnackbar('Cập nhật ảnh không thành công', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                height: '100vh',
                overflow: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
            }}
        >
            <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                <Box sx={{ textAlign: 'center', mb: 4, mt: 3 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Hồ sơ cá nhân
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Cập nhật thông tin và ảnh của bạn
                    </Typography>
                </Box>
            </Slide>

            {/* Avatar Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Avatar src={userImages.find((img) => img.is_featured)?.path || ''} sx={{ width: 120, height: 120 }} />
            </Box>

            {/* Image Upload Section */}
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: theme.palette.background.paper,
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                    <Reorder sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Quản lý ảnh cá nhân
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" paragraph>
                    • Tải lên ít nhất 3 ảnh về bản thân (tối đa 10 ảnh)
                </Typography>
                <Typography variant="body1" paragraph>
                    • Chọn 1 ảnh làm ảnh đại diện bằng cách nhấn vào biểu tượng ngôi sao
                </Typography>
                <Typography variant="body1">• Kéo thả để sắp xếp thứ tự hiển thị ảnh</Typography>

                {error && (
                    <Fade in={!!error}>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'error.light',
                                borderRadius: 1,
                            }}
                        >
                            <PriorityHigh color="error" sx={{ mr: 1 }} />
                            <Typography color="error">{error}</Typography>
                        </Box>
                    </Fade>
                )}

                {success && (
                    <Fade in={!!success}>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'success.light',
                                borderRadius: 1,
                            }}
                        >
                            <CheckCircle color="success" sx={{ mr: 1 }} />
                            <Typography color="success.main">{success}</Typography>
                        </Box>
                    </Fade>
                )}

                <CloudinaryUploadWidget
                    uwConfig={{
                        cloudName: cloudName,
                        uploadPreset: uploadPreset,
                        multiple: true,
                        maxFiles: 10,
                        sources: ['local', 'url', 'camera'],
                        cropping: true,
                        showAdvancedOptions: true,
                        defaultSource: 'local',
                        styles: {
                            palette: {
                                window: theme.palette.background.paper,
                                windowBorder: theme.palette.divider,
                                tabIcon: theme.palette.primary.main,
                                menuIcons: theme.palette.text.secondary,
                                textDark: theme.palette.text.primary,
                                textLight: theme.palette.common.white,
                                link: theme.palette.primary.main,
                                action: theme.palette.secondary.main,
                                inactiveTabIcon: theme.palette.text.disabled,
                                error: theme.palette.error.main,
                                inProgress: theme.palette.info.main,
                                complete: theme.palette.success.main,
                                sourceBg: theme.palette.background.default,
                            },
                            fonts: {
                                default: {
                                    family: theme.typography.fontFamily,
                                },
                            },
                        },
                    }}
                    onUploadSuccess={handleCloudinaryUpload}
                />

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {userImages.length > 0 && (
                    <Grow in={userImages.length > 0}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'medium', mr: 1 }}>
                                    Ảnh của bạn
                                </Typography>
                                <Chip
                                    label={`${userImages.length}/10`}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="images" direction="horizontal">
                                    {(provided) => (
                                        <Grid
                                            container
                                            spacing={3}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            sx={{ mb: 4 }}
                                        >
                                            {userImages.map((img, index) => (
                                                <Draggable key={index} draggableId={`img-${index}`} index={index}>
                                                    {(provided) => (
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            sm={6}
                                                            md={4}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <motion.div
                                                                whileHover={{ scale: 1.03 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <Card
                                                                    sx={{
                                                                        position: 'relative',
                                                                        borderRadius: 2,
                                                                        overflow: 'hidden',
                                                                        boxShadow: theme.shadows[4],
                                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                                        '&:hover': {
                                                                            boxShadow: theme.shadows[8],
                                                                        },
                                                                    }}
                                                                >
                                                                    <CardMedia
                                                                        component="img"
                                                                        image={img.url || img.path}
                                                                        alt={`Preview ${index + 1}`}
                                                                        sx={{
                                                                            height: 220,
                                                                            objectFit: 'cover',
                                                                        }}
                                                                    />

                                                                    <CardActions
                                                                        sx={{
                                                                            justifyContent: 'space-between',
                                                                            bgcolor: 'background.paper',
                                                                            p: 1,
                                                                        }}
                                                                    >
                                                                        <Tooltip
                                                                            title={
                                                                                img.is_featured
                                                                                    ? 'Ảnh đại diện'
                                                                                    : 'Đặt làm ảnh đại diện'
                                                                            }
                                                                            TransitionComponent={Zoom}
                                                                        >
                                                                            <IconButton
                                                                                onClick={() => handleSetFeatured(index)}
                                                                                color={
                                                                                    img.is_featured
                                                                                        ? 'warning'
                                                                                        : 'default'
                                                                                }
                                                                                disabled={loading}
                                                                            >
                                                                                {img.is_featured ? (
                                                                                    <Star />
                                                                                ) : (
                                                                                    <StarBorder />
                                                                                )}
                                                                            </IconButton>
                                                                        </Tooltip>

                                                                        <Tooltip
                                                                            title="Xóa ảnh"
                                                                            TransitionComponent={Zoom}
                                                                        >
                                                                            <IconButton
                                                                                onClick={() => handleDelete(index)}
                                                                                color="error"
                                                                                disabled={loading}
                                                                            >
                                                                                <Delete />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </CardActions>

                                                                    {img.is_featured && (
                                                                        <Box
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: 8,
                                                                                left: 8,
                                                                                bgcolor: 'warning.main',
                                                                                color: 'white',
                                                                                px: 1,
                                                                                borderRadius: 1,
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 'bold',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <Star
                                                                                sx={{
                                                                                    fontSize: '1rem',
                                                                                    mr: 0.5,
                                                                                }}
                                                                            />
                                                                            Ảnh đại diện
                                                                        </Box>
                                                                    )}
                                                                </Card>
                                                            </motion.div>
                                                        </Grid>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </Grid>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </Box>
                    </Grow>
                )}
            </Paper>

            {/* Profile Form Section */}
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: theme.palette.background.paper,
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Thông tin cá nhân
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                        label="Họ và Tên"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Ngày Sinh"
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel id="sex">Giới Tính</InputLabel>
                        <Select
                            labelId="sex"
                            value={profileData.sex}
                            onChange={(e) => handleInputChange('sex', e.target.value)}
                            label="Giới tính"
                        >
                            <MenuItem value="male">Nam</MenuItem>
                            <MenuItem value="female">Nữ</MenuItem>
                            <MenuItem value="other">Khác</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Trường Học"
                        value={profileData.school}
                        onChange={(e) => handleInputChange('school', e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Chuyên Ngành"
                        value={profileData.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Slogan"
                        value={profileData.slogan}
                        onChange={(e) => handleInputChange('slogan', e.target.value)}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel id="needs">Nhu Cầu</InputLabel>
                        <Select
                            labelId="needs"
                            value={profileData.needs}
                            label="Nhu Cầu"
                            onChange={(e) => handleInputChange('needs', e.target.value)}
                        >
                            <MenuItem value="findTutor">Tìm người kèm môn</MenuItem>
                            <MenuItem value="studyBuddy">Tìm bạn cùng tiến</MenuItem>
                            <MenuItem value="sharedHobby">Tìm bạn chung sở thích</MenuItem>
                        </Select>
                    </FormControl>

                    <Typography>Sở Thích:</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {Object.entries(profileData.favoriteHobbies).map(([hobby, isActive]) => (
                            <Chip
                                key={hobby}
                                label={hobby}
                                onClick={() => toggleHobby(hobby)}
                                color={isActive ? 'primary' : 'default'}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>

                    <Typography>Thể Loại Phim Yêu Thích:</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {Object.entries(profileData.favoriteMovies).map(([genre, isActive]) => (
                            <Chip
                                key={genre}
                                label={genre}
                                onClick={() => toggleMovieGenre(genre)}
                                color={isActive ? 'primary' : 'default'}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6">Ưu tiên khi tìm đối tượng phù hợp:</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Ưu tiên Sở thích</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Ưu tiên Sở thích</InputLabel>
                                <Select
                                    value={priority.hobbies}
                                    label="Ưu tiên Sở thích"
                                    onChange={e => setPriority(p => ({ ...p, hobbies: e.target.value }))}
                                >
                                    {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Ưu tiên Thể loại phim</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Ưu tiên Thể loại phim</InputLabel>
                                <Select
                                    value={priority.movieGenres}
                                    label="Ưu tiên Thể loại phim"
                                    onChange={e => setPriority(p => ({ ...p, movieGenres: e.target.value }))}
                                >
                                    {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Ưu tiên Nhu cầu</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Ưu tiên Nhu cầu</InputLabel>
                                <Select
                                    value={priority.needs}
                                    label="Ưu tiên Nhu cầu"
                                    onChange={e => setPriority(p => ({ ...p, needs: e.target.value }))}
                                >
                                    {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Ưu tiên Trường học</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Ưu tiên Trường học</InputLabel>
                                <Select
                                    value={priority.school}
                                    label="Ưu tiên Trường học"
                                    onChange={e => setPriority(p => ({ ...p, school: e.target.value }))}
                                >
                                    {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Ưu tiên Vị trí</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Ưu tiên Vị trí</InputLabel>
                                <Select
                                    value={priority.location}
                                    label="Ưu tiên Vị trí"
                                    onChange={e => setPriority(p => ({ ...p, location: e.target.value }))}
                                >
                                    {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[8],
                            },
                        }}
                        startIcon={loading ? <CircularProgress size={24} /> : null}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu Thông Tin'}
                    </Button>
                </Box>
            </Paper>

            {/* Edit Image Dialog */}
            <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
                <DialogTitle>Chỉnh sửa ảnh</DialogTitle>
                <DialogContent>
                    {selectedImage && (
                        <Box sx={{ mt: 2 }}>
                            <img
                                src={selectedImage.url || selectedImage.path}
                                alt="Selected"
                                style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                }}
                            />
                            <TextField
                                label="Chú thích"
                                fullWidth
                                margin="normal"
                                value={selectedImage.caption || ''}
                                onChange={(e) =>
                                    setSelectedImage({
                                        ...selectedImage,
                                        caption: e.target.value,
                                    })
                                }
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImageDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleImageUpdate}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        Lưu thay đổi
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Profile;
