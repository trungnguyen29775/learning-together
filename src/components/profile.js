import {
    Box,
    Button,
    Card,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import instance from '../axios/instance';
import StateContext from '../context/context.context';

// Danh sách sở thích và thể loại phim
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

const Profile = () => {
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

    const [state] = useContext(StateContext);

    useEffect(() => {
        if (state.userData) {
            setProfileData({
                name: state.userData.name || '',
                dob: state.userData.dob ? state.userData.dob.split('T')[0] : '', // Chuyển đổi format ngày sinh
                sex: state.userData.sex || '',
                school: state.userData.school || '',
                major: state.userData.major || '',
                slogan: state.userData.slogan || '',
                needs: state.userData.needs || '',
                favoriteHobbies: hobbiesList.reduce((acc, hobby) => {
                    acc[hobby] = !!state.userData[hobby]; // Chuyển thành boolean
                    return acc;
                }, {}),
                favoriteMovies: movieGenresList.reduce((acc, genre) => {
                    acc[genre] = !!state.userData[genre]; // Chuyển thành boolean
                    return acc;
                }, {}),
            });
        }
    }, [state.userData]);

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

    const handleSubmit = () => {
        instance
            .post('/update-profile', { email: state.userData.email, ...profileData })
            .then(() => {
                alert('Profile updated successfully!');
            })
            .catch((error) => {
                console.error('Error updating profile:', error);
                alert('Failed to update profile.');
            });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '150px',
                marginBottom: '50px',
            }}
        >
            <Card sx={{ width: '80%', padding: '20px' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Profile
                </Typography>

                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                        label="Họ và Tên"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />

                    <TextField
                        label="Ngày Sinh"
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                    />

                    <FormControl>
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
                    />

                    <TextField
                        label="Chuyên Ngành"
                        value={profileData.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                    />

                    <TextField
                        label="Slogan"
                        value={profileData.slogan}
                        onChange={(e) => handleInputChange('slogan', e.target.value)}
                    />

                    <FormControl>
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
                                sx={{
                                    width: 'fit-content',
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    margin: '5px',
                                    backgroundColor: isActive ? 'hsl(210deg 100% 95%)' : '',
                                    '&:hover': { cursor: 'pointer', backgroundColor: 'hsl(210deg 100% 95%)' },
                                }}
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
                                sx={{
                                    width: 'fit-content',
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    margin: '5px',
                                    backgroundColor: isActive ? 'hsl(210deg 100% 95%)' : '',
                                    '&:hover': { cursor: 'pointer', backgroundColor: 'hsl(210deg 100% 95%)' },
                                }}
                            />
                        ))}
                    </Box>

                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Lưu Thông Tin
                    </Button>
                </Box>
            </Card>
        </Box>
    );
};

export default Profile;
