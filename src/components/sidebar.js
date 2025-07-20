import { ExitToApp, Home, Message, Notifications, Person, Settings, Timelapse, Favorite } from '@mui/icons-material';
import { Badge, Box, Divider, List, ListItem, Typography, IconButton, ListItems  } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import StateContext from '../context/context.context';
import { changeComponent, loggout } from '../context/action.context';
// import LikedYouSidebar from './LikedYouSidebar';

const Sidebar = () => {
    const [selectedComponent, setSelectedComponent] = useState('home');
    // const [likedSidebarOpen, setLikedSidebarOpen] = useState(false);
    const [state, dispatchState] = useContext(StateContext);
    const commonStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: 'hsl(210deg 100% 45.1%)',
        margin: '10px 0px',
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: 'hsl(210deg 100% 95%)',
            transform: 'scale(1.02)',
            cursor: 'pointer',
        },
    };

    const activeStyle = {
        backgroundColor: 'hsl(210deg 100% 95%)',
    };

    const handleChangeComponent = (e) => {
        e.stopPropagation();
        const selected = e.currentTarget.id;
        dispatchState(changeComponent(selected));
        setSelectedComponent(selected);
    };

    return (
        <>
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRight: '2px solid #e6f2ff',
                }}
            >
                <Box sx={{ height: '70%' }}>
                    <List sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Existing sidebar items */}
                        {[
                            { id: 'home', icon: <Home />, label: 'HOME' },
                            { id: 'profile', icon: <Person />, label: 'PROFILE' },
                            { id: 'message', icon: <Message />, label: 'MESSAGE' },
                            { id: 'quickChat', icon: <Timelapse />, label: 'QUICK CHAT' },
                            {
                                id: 'notification',
                                icon: (
                                    <Badge badgeContent={4} color="primary">
                                        <Notifications />
                                    </Badge>
                                ),
                                label: 'NOTIFICATION',
                            },
                            {id:'like-you', icon: <Favorite />, label: 'LIKED YOU'},
                        ].map((item) => (
                            <ListItem
                                key={item.id}
                                id={item.id}
                                onClick={handleChangeComponent}
                                sx={{
                                    ...commonStyle,
                                    ...(selectedComponent === item.id && activeStyle),
                                }}
                            >
                                {item.icon}
                                <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>{item.label}</Typography>
                            </ListItem>
                        ))}
                        {/* Liked You sidebar button */}
                       
                    </List>
                </Box>
            <Divider />
            <Box sx={{ height: '30%' }}>
                <List sx={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>
                    <ListItem
                        id="setting"
                        onClick={handleChangeComponent}
                        sx={{
                            ...commonStyle,
                            ...(selectedComponent === 'setting' && activeStyle),
                        }}
                    >
                        <Settings />
                        <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>SETTING</Typography>
                    </ListItem>
                    <ListItem
                        sx={commonStyle}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatchState(loggout(''));
                        }}
                    >
                        <ExitToApp />
                        <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>LOG OUT</Typography>
                    </ListItem>
                </List>
            </Box>
        </Box>
            {/* LikedYouSidebar is now rendered in MainLayout as a main component */}
        </>
    );
};

export default Sidebar;
