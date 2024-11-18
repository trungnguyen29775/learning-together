import { Box } from '@mui/material';
import TinderCards from '../components/swiper/swiper';
import { useContext, useEffect } from 'react';
import StateContext from '../context/context.context';
import { useNavigate } from 'react-router-dom';

const MainLayout = () => {
    const [state, dispatchState] = useContext(StateContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (state.login === false) {
            navigate('/login');
        }
    }, [state]);

    return (
        <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ height: '100%', width: '20%' }}></Box>
            <Box sx={{ height: '100%', width: '80%' }}>
                <TinderCards />
            </Box>
        </Box>
    );
};
export default MainLayout;
