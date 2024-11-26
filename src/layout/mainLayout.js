import { Box, Card } from '@mui/material';
import TinderCards from '../components/swiper';
import { useContext, useEffect } from 'react';
import StateContext from '../context/context.context';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';

const MainLayout = () => {
    const [state, dispatchState] = useContext(StateContext);
    const navigate = useNavigate();
    // useEffect(() => {
    //     if (state.login === false) {
    //         navigate('/login');
    //     }
    // }, [state]);

    return (
        <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ height: '100%', minWidth: '250px' }}>
                <Sidebar />
            </Box>
            <Box sx={{ height: '100%', minWidth: '60%', maxWidth: '80%' }}>
                <TinderCards />
            </Box>
        </Box>
    );
};
export default MainLayout;
