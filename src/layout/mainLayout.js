import { Box, Card } from '@mui/material';
import TinderCards from '../components/swiper';
import { useContext, useEffect, useState } from 'react';
import StateContext from '../context/context.context';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import Profile from '../components/profile';
import Message from '../components/message';
import Notification from '../components/notification';
import Setting from '../components/setting';
import instance from '../axios/instance';

const MainLayout = () => {
    const [state, dispatchState] = useContext(StateContext);
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        if (state.login) {
            instance
                .get(`/get-notification-by-user/${state.userData.user_id}`)
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [state]);

    const navigate = useNavigate();
    useEffect(() => {
        if (state.login === false) {
            navigate('/login');
        }
    }, [state]);

    return (
        <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ height: '100%', minWidth: '250px' }}>
                <Sidebar />
            </Box>
            {state.currentComponent === 'home' ? (
                <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <TinderCards />
                </Box>
            ) : state.currentComponent === 'message' ? (
                <Box sx={{ height: '100%', flex: 1 }}>
                    <Message />
                </Box>
            ) : state.currentComponent === 'notification' ? (
                <Box sx={{ height: '100%', flex: 1, overflow: 'auto' }}>
                    {notifications?.map((notification, index) => (
                        <Notification
                            key={index}
                            avatarSrc={notification.img_path ? notification.img_path : ''}
                            // username={notification.status}
                            notificationContent={notification.text}
                        />
                    ))}
                </Box>
            ) : state.currentComponent === 'profile' ? (
                <Box sx={{ height: '100%', flex: 1, overflow: 'auto' }}>
                    <Profile />
                </Box>
            ) : state.currentComponent === 'setting' ? (
                <Setting />
            ) : (
                ''
            )}
        </Box>
    );
};
export default MainLayout;
