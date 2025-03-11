import {
    Autocomplete,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    FormControl,
    Input,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import instance from '../axios/instance';
import StateContext from '../context/context.context';
import { useNavigate } from 'react-router-dom';
import { getDataUser } from '../context/action.context';

const Hobby = () => {
    const [sex, setSex] = useState('male');
    const [needs, setNeeds] = useState('findTutor');
    const [state, dispatchState] = useContext(StateContext);
    const navigate = useNavigate();
    const [data, setData] = useState({
        favorite: [
            {
                value: 'music',
                status: false,
                label: 'Nghe nhạc',
            },
            {
                value: 'game',
                status: false,
                label: 'Chơi game',
            },
            {
                value: 'sing',
                status: false,
                label: 'Ca hát',
            },
            {
                value: 'eat',
                status: false,
                label: 'Ăn uống',
            },
            {
                value: 'exercise',
                status: false,
                label: 'Tập thể dục',
            },
            {
                value: 'running',
                status: false,
                label: 'Chạy bộ',
            },
            {
                value: 'badminton',
                status: false,
                label: 'Cầu lông',
            },
            {
                value: 'walking',
                status: false,
                label: 'Đi dạo',
            },
            {
                value: 'beach',
                status: false,
                label: 'Đi biển',
            },
            {
                value: 'hiking',
                status: false,
                label: 'Leo núi',
            },
            {
                value: 'travel',
                status: false,
                label: 'Du lịch',
            },
            {
                value: 'reading',
                status: false,
                label: 'Đọc sách',
            },
            {
                value: 'pets',
                status: false,
                label: 'Chó/Mèo',
            },
            {
                value: 'basketball',
                status: false,
                label: 'Bóng rổ',
            },
            {
                value: 'pickelBall',
                status: false,
                label: 'Pickel Balls',
            },
        ],
        typeFilm: [
            {
                value: 'horror',
                status: false,
                label: 'Phim kinh dị',
            },
            {
                value: 'anime',
                status: false,
                label: 'Anime',
            },
            {
                value: 'romance',
                status: false,
                label: 'Lãng mạn/Tình cảm',
            },
            {
                value: 'action',
                status: false,
                label: 'Hành động',
            },
            {
                value: 'detective',
                status: false,
                label: 'Trinh thám',
            },
            {
                value: 'fantasy',
                status: false,
                label: 'Giả tưởng',
            },
        ],
    });

    useEffect(() => {
        console.log(state);
    }, [state]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const { dob, school, major, slogan } = e.target;

        if (!dob.value || !school.value || !major.value) {
            alert('All fields are required!');
            return;
        }

        const formData = {
            dob: dob.value,
            school: school.value,
            needs,
            major: major.value,
            sex,
            typeFilm: data.typeFilm,
            favorite: data.favorite,
            slogan: slogan.value,
        };
        instance
            .post('/update-hobby', { ...formData, email: state.userData.email, user_id: state.userData.user_id })
            .then((res) => {
                dispatchState(getDataUser(res.data));
                navigate('/');
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const toggleTypeFilm = (index) => {
        const updatedFilms = [...data.typeFilm];
        updatedFilms[index].status = !updatedFilms[index].status;
        setData({ ...data, typeFilm: updatedFilms });
    };

    const toggleFavorite = (index) => {
        const updatedFavorites = [...data.favorite];
        updatedFavorites[index].status = !updatedFavorites[index].status;
        setData({ ...data, favorite: updatedFavorites });
    };
    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                color: 'hsl(210deg 100% 45.1%)',
                alignItems: 'center',
            }}
        >
            <Card
                sx={{
                    display: 'flex',
                    color: 'hsl(210deg 100% 45.1%)',
                    alignItems: 'center',
                    flexDirection: 'column',
                    margin: 'auto',
                    height: '90%',
                    overflowY: 'auto',
                    width: '70%',
                    minWidth: '500px',
                    minHeight: '500px',
                    padding: '10px',
                    boxSizing: 'border-box',
                }}
            >
                <form
                    onSubmit={(e) => handleSubmit(e)}
                    sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
                >
                    <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '20px' }}>
                        Sao kê thông tin của bạn ^^
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            alignItems: 'center',
                            margin: '15px 0px',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                margin: '15px 10px',
                            }}
                        >
                            <Typography>Ngày sinh:</Typography>
                            <TextField required id="dob" type="date" sx={{ width: 300, marginLeft: '10px' }} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                margin: '15px 10px',
                            }}
                        >
                            <Typography>Giới tính:</Typography>
                            <FormControl sx={{ marginLeft: '10px' }}>
                                <InputLabel id="sex-select-label">Giới tính</InputLabel>
                                <Select
                                    labelId="sex-select-label"
                                    id="sex"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                    label="Giới tính"
                                    sx={{ width: 300 }}
                                >
                                    <MenuItem value="male">Nam</MenuItem>
                                    <MenuItem value="female">Nữ</MenuItem>
                                    <MenuItem value="ohter">Khác</MenuItem>
                                    <MenuItem value="prefer_not_to_say">Chưa muốn tiết lộ</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                margin: '15px 10px',
                                width: '100%',
                            }}
                        >
                            <Typography>Trường học hiện tại:</Typography>
                            <TextField
                                required
                                sx={{ flex: 1, marginLeft: '10px' }}
                                id="school"
                                label="Trường học hiện tại"
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                margin: '15px 10px',
                                width: '100%',
                            }}
                        >
                            <Typography>Chuyên ngành:</Typography>
                            <TextField
                                required
                                id="major"
                                sx={{ marginLeft: '10px', flex: 1 }}
                                label="Chuyên ngành (chuyên ngành mong muốn)"
                            />
                        </Box>
                    </Box>

                    <Typography>Sở thích của bạn:</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            margin: '10px 0px',
                            flexWrap: 'wrap',
                        }}
                    >
                        {data.favorite.map((item, index) => (
                            <Chip
                                key={index}
                                sx={{
                                    width: 'fit-content',
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    margin: '5px',
                                    backgroundColor: item.status === true ? 'hsl(210deg 100% 95%)' : '',
                                    '&:hover': {
                                        cursor: 'pointer',
                                        backgroundColor: 'hsl(210deg 100% 95%)',
                                    },
                                }}
                                label={item.label}
                                onClick={() => toggleFavorite(index)}
                            />
                        ))}
                    </Box>

                    <Typography>Thể loại phim yêu thích:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0px' }}>
                        {data.typeFilm.map((item, index) => (
                            <Chip
                                key={index}
                                label={item.label}
                                sx={{
                                    width: 'fit-content',
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    margin: '5px',
                                    backgroundColor: item.status === true ? 'hsl(210deg 100% 95%)' : '',
                                    '&:hover': {
                                        cursor: 'pointer',
                                        backgroundColor: 'hsl(210deg 100% 95%)',
                                    },
                                }}
                                onClick={() => toggleTypeFilm(index)}
                            />
                        ))}
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            margin: '20px 10px',
                        }}
                    >
                        <Typography>Mong muốn tìm kiếm bạn: </Typography>
                        <FormControl sx={{ flex: 1, marginLeft: '10px' }}>
                            <InputLabel id="needs-select-label">Mong muốn</InputLabel>
                            <Select
                                labelId="needs-select-label"
                                id="needs"
                                value={needs}
                                onChange={(e) => setNeeds(e.target.value)}
                                label="Mong muốn"
                            >
                                <MenuItem value="findTutor">Tìm người kèm môn</MenuItem>
                                <MenuItem value="studyBuddy">Tìm bạn cùng tiến</MenuItem>
                                <MenuItem value="sharedHobby">Tìm bạn chung sở thích</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            margin: '15px 10px',
                            width: '100%',
                        }}
                    >
                        <Typography>Giới thiệu về bản thân bạn {'(hoặc một câu slogan mà bạn tâm đắc):'}</Typography>
                        <TextField id="slogan" sx={{ marginLeft: '10px', flex: 1, marginTop: '10px' }} label="Bio" />
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '20px',
                            marginBottom: '15px',
                        }}
                    >
                        <Button sx={{ width: '90%', margin: 'auto' }} variant="contained" type="submit">
                            Tiếp theo
                        </Button>
                    </Box>
                </form>
            </Card>
        </Box>
    );
};

export default Hobby;
