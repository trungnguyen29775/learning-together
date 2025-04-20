import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Box,
    Button,
    Card,
    CardMedia,
    CardActions,
    Container,
    Grid,
    IconButton,
    Typography,
    Paper,
    Avatar,
    Chip,
    Divider,
    Tooltip,
    Zoom,
    Fade,
    Slide,
    Grow,
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    Delete,
    Star,
    StarBorder,
    CloudUpload,
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

const ImageUploadPage = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const cloudName = 'dmoqywl3c';
    const uploadPreset = 'learning-together';
    const theme = useTheme();
    const [state, dispatchState] = useContext(StateContext);
    const navigate = useNavigate();
    const handleCloudinaryUpload = (info) => {
        setError('');
        setSuccess('');

        if (images.length >= 10) {
            setError('Bạn chỉ có thể tải lên tối đa 10 ảnh');
            return;
        }

        const newImage = {
            url: info.secure_url,
            publicId: info.public_id,
            isFeatured: images.length === 0,
        };

        setImages((prev) => [...prev, newImage]);
        setSuccess('Ảnh đã được tải lên thành công!');
        setTimeout(() => {
            setSuccess('');
        }, 3000);
    };

    const handleDeleteFromServer = async (imageId) => {
        try {
            await instance.post('/user-image/delete-image', {
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
            const newImages = [...images];
            const [removed] = newImages.splice(index, 1);

            if (removed.user_image_id) {
                await handleDeleteFromServer(removed.user_image_id);
            }

            if (removed.isFeatured && newImages.length > 0) {
                newImages[0].isFeatured = true;
                if (newImages[0].user_image_id) {
                    await instance.post('/user-image/update-image', {
                        user_image_id: newImages[0].user_image_id,
                        is_featured: true,
                    });
                }
            }

            setImages(newImages);
        } catch (err) {
            setError('Xóa ảnh không thành công');
        } finally {
            setLoading(false);
        }
    };

    const handleSetFeatured = async (index) => {
        try {
            setLoading(true);
            const newImages = images.map((img, i) => ({
                ...img,
                isFeatured: i === index,
            }));

            // Reset all featured images first
            await Promise.all(
                images.map((img) => {
                    if (img.user_image_id && img.isFeatured) {
                        return instance.post('/user-image/update-image', {
                            user_image_id: img.user_image_id,
                            is_featured: false,
                        });
                    }
                    return Promise.resolve();
                }),
            );

            // Set new featured image
            if (images[index].user_image_id) {
                await instance.post('/user-image/update-image', {
                    user_image_id: images[index].user_image_id,
                    is_featured: true,
                });
            }

            setImages(newImages);
        } catch (err) {
            console.error('Error updating featured image:', err);
            setError('Cập nhật ảnh đại diện không thành công');
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const newImages = [...images];
        const [reorderedItem] = newImages.splice(result.source.index, 1);
        newImages.splice(result.destination.index, 0, reorderedItem);
        setImages(newImages);
    };

    const handleSubmit = async () => {
        if (images.length < 3) {
            setError('Vui lòng tải lên ít nhất 3 ảnh');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const userId = state.userData.user_id;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Upload new images
            const uploadPromises = images
                .filter((img) => !img.user_image_id) // Only upload new images
                .map((img, index) => {
                    return instance.post('/user-image/create-image', {
                        user_id: userId,
                        path: img.url,
                        is_featured: img.isFeatured,
                    });
                });

            // Update existing images order and featured status
            const updatePromises = images
                .filter((img) => img.user_image_id)
                .map((img, index) => {
                    return instance.post('/user-image/update-image', {
                        user_image_id: img.user_image_id,
                        is_featured: img.isFeatured,
                    });
                });

            await Promise.all([...uploadPromises, ...updatePromises]);

            setSuccess('Ảnh đã được lưu thành công!');

            setTimeout(() => {
                setSuccess('');
                setTimeout(() => navigate('/'), 1000);
            }, 3000);
        } catch (err) {
            console.error('Error uploading images:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu ảnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadUserImages = async () => {
            try {
                setLoading(true);
                const userId = state.userData?.user_id;
                if (!userId) return;

                const response = await instance.get(`/user-image/get-user-images/${userId}`);
                if (response.data && response.data.length > 0) {
                    const loadedImages = response.data.map((img) => ({
                        url: img.path,
                        user_image_id: img.user_image_id,
                        isFeatured: img.is_featured,
                    }));
                    setImages(loadedImages);
                }
            } catch (err) {
                console.error('Error loading user images:', err);
            } finally {
                setLoading(false);
            }
        };

        loadUserImages();
    }, [state.userData]);

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
                        Bộ sưu tập ảnh cá nhân
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Chia sẻ những khoảnh khắc đáng nhớ của bạn
                    </Typography>
                </Box>
            </Slide>

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
                    Hướng dẫn tải ảnh
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
            </Paper>

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

            {images.length > 0 && (
                <Grow in={images.length > 0}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'medium', mr: 1 }}>
                                Ảnh của bạn
                            </Typography>
                            <Chip
                                label={`${images.length}/10`}
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
                                        {images.map((img, index) => (
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
                                                                    image={img.url}
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
                                                                            img.isFeatured
                                                                                ? 'Ảnh đại diện'
                                                                                : 'Đặt làm ảnh đại diện'
                                                                        }
                                                                        TransitionComponent={Zoom}
                                                                    >
                                                                        <IconButton
                                                                            onClick={() => handleSetFeatured(index)}
                                                                            color={
                                                                                img.isFeatured ? 'warning' : 'default'
                                                                            }
                                                                            disabled={loading}
                                                                        >
                                                                            {img.isFeatured ? <Star /> : <StarBorder />}
                                                                        </IconButton>
                                                                    </Tooltip>

                                                                    <Tooltip title="Xóa ảnh" TransitionComponent={Zoom}>
                                                                        <IconButton
                                                                            onClick={() => handleDelete(index)}
                                                                            color="error"
                                                                            disabled={loading}
                                                                        >
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </CardActions>

                                                                {img.isFeatured && (
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

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleSubmit}
                                    disabled={images.length < 3 || loading}
                                    sx={{
                                        px: 6,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        boxShadow: theme.shadows[4],
                                        '&:hover': {
                                            boxShadow: theme.shadows[8],
                                        },
                                        marginBottom: '20px',
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Hoàn thành'}
                                </Button>
                            </motion.div>
                        </Box>
                    </Box>
                </Grow>
            )}
        </Container>
    );
};

export default ImageUploadPage;
