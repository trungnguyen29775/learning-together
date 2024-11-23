import { Home, Message } from '@mui/icons-material';
import { Box, Divider, List, ListItem, Typography } from '@mui/material';

const Sidebar = () => {
    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ height: '70%' }}>
                <List sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <ListItem
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            color: 'hsl(210deg 100% 45.1%)',
                            margin: '10px 0px',
                            backgroundColor: 'hsl(210deg 100% 95%)',
                            borderRadius: '5px',
                            '&:hover': {
                                backgroundColor: 'hsl(210deg 100% 95%)',
                                transform: 'scale(1.02)',
                                cursor: 'pointer',
                            },
                        }}
                    >
                        <Home />
                        <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>HOME</Typography>
                    </ListItem>

                    <ListItem
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            color: 'hsl(210deg 100% 45.1%)',
                            margin: '5px 0px',
                            borderRadius: '5px',

                            '&:hover': {
                                backgroundColor: 'hsl(210deg 100% 95%)',
                                transform: 'scale(1.02)',
                                cursor: 'pointer',
                            },
                        }}
                    >
                        <Message />
                        <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>MESSAGE</Typography>
                    </ListItem>
                </List>
            </Box>
            <Divider orientation="horirontal" />
            <Box sx={{ height: '30%' }}>
                <List sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <ListItem
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            color: 'hsl(210deg 100% 45.1%)',
                            margin: '10px 0px',
                            backgroundColor: 'hsl(210deg 100% 95%)',
                            borderRadius: '5px',
                            '&:hover': {
                                backgroundColor: 'hsl(210deg 100% 95%)',
                                transform: 'scale(1.02)',
                                cursor: 'pointer',
                            },
                        }}
                    >
                        <Home />
                        <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>HOME</Typography>
                    </ListItem>

                    <ListItem
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            color: 'hsl(210deg 100% 45.1%)',
                            margin: '5px 0px',
                            borderRadius: '5px',

                            '&:hover': {
                                backgroundColor: 'hsl(210deg 100% 95%)',
                                transform: 'scale(1.02)',
                                cursor: 'pointer',
                            },
                        }}
                    >
                        <Message />
                        <Typography sx={{ marginLeft: '10px', fontWeight: '600' }}>MESSAGE</Typography>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
};

export default Sidebar;
