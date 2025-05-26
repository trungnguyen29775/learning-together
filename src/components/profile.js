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
        }
    }, [state.userData]);

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

        setUserImages((prev) => [...prev, newImage]);
        showSnackbar('Ảnh đã được tải lên thành công!', 'success');
    };

    const handleDeleteFromServer = async (imageId) => {
        try {
            await instance.delete('/user-image/delete-image', {
                user_image_id: imageId,
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

            setUserImages(newImages);
            showSnackbar('Ảnh đã được xóa thành công', 'success');
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
                    is_featured: true,
                });
            }

            setUserImages(newImages);
            showSnackbar('Đã cập nhật ảnh đại diện', 'success');
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
            await instance.post('/update-profile', {
                email: state.userData.email,
                ...profileData,
            });

            // Save images
            if (userImages.length > 0) {
                // Upload new images
                const uploadPromises = userImages
                    .filter((img) => !img.user_image_id)
                    .map((img) => {
                        return instance.post('/user-image/create-image', {
                            user_id: state.userData.user_id,
                            path: img.url,
                            is_featured: img.is_featured,
                        });
                    });

                // Update existing images
                const updatePromises = userImages
                    .filter((img) => img.user_image_id)
                    .map((img) => {
                        return instance.post('/user-image/update-image', {
                            user_image_id: img.user_image_id,
                            is_featured: img.is_featured,
                        });
                    });

                await Promise.all([...uploadPromises, ...updatePromises]);
            }

            showSnackbar('Thông tin đã được cập nhật thành công', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showSnackbar('Cập nhật thông tin không thành công', 'error');
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
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            mb: 2,
                            mx: 'auto',
                            bgcolor: theme.palette.primary.main,
                            marginTop: '20px',
                        }}
                    >
                        <PhotoLibrary fontSize="large" />
                    </Avatar>
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
