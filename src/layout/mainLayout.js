import { Box, Card } from '@mui/material';
import TinderCards from '../components/swiper';
import { useContext, useEffect } from 'react';
import StateContext from '../context/context.context';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import Profile from '../components/profile';
import Message from '../components/message';
import Notification from '../components/notification';
import Setting from '../components/setting';

const MainLayout = () => {
    const [state, dispatchState] = useContext(StateContext);
    const notifications = [
        { avatarSrc: '/path/to/avatar1.jpg', username: 'Alice', content: 'Alice nhắn tin cho bạn.' },
        { avatarSrc: '/path/to/avatar2.jpg', username: 'Bob', content: 'Bob đã được ghép đôi với bạn.' },
        { avatarSrc: '/path/to/avatar3.jpg', username: 'Charlie', content: 'Charlie đã theo dõi bạn.' },
    ];
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
                <Box sx={{ height: '100%', minWidth: '60%', maxWidth: '80%' }}>
                    <TinderCards />
                </Box>
            ) : state.currentComponent === 'message' ? (
                <Box sx={{ height: '100%', flex: 1 }}>
                    <Message />
                </Box>
            ) : state.currentComponent === 'notification' ? (
                <Box sx={{ height: '100%', flex: 1, overflow: 'auto' }}>
                    {notifications.map((notification, index) => (
                        <Notification
                            key={index}
                            avatarSrc={notification.avatarSrc}
                            username={notification.username}
                            notificationContent={notification.content}
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
