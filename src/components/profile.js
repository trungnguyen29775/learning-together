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
import { useState } from 'react';

const Profile = () => {
    const [profileData, setProfileData] = useState({
        name: 'Nguyễn Vũ Quang Huy',
        dob: '2024-12-12',
        sex: 'male',
        school: 'Thpt Hung Vuong',
        major: 'Cong nghe thong tin',
        slogan: 'Hello',
        needs: 'findTutor',
        favoriteHobbies: {
            music: false,
            game: true,
            sing: true,
            eat: true,
            exercise: true,
            running: true,
            badminton: true,
            walking: true,
            basketball: true,
            pets: true,
        },
        favoriteMovies: {
            action: false,
            anime: false,
            detective: true,
            fantasy: false,
            horror: false,
            romance: true,
        },
    });

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
        console.log('Updated Profile Data:', profileData);
        alert('Profile updated successfully!');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
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
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControl>
                        <InputLabel id="sex">Giới Tính</InputLabel>
                        <Select
                            labelId="sex"
                            label="Giới Tính"
                            value={profileData.sex}
                            onChange={(e) => handleInputChange('sex', e.target.value)}
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
                            label="Nhu Cầu"
                            value={profileData.needs}
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
                                    '&:hover': {
                                        cursor: 'pointer',
                                        backgroundColor: 'hsl(210deg 100% 95%)',
                                    },
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
                                    '&:hover': {
                                        cursor: 'pointer',
                                        backgroundColor: 'hsl(210deg 100% 95%)',
                                    },
                                }}
                            />
                        ))}
                    </Box>

                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Lưu Thay Đổi
                    </Button>
                </Box>
            </Card>
        </Box>
    );
};

export default Profile;
